"""
Insight Backend API
Flask приложение для анализа транзакций и определения рискованных паттернов
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
# CORS настройки для работы с Vercel и локальной разработкой
# Разрешаем все origins для Vercel (так как домены могут быть разными)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Разрешаем все домены (для Vercel)
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})

# Получаем абсолютный путь к директории, где находится app.py
# Поддержка запуска из корня проекта (Railway) и из папки backend
if os.path.basename(os.getcwd()) == 'backend':
    BASE_DIR = os.getcwd()
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Конфигурация
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'data', 'uploads')
PROCESSED_FOLDER = os.path.join(BASE_DIR, 'data', 'processed')
EXAMPLES_FOLDER = os.path.join(BASE_DIR, 'examples')
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'txt', 'json'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(EXAMPLES_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size


def allowed_file(filename):
    """Проверка разрешенного расширения файла"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_transactions(file_path, file_type):
    """
    Парсинг транзакций из различных форматов
    Поддерживает CSV, Excel, JSON и текстовые файлы
    """
    transactions = []
    
    try:
        if file_type == 'csv':
            df = pd.read_csv(file_path, encoding='utf-8')
        elif file_type in ['xlsx', 'xls']:
            df = pd.read_excel(file_path)
        elif file_type == 'json':
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                df = pd.DataFrame(data)
        else:  # txt
            df = pd.read_csv(file_path, sep='\t', encoding='utf-8')
        
        # Нормализация колонок (приведение к нижнему регистру)
        df.columns = df.columns.str.lower().str.strip()
        
        # Попытка определить колонки автоматически
        date_col = None
        amount_col = None
        category_col = None
        description_col = None
        
        for col in df.columns:
            col_lower = col.lower()
            if not date_col and ('date' in col_lower or 'дата' in col_lower or 'time' in col_lower):
                date_col = col
            if not amount_col and ('amount' in col_lower or 'сумма' in col_lower or 'price' in col_lower):
                amount_col = col
            if not category_col and ('category' in col_lower or 'категория' in col_lower or 'type' in col_lower):
                category_col = col
            if not description_col and ('description' in col_lower or 'описание' in col_lower or 'name' in col_lower):
                description_col = col
        
        # Если не нашли, используем первые колонки
        if not date_col and len(df.columns) > 0:
            date_col = df.columns[0]
        if not amount_col and len(df.columns) > 1:
            amount_col = df.columns[1]
        if not category_col and len(df.columns) > 2:
            category_col = df.columns[2]
        if not description_col and len(df.columns) > 3:
            description_col = df.columns[3]
        
        # Обработка данных
        for idx, row in df.iterrows():
            try:
                # Парсинг даты
                date_str = str(row[date_col]) if date_col else None
                if date_str:
                    try:
                        date = pd.to_datetime(date_str)
                    except:
                        date = datetime.now()
                else:
                    date = datetime.now()
                
                # Парсинг суммы
                amount_str = str(row[amount_col]) if amount_col else '0'
                amount = float(str(amount_str).replace(',', '.').replace(' ', ''))
                
                category = str(row[category_col]) if category_col else 'Другое'
                description = str(row[description_col]) if description_col else 'Без описания'
                
                transactions.append({
                    'id': idx,
                    'date': date.isoformat(),
                    'amount': amount,
                    'category': category,
                    'description': description,
                    'hour': date.hour,
                    'day_of_week': date.weekday(),  # 0 = Monday, 6 = Sunday
                    'day_name': date.strftime('%A'),
                    'is_weekend': date.weekday() >= 5
                })
            except Exception as e:
                print(f"Ошибка обработки строки {idx}: {e}")
                continue
        
        return transactions
    
    except Exception as e:
        print(f"Ошибка парсинга файла: {e}")
        return []


