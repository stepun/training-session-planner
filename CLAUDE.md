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
- **Support Chat**: UserChat компонент для связи с администратором

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Telegram Bot**: node-telegram-bot-api
- **API**: REST endpoints для чата поддержки
- **Storage**: In-memory Map (рекомендуется заменить на БД в продакшене)

### Структура файлов
```
training_generator/
├── frontend/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   │   ├── GeneralDataForm.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── ExercisesList.tsx
│   │   │   ├── TrainingPreview.tsx
│   │   │   ├── PDFDocument.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── UserChat.tsx      # Виджет чата поддержки
│   │   │   └── ui/               # shadcn/ui компоненты
│   │   ├── types/          # TypeScript типы
│   │   │   └── training.ts
│   │   ├── store/          # Zustand store
│   │   │   ├── trainingStore.ts
│   │   │   └── languageStore.ts
│   │   ├── hooks/          # React hooks
│   │   │   └── useTranslation.ts
│   │   ├── locales/        # Файлы переводов
│   │   │   ├── ru-RU.json
│   │   │   └── en-US.json
│   │   ├── services/       # API и внешние сервисы
│   │   └── App.tsx
│   ├── public/
│   └── Dockerfile.dev
├── backend/
│   ├── index.js           # Express сервер + Telegram бот
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env
```

### Основные компоненты

**Frontend:**
- `GeneralDataForm` - форма основных данных тренировки
- `ExerciseCard` - карточка упражнения с drag&drop
- `ExercisesList` - список упражнений с сортировкой
- `TrainingPreview` - превью тренировки с динамической пагинацией
- `PDFDocument` - генерация PDF с синхронизированной пагинацией
- `LanguageSwitcher` - переключение языка интерфейса
- `UserChat` - виджет поддержки в хедере с уведомлениями о новых сообщениях

**Backend:**
- Express REST API на порту 3001 (внутренний) / 3002 (внешний)
- Telegram Bot с polling для обработки сообщений
- In-memory Map + файловая персистентность (`data/sessions.json`)
- Reply-detection через regex из текста reply_to_message (без отдельного Map)

### Локализация
Проект поддерживает мультиязычность:
- `frontend/src/locales/ru-RU.json` - русский язык
- `frontend/src/locales/en-US.json` - английский язык
- `frontend/src/store/languageStore.ts` - Zustand store для управления языком
- `frontend/src/hooks/useTranslation.ts` - хук для переводов

### Пагинация Preview и PDF
**Важно:** Логика пагинации в `TrainingPreview.tsx` и `PDFDocument.tsx` должна быть синхронизирована!

**Алгоритм пагинации:**
1. Рассчитываем доступную высоту страницы БЕЗ учета футера
2. Размещаем упражнения на страницах по высоте
3. После размещения проверяем: если одна страница И упражнения + футер не влезают → создаем пустую вторую страницу
4. Футер всегда на последней странице
5. На пустых страницах (только с футером) не показываем заголовок

**Константы пагинации должны соответствовать:**
```typescript
// Preview (px)
const A4_HEIGHT_PX = 1122
const PADDING_PX = 30 * 3.78 * 2  // 227px
const FIRST_PAGE_HEADER_PX = 150
const TOTAL_DURATION_PX = 25

// PDF (points, 1px ≈ 0.75pt)
const A4_HEIGHT = 842
const PADDING = 30 * 2  // 60pt
const FIRST_PAGE_HEADER = 120
const TOTAL_DURATION_HEIGHT = 35
```

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
- [ ] Синхронизирована пагинация Preview и PDF (если менялась)
- [ ] Обновлены переводы в ru-RU.json и en-US.json (если добавлялся текст)

## Чат поддержки (Support Chat)

### Архитектура чата
1. **Веб-пользователь** (сайт) → кнопка чата в хедере → отправляет сообщение
2. **Frontend** (`UserChat.tsx`) → POST `/api/user-send` → Backend
3. **Backend** (`index.js`) → сохраняет в Map + файл `data/sessions.json` → отправляет в Telegram администратору
4. **Администратор** (Telegram) → видит сообщение с ID сессии в тексте
5. **Администратор** → нативный Reply в Telegram или команда `/reply <userId> Текст ответа`
6. **Backend** → извлекает userId из текста reply_to_message через regex → сохраняет ответ
7. **Frontend** → polling GET `/api/user-messages/<userId>` каждые 3 секунды (даже при свёрнутом чате) → показывает ответ

