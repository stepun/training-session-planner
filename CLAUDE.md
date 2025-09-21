# CLAUDE.md - Руководство для Claude Code Assistant

## Правила безопасности (КРИТИЧЕСКИ ВАЖНО!)

### 🔒 Никогда не храните секреты в коде!

**ЗАПРЕЩЕНО:**
```typescript
// ❌ НЕПРАВИЛЬНО - секреты прямо в коде
const config = {
  apiKey: "sk-1234567890abcdef",
  secretKey: "super-secret-key-123"
}
```

**ПРАВИЛЬНО:**
```typescript
// ✅ ПРАВИЛЬНО - переменные окружения
const config = {
  apiKey: process.env.API_KEY || import.meta.env.VITE_API_KEY,
  secretKey: process.env.SECRET_KEY || import.meta.env.VITE_SECRET_KEY
}

// Проверка обязательных переменных
if (!config.apiKey || !config.secretKey) {
  throw new Error('API keys not configured. Please set environment variables.')
}
```

### 📝 Всегда создавайте .env.example

Для каждого проекта создавайте файл `.env.example` с примерами переменных:

```env
# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_KEY=your_api_key_here
VITE_SECRET_KEY=your_secret_key_here

# Database
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
```

### 🐳 Docker переменные окружения

В `docker-compose.yml` используйте переменные окружения:

```yaml
services:
  app:
    environment:
      - API_KEY=${API_KEY}
      - SECRET_KEY=${SECRET_KEY}
    # Или для Vite приложений:
      - VITE_API_KEY=${VITE_API_KEY}
```

### 🚫 Добавьте в .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.production

# Credentials
credentials.json
config/secrets.json
```

## Команды и инструменты проекта

### Сборка и запуск
```bash
# Сборка Docker образа
docker compose build

# Запуск в development режиме
docker compose up

# Проверка статуса
docker compose ps
```

### Проверка кода
```bash
# Линтинг (если настроен)
npm run lint

# Проверка типов (если настроен)
npm run typecheck

# Тесты (если настроены)
npm run test
```

## Архитектура проекта

### Frontend (React + TypeScript + Vite)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **PDF**: @react-pdf/renderer
- **Drag & Drop**: @dnd-kit
- **File Upload**: S3/MinIO integration

### Структура файлов
```
frontend/
├── src/
│   ├── components/     # React компоненты
│   ├── types/          # TypeScript типы
│   ├── store/          # Zustand store
│   ├── services/       # API и внешние сервисы
│   └── App.tsx
├── public/
└── Dockerfile.dev
```

### Основные компоненты
- `GeneralDataForm` - форма основных данных тренировки
- `ExerciseCard` - карточка упражнения с drag&drop
- `ExercisesList` - список упражнений с сортировкой
- `TrainingPreview` - превью тренировки
- `PDFDocument` - генерация PDF

## Безопасность в коде

### Валидация файлов
```typescript
// Проверка типа файла
if (!file.type.startsWith('image/')) {
  throw new Error('Only image files allowed')
}

// Проверка размера (максимум 5MB)
if (file.size > 5 * 1024 * 1024) {
  throw new Error('File size exceeds 5MB limit')
}
```

### Обработка ошибок
```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  // Не логируйте чувствительные данные!
  throw new Error('Operation failed')
}
```

## Памятка для разработки

1. **Всегда** используйте переменные окружения для секретов
2. **Никогда** не коммитьте `.env` файлы
3. **Всегда** создавайте `.env.example`
4. **Проверяйте** наличие обязательных переменных
5. **Валидируйте** пользовательский ввод
6. **Ограничивайте** размеры загружаемых файлов
7. **Логируйте** ошибки, но не секреты

## Контрольный список перед коммитом

- [ ] Нет секретов в коде
- [ ] Обновлен .env.example
- [ ] Проведена валидация входных данных
- [ ] Обработаны ошибки
- [ ] Проверены права доступа
- [ ] Тестирована функциональность

---

**ВАЖНО**: Этот файл служит напоминанием о правилах безопасности. Следуйте этим принципам во всех проектах!