def analyze_risk_patterns(transactions):
    """
    Анализ паттернов для определения уровня риска
    Использует ML-подход для выявления рискованных покупок
    """
    if not transactions:
        return {
            'risk_level': 'low',
            'risk_score': 0,
            'patterns': [],
            'recommendations': []
        }
    
    df = pd.DataFrame(transactions)
    
    # Признаки для анализа
    features = []
    risk_scores = []
    
    for trans in transactions:
        hour = trans['hour']
        day_of_week = trans['day_of_week']
        amount = abs(trans['amount'])
        is_weekend = trans['is_weekend']
        
        # Вычисление риска на основе паттернов
        risk = 0
        
        # Ночные покупки (22:00 - 6:00) - высокий риск
        if hour >= 22 or hour <= 6:
            risk += 3
        
        # Поздний вечер (20:00 - 22:00) - средний риск
        elif hour >= 20:
            risk += 2
        
        # Вечер (18:00 - 20:00) - низкий риск
        elif hour >= 18:
            risk += 1
        
        # Пятница вечер - дополнительный риск
        if day_of_week == 4 and hour >= 18:  # Пятница
            risk += 2
        
        # Выходные вечером - дополнительный риск
        if is_weekend and hour >= 18:
            risk += 1
        
        # Большие суммы - дополнительный риск
        if amount > 5000:
            risk += 2
        elif amount > 2000:
            risk += 1
        
        risk_scores.append(risk)
        features.append({
            'hour': hour,
            'day_of_week': day_of_week,
            'amount': amount,
            'is_weekend': is_weekend,
            'risk': risk
        })
    
    # Определение общего уровня риска
    avg_risk = np.mean(risk_scores) if risk_scores else 0
    recent_risk = np.mean(risk_scores[-10:]) if len(risk_scores) >= 10 else avg_risk
    
    # Классификация уровня риска
    if recent_risk >= 5:
        risk_level = 'high'
    elif recent_risk >= 3:
        risk_level = 'medium'
    else:
        risk_level = 'low'
    
    # Выявление паттернов
    patterns = []
    
    night_count = sum(1 for t in transactions if t['hour'] >= 22 or t['hour'] <= 6)
    if night_count > len(transactions) * 0.2:
        patterns.append({
            'type': 'night_purchases',
            'description': 'Частые ночные покупки (после 22:00 или до 6:00)',
            'count': night_count,
            'percentage': round(night_count / len(transactions) * 100, 1)
        })
    
    friday_evening = sum(1 for t in transactions if t['day_of_week'] == 4 and t['hour'] >= 18)
    if friday_evening > 0:
        patterns.append({
            'type': 'friday_evening',
            'description': 'Покупки в пятницу вечером',
            'count': friday_evening
        })
    
    high_amount = sum(1 for t in transactions if abs(t['amount']) > 3000)
    if high_amount > len(transactions) * 0.15:
        patterns.append({
            'type': 'high_amount',
            'description': 'Частые крупные покупки (более 3000₽)',
            'count': high_amount,
            'percentage': round(high_amount / len(transactions) * 100, 1)
        })
    
    # Рекомендации
    recommendations = []
    if risk_level == 'high':
        recommendations.append('Высокий риск импульсивных покупок. Рекомендуется отложить крупные покупки до утра.')
    if night_count > 0:
        recommendations.append('Обнаружены ночные покупки. Попробуйте отложить корзину до утра.')
    if friday_evening > 0:
        recommendations.append('Пятничные вечерние покупки могут быть импульсивными. Подумайте перед покупкой.')
    
    return {
        'risk_level': risk_level,
        'risk_score': round(recent_risk, 2),
        'average_risk': round(avg_risk, 2),
        'patterns': patterns,
        'recommendations': recommendations,
        'total_transactions': len(transactions),
        'statistics': {
            'night_purchases': night_count,
            'evening_purchases': sum(1 for t in transactions if t['hour'] >= 18),
            'weekend_purchases': sum(1 for t in transactions if t['is_weekend']),
            'total_amount': round(sum(abs(t['amount']) for t in transactions), 2),
            'average_amount': round(np.mean([abs(t['amount']) for t in transactions]), 2)
        }
    }


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    import socket
    host = socket.gethostname()
    port = request.environ.get('SERVER_PORT', os.getenv('PORT', 'unknown'))
    return jsonify({
        'status': 'ok', 
        'message': 'Insight API is running',
        'port': port,
        'host': host
    }), 200


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Загрузка файла с транзакциями"""
    if 'file' not in request.files:
        return jsonify({'error': 'Файл не найден'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Файл не выбран'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        file_type = filename.rsplit('.', 1)[1].lower()
        transactions = parse_transactions(file_path, file_type)
        
        if not transactions:
            return jsonify({'error': 'Не удалось распарсить транзакции из файла'}), 400
        
        # Сохранение обработанных данных
        processed_path = os.path.join(PROCESSED_FOLDER, f'processed_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        with open(processed_path, 'w', encoding='utf-8') as f:
            json.dump(transactions, f, ensure_ascii=False, indent=2)
        
        # Анализ рисков
        analysis = analyze_risk_patterns(transactions)
        
        return jsonify({
            'success': True,
            'transactions': transactions,
            'analysis': analysis,
            'count': len(transactions)
        })
    
    return jsonify({'error': 'Неподдерживаемый формат файла'}), 400


@app.route('/api/analyze', methods=['POST'])
def analyze_transactions():
    """Анализ загруженных транзакций"""
    data = request.json
    
    if not data or 'transactions' not in data:
        return jsonify({'error': 'Транзакции не предоставлены'}), 400
    
    transactions = data['transactions']
    analysis = analyze_risk_patterns(transactions)
    
    return jsonify({
        'success': True,
        'analysis': analysis
    })


@app.route('/api/statistics', methods=['POST'])
def get_statistics():
    """Получение статистики по транзакциям"""
    data = request.json
    
    if not data or 'transactions' not in data:
        return jsonify({'error': 'Транзакции не предоставлены'}), 400
    
    transactions = data['transactions']
    df = pd.DataFrame(transactions)
    
    # Статистика по времени
    hourly_stats = df.groupby('hour').agg({
        'amount': ['count', 'sum', 'mean']
    }).to_dict()
    
    # Статистика по дням недели
    daily_stats = df.groupby('day_name').agg({
        'amount': ['count', 'sum', 'mean']
    }).to_dict()
    
    # Статистика по категориям
    category_stats = df.groupby('category').agg({
        'amount': ['count', 'sum', 'mean']
    }).to_dict()
    
    return jsonify({
        'success': True,
        'hourly': hourly_stats,
        'daily': daily_stats,
        'categories': category_stats
    })


@app.route('/api/examples', methods=['GET'])
def get_examples():
    """Получение списка примеров банковских выписок"""
    try:
        examples = []
        
        # Список примеров с информацией (относительные пути для клиента)
        example_files = [
        {
            'path': 'examples/vtb_statement.csv',
            'name': 'Выписка ВТБ',
            'bank': 'ВТБ',
            'format': 'CSV'
        },
        {
            'path': 'examples/sberbank_statement.csv',
            'name': 'Выписка Сбербанк',
            'bank': 'Сбербанк',
            'format': 'CSV'
        },
        {
            'path': 'examples/tinkoff_statement.csv',
            'name': 'Выписка Тинькофф',
            'bank': 'Тинькофф',
            'format': 'CSV'
        },
        {
            'path': 'examples/alfabank_statement.csv',
            'name': 'Выписка Альфа-Банк',
            'bank': 'Альфа-Банк',
            'format': 'CSV'
        },
        {
            'path': 'examples/gazprombank_statement.txt',
            'name': 'Выписка Газпромбанк',
            'bank': 'Газпромбанк',
            'format': 'TXT'
        },
        {
            'path': 'examples/raiffeisen_statement.json',
            'name': 'Выписка Райффайзенбанк',
            'bank': 'Райффайзенбанк',
            'format': 'JSON'
        },
        {
            'path': 'example_transactions.csv',
            'name': 'Базовый пример',
            'bank': 'Общий формат',
            'format': 'CSV'
        }
        ]
        
        # Проверяем существование файлов (используем абсолютные пути)
        for example in example_files:
            # Преобразуем относительный путь в абсолютный
            if example['path'].startswith('examples/'):
                abs_path = os.path.join(EXAMPLES_FOLDER, example['path'].replace('examples/', ''))
            else:
                abs_path = os.path.join(BASE_DIR, example['path'])
            
            if os.path.exists(abs_path):
                examples.append(example)
            else:
                print(f"⚠️ Файл не найден: {abs_path}")
        
        print(f"✅ Найдено {len(examples)} примеров из {len(example_files)}")
        
        return jsonify({
            'success': True,
            'examples': examples,
            'total': len(examples)
        })
    except Exception as e:
        print(f"❌ Ошибка при получении списка примеров: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'examples': []
        }), 500


@app.route('/api/load-example', methods=['POST'])
def load_example():
    """Загрузка примера банковской выписки"""
    data = request.json
    
    if not data or 'file_path' not in data:
        return jsonify({'error': 'Путь к файлу не указан'}), 400
    
    relative_path = data['file_path']
    
    # Преобразуем относительный путь в абсолютный для безопасности
    if relative_path.startswith('examples/'):
        file_path = os.path.join(EXAMPLES_FOLDER, relative_path.replace('examples/', ''))
    elif relative_path.startswith('example_transactions.csv'):
        file_path = os.path.join(BASE_DIR, 'example_transactions.csv')
    else:
        # Защита от path traversal атак
        if '..' in relative_path or '/' in relative_path.replace('examples/', ''):
            return jsonify({'error': 'Недопустимый путь к файлу'}), 400
        file_path = os.path.join(BASE_DIR, relative_path)
    
    # Проверка существования файла
    if not os.path.exists(file_path):
        print(f"❌ Файл не найден: {file_path} (относительный путь: {relative_path})")
        return jsonify({
            'error': f'Файл не найден: {relative_path}',
            'debug_path': file_path
        }), 404
    
    print(f"✅ Загрузка примера: {relative_path} -> {file_path}")
    
    # Определение типа файла
    file_ext = file_path.rsplit('.', 1)[1].lower() if '.' in file_path else ''
    
    if file_ext not in ALLOWED_EXTENSIONS:
        return jsonify({'error': f'Неподдерживаемый формат файла: {file_ext}'}), 400
    
    # Парсинг транзакций
    try:
        transactions = parse_transactions(file_path, file_ext)
    except Exception as e:
        print(f"❌ Ошибка парсинга файла: {e}")
        return jsonify({
            'error': f'Ошибка при чтении файла: {str(e)}'
        }), 500
    
    if not transactions:
        return jsonify({'error': 'Не удалось распарсить транзакции из файла. Проверьте формат данных.'}), 400
    
    # Анализ рисков
    analysis = analyze_risk_patterns(transactions)
    
    print(f"✅ Успешно загружено {len(transactions)} транзакций")
    
    return jsonify({
        'success': True,
        'transactions': transactions,
        'analysis': analysis,
        'count': len(transactions)
    })


@app.route('/api/load-all-examples', methods=['POST'])
def load_all_examples():
    """Загрузка всех примеров банковских выписок для тестирования"""
    try:
        all_transactions = []
        
        # Список всех примеров
        example_files = [
            'examples/vtb_statement.csv',
            'examples/sberbank_statement.csv',
            'examples/tinkoff_statement.csv',
            'examples/alfabank_statement.csv',
            'examples/gazprombank_statement.txt',
            'examples/raiffeisen_statement.json',
            'example_transactions.csv'
        ]
        
        print("🔄 Загрузка всех примеров для тестирования...")
        
        for relative_path in example_files:
            # Преобразуем относительный путь в абсолютный
            if relative_path.startswith('examples/'):
                file_path = os.path.join(EXAMPLES_FOLDER, relative_path.replace('examples/', ''))
            else:
                file_path = os.path.join(BASE_DIR, relative_path)
            
            if os.path.exists(file_path):
                # Определение типа файла
                file_ext = file_path.rsplit('.', 1)[1].lower() if '.' in file_path else ''
                
                if file_ext in ALLOWED_EXTENSIONS:
                    try:
                        transactions = parse_transactions(file_path, file_ext)
                        if transactions:
                            # Добавляем информацию о источнике
                            for trans in transactions:
                                trans['source'] = relative_path
                            all_transactions.extend(transactions)
                            print(f"  ✅ Загружено {len(transactions)} транзакций из {relative_path}")
                        else:
                            print(f"  ⚠️ Нет транзакций в {relative_path}")
                    except Exception as e:
                        print(f"  ❌ Ошибка при загрузке {relative_path}: {e}")
                else:
                    print(f"  ⚠️ Неподдерживаемый формат: {relative_path}")
            else:
                print(f"  ⚠️ Файл не найден: {file_path}")
        
        if not all_transactions:
            return jsonify({
                'success': False,
                'error': 'Не удалось загрузить ни одного примера'
            }), 400
        
        # Анализ всех транзакций
        analysis = analyze_risk_patterns(all_transactions)
        
        print(f"✅ Всего загружено {len(all_transactions)} транзакций из {len(example_files)} примеров")
        
        return jsonify({
            'success': True,
            'transactions': all_transactions,
            'analysis': analysis,
            'count': len(all_transactions),
            'sources': len(example_files)
        })
    
    except Exception as e:
        print(f"❌ Ошибка при загрузке всех примеров: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    import socket
    import os
    
    # ПРИОРИТЕТ: Проверяем переменную PORT (Railway/Heroku/Docker)
    railway_port = os.getenv('PORT')
    
    if railway_port:
        # Запуск на Railway/Heroku/Docker
        port = int(railway_port)
        host = '0.0.0.0'  # Слушаем на всех интерфейсах
        debug = False
        
        print(f"\n🚀 Insight Backend API запускается...")
        print(f"📡 Порт: {port}")
        print(f"🌐 Host: {host}")
        print(f"🔧 Режим: Production")
        print(f"✅ Сервер будет доступен по адресу вашего Railway/Heroku домена\n")
        
        try:
            app.run(debug=debug, port=port, host=host, use_reloader=False)
        except Exception as e:
            print(f"\n❌ КРИТИЧЕСКАЯ ОШИБКА запуска сервера: {e}")
            import traceback
            traceback.print_exc()
            exit(1)
    else:
        # Локальный запуск
        def find_free_port(start_port=5000, max_attempts=10):
            """Поиск свободного порта"""
            for port in range(start_port, start_port + max_attempts):
                try:
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                        s.bind(('127.0.0.1', port))
                        return port
                except OSError:
                    continue
            return None
        
        default_port = int(os.getenv('FLASK_PORT', 5000))
        port = default_port
        
        # Проверяем, свободен ли порт
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
        except OSError:
            print(f"⚠️  Порт {default_port} занят, ищем свободный порт...")
            port = find_free_port(default_port + 1, max_attempts=5)
            
            if port is None:
                print("\n❌ Не удалось найти свободный порт!")
                exit(1)
            
            print(f"⚠️  ВНИМАНИЕ: Backend запущен на порту {port} вместо {default_port}")
        
        print(f"\n🚀 Insight Backend API запущен на http://localhost:{port}")
        print(f"📡 Frontend должен подключаться через прокси на порт {port}")
        print(f"🌐 Откройте http://localhost:3000 в браузере\n")
        
        try:
            app.run(debug=True, port=port, host='127.0.0.1', use_reloader=False)
        except OSError as e:
            print(f"\n❌ Ошибка запуска сервера: {e}")
            exit(1)