### Уведомления (при свёрнутом чате)
- **Красный бейдж** на кнопке чата с количеством непрочитанных сообщений от админа
- **Popup** под кнопкой с превью последнего ответа админа, автоскрытие через 5 сек
- Клик по popup открывает чат
- При открытии чата бейдж и popup сбрасываются
- При первой загрузке страницы существующие сообщения не вызывают уведомлений

### API Endpoints

**GET `/api/user-messages/:userId`**
- Получить все сообщения для пользователя
- Возвращает: `{ messages: [{ from: 'user'|'admin', text: string, timestamp: number }] }`

**POST `/api/user-send`**
- Отправить сообщение от веб-пользователя
- Body: `{ userId: string, message: string }`
- Действия: сохраняет сообщение, отправляет в Telegram админу

**GET `/api/sessions`**
- Получить все активные сессии пользователей (для админ-панели)
- Возвращает массив сессий с сообщениями

**POST `/api/send`**
- Отправить сообщение от админа пользователю через веб-интерфейс
- Body: `{ chatId: string, message: string }`

### Telegram Bot Commands

**`/start`** - Начать чат с ботом (для Telegram-пользователей)

**`/reply <userId> <текст>`** - Ответить пользователю
- Пример: `/reply web_1760035933883_ccpcesgtz Привет!`
- Для веб-пользователей (ID начинается с `web_`) сообщение сохраняется в базе
- Для Telegram-пользователей (числовой ID) отправляется через бота

**`/users`** - Список всех активных пользователей с количеством сообщений

### Особенности реализации

**UserID генерация:**
```typescript
const userId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
localStorage.setItem('chatUserId', userId)
```

**Polling для обновлений:**
- Каждые 3 секунды фронтенд запрашивает новые сообщения (даже при закрытом чате)
- Новые сообщения добавляются в локальный state
- Автоматический скролл к последнему сообщению
- `lastSeenCountRef` отслеживает количество прочитанных сообщений от админа для бейджа

**Определение reply в Telegram (roadreg-стиль):**
- userId встроен в текст сообщения, отправляемого админу
- При Reply админа извлекается через regex `/ID(?:\sсессии)?:\s*(.+)/` из `reply_to_message.text`
- Для web-пользователей: `👤 ID сессии: web_xxx`
- Для Telegram-пользователей: `🆔 ID: 12345`
- Не требует отдельного Map для хранения связи message_id → userId

**Различие между типами пользователей:**
- `web_...` - пользователи с сайта (сообщения только в базе)
- Числовой ID - Telegram пользователи (сообщения через бота)

### Nginx конфигурация

**ВАЖНО:** `/api/*` должен проксироваться к бэкенду с сохранением `/api/` в пути!

```nginx
location /api/ {
    proxy_pass http://localhost:3002/api/;  # Важно: /api/ в конце!
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    # ... остальные заголовки
}
```

### Переменные окружения

```env
# Backend
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_CHAT_ID=your_telegram_id
PORT=3001

# Frontend
VITE_API_URL=https://yourdomain.com/api
```

## Известные особенности

### Пагинация
- Preview использует реальные размеры DOM элементов для точных расчетов
- PDF использует эвристическую оценку высоты упражнений
- Если пагинация не совпадает, проверьте константы высот в обоих компонентах

### Шрифты
- Preview: использует системный шрифт через Tailwind
- PDF: использует Roboto (загружается из CDN)
- Разница в шрифтах может влиять на высоту текста

### Изображения
- Preview: максимум 190px x 190px
- PDF: максимум 142pt x 142pt (~189px x 189px)
- Соотношение размеров должно оставаться синхронизированным

### Чат поддержки
- Сообщения хранятся в Map + персистятся в `data/sessions.json` (переживает перезапуск)
- Reply-detection через regex из текста сообщения (без отдельного messageToUser Map)
- Polling каждые 3 секунды — работает всегда, даже при закрытом чате (для уведомлений)
- Web userID генерируется случайно и хранится в localStorage

---

**ВАЖНО**: Этот файл служит напоминанием о правилах разработки. Следуйте этим принципам при работе с проектом!