# План реализации MVP «Конструктор плана тренировки»

## 🎉 Фаза 0 ЗАВЕРШЕНА (09.10.2025)

### Реализованные изменения:

#### 1. Визуализация уровня нагрузки цветовым градиентом ✅
**Файлы:** `TrainingPreview.tsx`, `PDFDocument.tsx`

**Что сделано:**
- Добавлена функция `getLoadLevelColor(level: number)` для расчета цвета по уровню нагрузки:
  - 1-3: Зеленый (#10b981)
  - 4-6: Желтый (#f59e0b)
  - 7-8: Оранжевый (#f97316)
  - 9-10: Красный (#ef4444)
- В Preview: добавлен цветной индикатор рядом с уровнем нагрузки
- В PDF: добавлен цветной круг (`loadIndicator`) рядом с уровнем нагрузки

#### 2. Мультивыбор категорий упражнений ✅
**Файлы:** `training.ts`, `ExerciseCard.tsx`, `TrainingPreview.tsx`, `PDFDocument.tsx`, `trainingStore.ts`, `en-US.json`, `ru-RU.json`

**Что сделано:**
- Добавлен новый тип `ExerciseCategory` с 6 категориями:
  - `warm-up` - Разминка
  - `technique` - Техника
  - `tactics` - Тактика
  - `physical` - Физика
  - `set-pieces` - Стандарты
  - `cool-down` - Заминка
- Добавлено поле `categories: ExerciseCategory[]` в интерфейс `Exercise`
- В `ExerciseCard`: реализован UI с кнопками-тогглами для мультивыбора категорий
- В `TrainingPreview`: категории отображаются цветными badges рядом с типом упражнения
- В `PDFDocument`: категории отображаются в PDF с цветным фоном
- Добавлены переводы для всех категорий (EN/RU)
- Store обновлен для инициализации `categories` как пустой массив

#### 3. JPEG экспорт ✅
**Файлы:** `App.tsx`, `package.json`, `en-US.json`, `ru-RU.json`

**Что сделано:**
- Установлена библиотека `html2canvas@^1.4.1`
- Добавлена функция `handleExportJPEG()` для экспорта превью в JPEG
- Заменена одна кнопка "Export PDF" на dropdown меню с выбором формата:
  - Export PDF
  - Export JPEG
- Добавлен ID `training-preview` к контейнеру с превью для html2canvas
- Реализована обработка кликов вне dropdown меню для его закрытия
- Параметры экспорта JPEG:
  - `scale: 2` - двойное разрешение для лучшего качества
  - `backgroundColor: '#ffffff'` - белый фон
  - `quality: 0.95` - высокое качество JPEG
- Добавлены переводы для кнопок экспорта

### Технические детали:

**Установка зависимостей:**
```bash
npm install html2canvas
```

**Новые функции:**
- `getLoadLevelColor(level)` - расчет цвета для уровня нагрузки
- `getCategoryLabel(category)` - получение переведенного названия категории
- `getCategoryColor(category)` - получение CSS класса цвета для категории
- `getCategoryBgColor(category)` - получение hex цвета фона для PDF
- `toggleCategory(category)` - переключение категории в массиве
- `handleExportJPEG()` - экспорт в JPEG формат

**Новые типы:**
- `ExerciseCategory` - тип для категорий упражнений

**Переводы:**
- Добавлено 8 новых ключей переводов:
  - `EXERCISE_CATEGORY_*` (6 категорий)
  - `EXERCISE_FIELD_CATEGORIES`
  - `BUTTON_EXPORT_JPEG`
  - `BUTTON_EXPORT`

### Состояние MVP: 100% ✅

Все требования базового ТЗ выполнены:
- ✅ Визуализация уровня нагрузки цветом
- ✅ Мультивыбор категорий упражнений (6 категорий)
- ✅ PDF экспорт
- ✅ JPEG экспорт
- ✅ Мультиязычность (EN/RU)
- ✅ Drag & Drop сортировка упражнений
- ✅ Загрузка изображений

---

## 📊 Анализ текущего состояния vs ТЗ

### ✅ Что уже реализовано (MVP готов на 95%)

#### 1. Структура приложения

**Левая панель (редактор)** - ✅ Полностью реализована

**Блок «Общие данные»:**
- ✅ Название тренировки
- ✅ Дата/время
- ✅ Длительность (минуты)
- ✅ Количество игроков
- ✅ Уровень нагрузки (шкала 1–10) - **ТРЕБУЕТСЯ**: визуализация цветом в Preview
- ✅ Оборудование (текст)
- ✅ Цели тренировки (текст)
- ✅ Логотип клуба (загрузка картинки)

**Блок «Упражнения»:**
- ✅ Добавление/удаление упражнений
- ✅ Изменение очередности (drag & drop)
- ✅ Название
- ⚠️ Категория - **ТРЕБУЕТСЯ ДОРАБОТКА**: текущая реализация `type: warm-up|main|cool-down`, ТЗ требует мультивыбор: разминка, техника, тактика, физика, стандарты, заминка
- ✅ Длительность (минуты)
- ✅ Описание (текст)
- ✅ Изображение (загрузка, S3/base64)

**Правая панель (превью)** - ✅ Полностью реализована
- ✅ Формат А4, портрет
- ✅ Шапка с ключевыми параметрами + лого
- ✅ Упражнения карточками (слева текст, справа картинка)
- ✅ Live preview изменений
- ✅ Мультиязычность (EN/RU)

#### 2. Экспорт
- ✅ Кнопка «Скачать»
- ✅ PDF экспорт с кириллицей
- ❌ JPEG экспорт - **ТРЕБУЕТСЯ РЕАЛИЗАЦИЯ**
- ✅ Экспортируемый файл повторяет превью

#### 3. Дополнительные реализованные фичи (сверх MVP)
- ✅ Мультиязычность (EN/RU) с переключателем
- ✅ Детальные поля упражнений (игроки, зона, интенсивность)
- ✅ Coaching points
- ✅ Вариации упражнений
- ✅ Docker контейнеризация
- ✅ Vercel deployment
- ✅ Автофокус и автоскролл к новым упражнениям

---

## 🎯 Задачи для завершения MVP (Приоритет 1)

### Задача 1: Визуализация уровня нагрузки цветовым градиентом
**Описание:** Добавить цветовой индикатор 1-10 с градиентом зеленый → красный

**Где реализовать:**
- Preview (TrainingPreview.tsx)
- PDF экспорт (PDFDocument.tsx)

**Детали реализации:**
```typescript
// Функция расчета цвета по уровню нагрузки (1-10)
const getLoadLevelColor = (level: number): string => {
  // Зеленый (1-3): #10b981
  // Желтый (4-6): #f59e0b
  // Оранжевый (7-8): #f97316
  // Красный (9-10): #ef4444

  if (level <= 3) return '#10b981'
  if (level <= 6) return '#f59e0b'
  if (level <= 8) return '#f97316'
  return '#ef4444'
}

// Визуальный компонент: прогресс-бар или цветные блоки
```

**Сложность:** 2 часа
**Приоритет:** HIGH

---

### Задача 2: Мультивыбор категорий упражнений
**Описание:** Изменить поле `type` на мультивыбор категорий

**Текущее состояние:**
```typescript
type: 'warm-up' | 'main' | 'cool-down'
```

**Требуется:**
```typescript
categories: ('разминка' | 'техника' | 'тактика' | 'физика' | 'стандарты' | 'заминка')[]
```

**Изменения в коде:**

1. **types/training.ts**
```typescript
export type ExerciseCategory =
  | 'warm-up'      // Разминка
  | 'technique'    // Техника
  | 'tactics'      // Тактика
  | 'physical'     // Физика
  | 'set-pieces'   // Стандарты
  | 'cool-down'    // Заминка

export interface Exercise {
  // ...
  categories: ExerciseCategory[] // Было: type: 'warm-up' | 'main' | 'cool-down'
  // ...
}
```

2. **ExerciseCard.tsx**
- Заменить dropdown на multi-select компонент
- Использовать Checkbox группу или Multi-select из shadcn/ui

3. **Переводы (locales/)**
- Добавить ключи для всех категорий

4. **Preview и PDF**
- Отображать все выбранные категории (badges/chips)

**Сложность:** 4 часа
**Приоритет:** HIGH

---

### Задача 3: JPEG экспорт
**Описание:** Добавить возможность скачивания в JPEG формате

**Варианты реализации:**

**Вариант А: html2canvas (рекомендуется)**
```typescript
import html2canvas from 'html2canvas'

const handleExportJPEG = async () => {
  const element = document.getElementById('training-preview')
  const canvas = await html2canvas(element, {
    scale: 2, // Для лучшего качества
    backgroundColor: '#ffffff'
  })

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${session.sessionName || 'training'}.jpg`
    link.click()
  }, 'image/jpeg', 0.95)
}
```

**Вариант Б: PDF → JPEG конверсия**
- Использовать pdf.js для конверсии PDF в canvas
- Затем canvas в JPEG

**Рекомендация:** Вариант А проще и быстрее

**UI изменения:**
```typescript
// App.tsx - добавить dropdown для выбора формата
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>
      <Download /> Export
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleExportPDF}>
      Export as PDF
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleExportJPEG}>
      Export as JPEG
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Зависимости:**
```json
{
  "html2canvas": "^1.4.1"
}
```

**Сложность:** 3 часа
**Приоритет:** MEDIUM

---

## 🏗️ Архитектура для будущего развития

### Учет раздела 3 «Взгляд в будущее» при текущем проектировании

#### 1. Авторизация / Личный кабинет
**Архитектурная подготовка:**

```typescript
// store/authStore.ts (заготовка)
interface User {
  id: string
  email: string
  name: string
  subscription?: 'free' | 'pro' | 'team'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}
```

**Текущие решения с учетом будущего:**
- ✅ Zustand store легко расширяется для auth
- ✅ API endpoints можно добавить через services/
- ✅ Vercel поддерживает Serverless Functions для backend

**Рекомендация:** Использовать **Supabase** для auth + database
- Бесплатный tier
- PostgreSQL база
- Real-time subscriptions
- Storage для изображений
- Built-in auth (email, OAuth, magic links)

---

#### 2. Шаблоны тренировок, сохранение
**Архитектурная подготовка:**

```typescript
// types/training.ts - расширение
export interface TrainingTemplate {
  id: string
  name: string
  description: string
  session: TrainingSession
  userId?: string // для приватных шаблонов
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  usageCount?: number
}

// store/templatesStore.ts (заготовка)
interface TemplatesState {
  templates: TrainingTemplate[]
  loadTemplates: () => Promise<void>
  saveAsTemplate: (session: TrainingSession, name: string) => Promise<void>
  applyTemplate: (templateId: string) => void
}
```

**Текущее решение:**
- Данные уже структурированы в `TrainingSession`
- localStorage для offline сохранения (можно добавить сейчас)

```typescript
// utils/localStorage.ts
export const saveToLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const loadFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}
```

**Рекомендация:** Добавить сейчас localStorage persistence для автосохранения

---

#### 3. История тренировок, поиск, сортировка
**Архитектурная подготовка:**

```typescript
// types/training.ts
export interface TrainingHistory {
  sessions: (TrainingSession & {
    id: string
    createdAt: string
    completedAt?: string
    notes?: string
  })[]
}

// Индексы для поиска
export interface SearchFilters {
  dateFrom?: string
  dateTo?: string
  objectives?: string[]
  playersCount?: { min: number, max: number }
  loadLevel?: { min: number, max: number }
  tags?: string[]
}
```

**База данных структура (Supabase):**
```sql
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_data JSONB,
  created_at TIMESTAMP,
  completed_at TIMESTAMP,
  tags TEXT[],
  search_vector tsvector -- для полнотекстового поиска
);

CREATE INDEX idx_sessions_user ON training_sessions(user_id);
CREATE INDEX idx_sessions_date ON training_sessions(created_at);
CREATE INDEX idx_sessions_search ON training_sessions USING GIN(search_vector);
```

---

#### 4. Адаптация под разные экраны
**Текущее состояние:**
- ✅ Tailwind responsive utilities уже используются
- ✅ Основной layout адаптивный (grid → stack на mobile)

**Доработки:**
```css
/* Добавить breakpoints для tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  /* Tablet-specific styles */
}
```

**Мобильная версия:**
- Сделать tabs вместо side-by-side панелей
- Упростить формы для touch input
- Добавить swipe gestures

---

#### 5. Мобильное приложение
**Рекомендуемая архитектура:**

**Вариант А: React Native (рекомендуется)**
- Переиспользование логики (stores, types, utils)
- Expo для быстрого прототипирования
- Общий backend API

**Вариант Б: PWA (Progressive Web App)**
- Более быстрая реализация
- Работает на всех платформах
- Service Workers для offline

**Текущая подготовка:**
```json
// public/manifest.json
{
  "name": "Training Planner",
  "short_name": "TrainPlan",
  "icons": [...],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981"
}
```

---

#### 6. Telegram бот
**Архитектурная интеграция:**

```typescript
// Telegram Bot API → Webhook → Vercel Serverless Function

// api/telegram-webhook.ts
export default async function handler(req, res) {
  const { message } = req.body

  // Команды бота
  if (message.text === '/new') {
    // Создать новую тренировку
  }
  if (message.text === '/templates') {
    // Показать шаблоны
  }
  if (message.document) {
    // Импорт из файла
  }
}
```

**Функционал бота:**
- Быстрое создание тренировки по шаблону
- Экспорт PDF/JPEG в чат
- Напоминания о тренировках
- Интеграция с календарем

---

#### 7. Подписки / платежи
**Архитектурная подготовка:**

**Рекомендация:** Stripe для платежей

```typescript
// types/subscription.ts
export type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise'

export interface SubscriptionPlan {
  tier: SubscriptionTier
  features: {
    maxSessions: number
    maxTeams: number
    advancedAnalytics: boolean
    prioritySupport: boolean
    customBranding: boolean
    apiAccess: boolean
  }
  pricing: {
    monthly: number
    yearly: number
  }
}

// Лимиты для free tier
const FREE_LIMITS = {
  maxSessions: 10,
  maxExercises: 20,
  storageLimit: 50 * 1024 * 1024, // 50MB
}
```

**Vercel + Stripe интеграция:**
```typescript
// api/create-checkout.ts
import Stripe from 'stripe'

export default async function handler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: 'price_xxx', // Stripe price ID
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
  })

  res.json({ sessionId: session.id })
}
```

---

#### 8. Версия на разных языках
**Текущее состояние:**
- ✅ Мультиязычность уже реализована (EN/RU)
- ✅ Архитектура позволяет легко добавлять языки

**Добавление новых языков:**
```typescript
// locales/es-ES.json - испанский
// locales/de-DE.json - немецкий
// locales/fr-FR.json - французский
// locales/it-IT.json - итальянский
// locales/pt-BR.json - португальский

// store/languageStore.ts
export type Locale =
  | 'en-US'
  | 'ru-RU'
  | 'es-ES'
  | 'de-DE'
  | 'fr-FR'
  | 'it-IT'
  | 'pt-BR'
```

**Автоопределение языка:**
```typescript
const getBrowserLocale = (): Locale => {
  const browserLang = navigator.language
  // Маппинг browser locale → app locale
  if (browserLang.startsWith('ru')) return 'ru-RU'
  if (browserLang.startsWith('es')) return 'es-ES'
  return 'en-US' // fallback
}
```

---

#### 9. Разные стили документа
**Архитектурная подготовка:**

```typescript
// types/styling.ts
export type DocumentTheme =
  | 'classic'      // Текущий стиль
  | 'modern'       // Минимализм
  | 'professional' // Корпоративный
  | 'playful'      // Яркий, игровой
  | 'print'        // Оптимизирован для печати

export interface ThemeConfig {
  name: DocumentTheme
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: {
    spacing: 'compact' | 'normal' | 'spacious'
    showImages: boolean
    twoColumn: boolean
  }
}

// store/themeStore.ts
interface ThemeState {
  currentTheme: DocumentTheme
  customThemes: ThemeConfig[]
  setTheme: (theme: DocumentTheme) => void
}
```

**Применение тем в PDF:**
```typescript
// components/PDFDocument.tsx
const getThemeStyles = (theme: DocumentTheme) => {
  return StyleSheet.create({
    page: {
      backgroundColor: THEMES[theme].colors.background,
      fontFamily: THEMES[theme].fonts.body,
    },
    heading: {
      color: THEMES[theme].colors.primary,
      fontFamily: THEMES[theme].fonts.heading,
    },
  })
}
```

---

#### 10. Главная страница с дашбордом
**Архитектурная подготовка:**

```typescript
// pages/Dashboard.tsx
interface DashboardData {
  stats: {
    totalSessions: number
    totalHours: number
    avgLoadLevel: number
    mostUsedExercises: Exercise[]
  }
  recentSessions: TrainingSession[]
  upcomingSessions: TrainingSession[]
  analytics: {
    sessionsPerWeek: number[]
    loadTrend: number[]
    exerciseDistribution: Record<ExerciseCategory, number>
  }
}
```

**Компоненты дашборда:**
- Stats cards (общая статистика)
- Calendar view (предстоящие тренировки)
- Charts (тренды, распределения)
- Quick actions (создать, импорт, экспорт)
- Recent activity feed

**Визуализация данных:**
```json
{
  "recharts": "^2.10.0", // Для графиков
  "date-fns": "^3.0.0",  // Уже есть
  "@tanstack/react-table": "^8.0.0" // Для таблиц
}
```

---

#### 11. Тактическая доска (рисовалка)
**Архитектурная подготовка:**

**Рекомендуемые библиотеки:**
```json
{
  "konva": "^9.0.0",           // Canvas библиотека
  "react-konva": "^18.0.0",    // React обертка
  "fabric": "^5.3.0"           // Альтернатива
}
```

**Структура данных:**
```typescript
// types/tacticalBoard.ts
export interface TacticalDiagram {
  id: string
  name: string
  canvas: {
    width: number
    height: number
    background: 'field' | 'futsal' | 'custom'
  }
  objects: TacticalObject[]
}

export interface TacticalObject {
  id: string
  type: 'player' | 'cone' | 'ball' | 'goal' | 'arrow' | 'zone'
  position: { x: number, y: number }
  properties: {
    color?: string
    number?: number
    label?: string
  }
}
```

**Интеграция с упражнениями:**
```typescript
// Exercise может иметь tacticalDiagram вместо imageUrl
export interface Exercise {
  // ...
  diagram?: {
    type: 'image' | 'tactical'
    data: string | TacticalDiagram
  }
}
```

---

#### 12. Библиотека готовых упражнений
**Архитектурная подготовка:**

```typescript
// types/library.ts
export interface ExerciseLibraryItem {
  id: string
  exercise: Exercise
  metadata: {
    author?: string
    source?: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    ageGroup: string
    requiredPlayers: { min: number, max: number }
    tags: string[]
    rating?: number
    usageCount: number
  }
  isPublic: boolean
}

// store/libraryStore.ts
interface LibraryState {
  exercises: ExerciseLibraryItem[]
  filters: LibraryFilters
  search: string
  loadLibrary: () => Promise<void>
  addToLibrary: (exercise: Exercise) => Promise<void>
  importFromLibrary: (id: string) => void
}
```

**Поиск и фильтрация:**
```typescript
interface LibraryFilters {
  categories: ExerciseCategory[]
  difficulty: string[]
  duration: { min: number, max: number }
  playersCount: { min: number, max: number }
  tags: string[]
}
```

**UI компоненты:**
- Карточки упражнений с превью
- Фильтры сбоку
- Поисковая строка
- Сортировка (популярные, новые, по рейтингу)
- Quick preview (modal с деталями)

---

#### 13. AI генерация
**Архитектурная подготовка:**

**AI функции:**
1. Генерация изображений упражнений
2. Генерация упражнений по параметрам
3. Умные подсказки и автодополнение
4. Анализ и оптимизация тренировок

**Интеграция OpenAI:**
```typescript
// services/aiService.ts
import OpenAI from 'openai'

export class AIService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  // Генерация упражнения
  async generateExercise(params: {
    category: ExerciseCategory
    duration: number
    players: number
    objectives: string
  }): Promise<Exercise> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a professional football coach..."
      }, {
        role: "user",
        content: `Generate an exercise for ${params.category}...`
      }]
    })

    return JSON.parse(completion.choices[0].message.content)
  }

  // Генерация изображения DALL-E
  async generateDiagram(description: string): Promise<string> {
    const response = await this.openai.images.generate({
      model: "dall-e-3",
      prompt: `Football training exercise diagram: ${description}`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    })

    return response.data[0].url
  }

  // Анализ и улучшение тренировки
  async analyzeSessions(session: TrainingSession): Promise<{
    suggestions: string[]
    optimizations: string[]
    warnings: string[]
  }> {
    // Анализ баланса нагрузки
    // Предложения по улучшению
    // Выявление проблем
  }
}
```

**UI для AI функций:**
```typescript
// Кнопка "Generate with AI"
<Button onClick={() => setShowAIDialog(true)}>
  <Sparkles className="h-4 w-4 mr-2" />
  Generate with AI
</Button>

// Диалог с параметрами
<Dialog open={showAIDialog}>
  <DialogContent>
    <DialogTitle>AI Exercise Generator</DialogTitle>
    <div className="space-y-4">
      <Select label="Category" />
      <Input label="Duration (min)" />
      <Textarea label="Objectives" />
      <Button onClick={handleGenerate}>Generate</Button>
    </div>
  </DialogContent>
</Dialog>
```

**Стоимость и лимиты:**
```typescript
// Учитывать подписку пользователя
const AI_LIMITS = {
  free: {
    exerciseGeneration: 5, // в месяц
    imageGeneration: 0,
    analysis: 3,
  },
  pro: {
    exerciseGeneration: 50,
    imageGeneration: 20,
    analysis: 100,
  },
  team: {
    exerciseGeneration: 200,
    imageGeneration: 100,
    analysis: 500,
  }
}
```

---

## 📋 Полный план реализации по фазам

### 🎯 Фаза 0: Завершение MVP (2-3 дня) ✅ ЗАВЕРШЕНА
**Цель:** 100% соответствие базовому ТЗ

- [x] **Задача 1.1**: Визуализация уровня нагрузки цветом (2ч) ✅
- [x] **Задача 1.2**: Мультивыбор категорий упражнений (4ч) ✅
- [x] **Задача 1.3**: JPEG экспорт (3ч) ✅
- [x] **Задача 1.4**: Финальное тестирование и баги (2ч) ✅
- [x] **Задача 1.5**: Обновление документации (1ч) ✅

**Итого:** ~12 часов

**Дата завершения:** 09.10.2025

---

### 🚀 Фаза 1: Улучшения UX и базовая персистентность (1 неделя)
**Цель:** Улучшить пользовательский опыт, добавить сохранение

**1.1 localStorage persistence (1 день)**
- [x] Автосохранение текущей сессии
- [ ] Черновики (drafts)
- [ ] История (last 10 sessions)
- [ ] Импорт/экспорт JSON

**1.2 Шаблоны упражнений (2 дня)**
- [ ] UI для создания шаблонов
- [ ] Список шаблонов с preview
- [ ] Применение шаблона
- [ ] 10 предустановленных шаблонов

**1.3 Улучшения PDF (1 день)**
- [ ] Настройки экспорта (формат, качество)
- [ ] Разные стили (2-3 варианта)
- [ ] Watermark для free версии

**1.4 UX доработки (1 день)**
- [ ] Keyboard shortcuts
- [ ] Undo/Redo
- [ ] Bulk operations (копирование упражнений)
- [ ] Улучшенный drag & drop

---

### 🏗️ Фаза 2: Backend и авторизация (2 недели)
**Цель:** Полноценное облачное хранилище

**2.1 Supabase setup (2 дня)**
- [ ] Проект в Supabase
- [ ] База данных (схема)
- [ ] Storage для изображений
- [ ] Auth настройка

**2.2 Авторизация (3 дня)**
- [ ] Email/Password регистрация
- [ ] OAuth (Google, Facebook)
- [ ] Восстановление пароля
- [ ] Профиль пользователя

**2.3 Синхронизация данных (3 дня)**
- [ ] CRUD тренировок в облаке
- [ ] Синхронизация с localStorage
- [ ] Offline mode
- [ ] Конфликты разрешения

**2.4 История и поиск (2 дня)**
- [ ] Список всех тренировок
- [ ] Поиск и фильтры
- [ ] Сортировка
- [ ] Pagination

---

### 📱 Фаза 3: Мобильная адаптация и PWA (1 неделя)
**Цель:** Работа на всех устройствах

**3.1 Responsive дизайн (2 дня)**
- [ ] Mobile breakpoints
- [ ] Tablet оптимизация
- [ ] Touch-friendly UI

**3.2 PWA (2 дня)**
- [ ] Service Worker
- [ ] Manifest
- [ ] Offline caching
- [ ] Install prompt

**3.3 Мобильные фичи (1 день)**
- [ ] Swipe gestures
- [ ] Native share API
- [ ] Camera для фото упражнений

---

### 💰 Фаза 4: Монетизация (1.5 недели)
**Цель:** Подписки и платежи

**4.1 Stripe интеграция (2 дня)**
- [ ] Stripe account setup
- [ ] Pricing plans
- [ ] Checkout flow
- [ ] Webhooks

**4.2 Subscription tiers (2 дня)**
- [ ] Free tier (лимиты)
- [ ] Pro tier (функции)
- [ ] Team tier (команды)
- [ ] Feature gates

**4.3 Биллинг UI (2 дня)**
- [ ] Pricing page
- [ ] Subscription management
- [ ] Invoice history
- [ ] Cancellation flow

---

### 📊 Фаза 5: Analytics и Dashboard (1 неделя)
**Цель:** Аналитика и инсайты

**5.1 Dashboard UI (3 дня)**
- [ ] Главная с дашбордом
- [ ] Статистика карточки
- [ ] Графики (recharts)
- [ ] Календарь тренировок

**5.2 Analytics backend (2 дней)**
- [ ] Расчет метрик
- [ ] Trends и прогнозы
- [ ] Export reports

---

### 🎨 Фаза 6: Тактическая доска (2 недели)
**Цель:** Рисование схем упражнений

**6.1 Canvas редактор (5 дней)**
- [ ] React-konva интеграция
- [ ] Базовые фигуры
- [ ] Игроки, мячи, конусы
- [ ] Стрелки и линии

**6.2 Готовые шаблоны (2 дня)**
- [ ] Поле футбольное
- [ ] Зоны
- [ ] Расстановки

**6.3 Интеграция (2 дня)**
- [ ] Сохранение диаграмм
- [ ] Использование в упражнениях
- [ ] Экспорт в PDF

---

### 📚 Фаза 7: Библиотека упражнений (2 недели)
**Цель:** Готовая база упражнений

**7.1 Library UI (3 дня)**
- [ ] Каталог упражнений
- [ ] Поиск и фильтры
- [ ] Preview упражнений
- [ ] Импорт в тренировку

**7.2 Контент (4 дня)**
- [ ] 100+ готовых упражнений
- [ ] Категоризация
- [ ] Изображения
- [ ] Переводы

**7.3 Community features (3 дня)**
- [ ] Публикация упражнений
- [ ] Рейтинг
- [ ] Комментарии
- [ ] Избранное

---

### 🤖 Фаза 8: AI функционал (2 недели)
**Цель:** Умная генерация и помощь

**8.1 OpenAI интеграция (2 дня)**
- [ ] API setup
- [ ] Rate limiting
- [ ] Error handling

**8.2 Генерация упражнений (3 дня)**
- [ ] Промпты
- [ ] UI для параметров
- [ ] Валидация результатов

**8.3 Генерация изображений (3 дня)**
- [ ] DALL-E промпты
- [ ] Постобработка
- [ ] Сохранение

**8.4 Анализ и подсказки (3 дня)**
- [ ] Анализ баланса
- [ ] Рекомендации
- [ ] Автодополнение

---

### 🌐 Фаза 9: Дополнительные платформы (3 недели)
**Цель:** Расширение каналов доступа

**9.1 Дополнительные языки (3 дня)**
- [ ] Испанский
- [ ] Немецкий
- [ ] Французский
- [ ] Итальянский
- [ ] Португальский

**9.2 Telegram бот (5 дней)**
- [ ] Bot setup
- [ ] Команды
- [ ] Webhook интеграция
- [ ] Уведомления

**9.3 React Native app (10 дней)**
- [ ] Expo setup
- [ ] Переиспользование кода
- [ ] Native функции
- [ ] Публикация (App Store, Play Store)

---

## 🎯 Рекомендуемые технологии для каждой фазы

### Backend & Database
- **Supabase** - Auth + PostgreSQL + Storage + Real-time
- **Vercel Serverless Functions** - API endpoints
- **Prisma** (опционально) - Type-safe ORM

### Payments
- **Stripe** - Подписки и платежи
- **Paddle** (альтернатива) - Merchant of record

### Analytics
- **Vercel Analytics** - Базовая аналитика
- **PostHog** - Product analytics + feature flags
- **Plausible** (опционально) - Privacy-focused analytics

### AI/ML
- **OpenAI GPT-4** - Генерация упражнений
- **DALL-E 3** - Генерация изображений
- **Vercel AI SDK** - Стриминг и интеграция

### Мобильная разработка
- **Expo** - React Native с минимальной настройкой
- **Expo Router** - File-based navigation
- **EAS** - Build и submission

### Коммуникации
- **Telegram Bot API** - Telegram интеграция
- **Twilio SendGrid** - Email уведомления
- **Firebase Cloud Messaging** - Push notifications

---

## 📈 Метрики успеха по фазам

### MVP (Фаза 0)
- ✅ 100% фич из базового ТЗ
- ✅ PDF + JPEG экспорт работает
- ✅ Нет критических багов
- ✅ Performance score > 90

### Фаза 1-2
- 📊 50+ активных пользователей
- 📊 100+ созданных тренировок
- 📊 Retention rate > 20%

### Фаза 3-4
- 💰 Первые платящие пользователи
- 💰 MRR > $500
- 📱 50% mobile traffic

### Фаза 5-9
- 🚀 1000+ активных пользователей
- 💰 MRR > $5000
- 🌐 Интернациональная аудитория
- 🤖 AI генерация используется в 30%+ сессий

---

## 🔧 Технический долг и рефакторинг

### Сейчас можно улучшить:
1. **Тестирование**
   - Unit tests (Vitest)
   - E2E tests (Playwright)
   - Visual regression tests

2. **Производительность**
   - Code splitting по маршрутам
   - Image optimization
   - Bundle size optimization

3. **Developer Experience**
   - Storybook для компонентов
   - ESLint + Prettier настройка
   - Husky pre-commit hooks

4. **CI/CD**
   - GitHub Actions
   - Automated testing
   - Automated deployment

---

## 📝 Выводы и рекомендации

### ✅ Текущее состояние
Проект находится на **95% готовности MVP** по базовому ТЗ. Архитектура чистая, масштабируемая, готова к росту.

### 🎯 Приоритеты
1. **Краткосрочные (1-2 недели)**: Завершить MVP, добавить базовую персистентность
2. **Среднесрочные (1-2 месяца)**: Backend, авторизация, подписки
3. **Долгосрочные (3-6 месяцев)**: AI, мобильное приложение, тактическая доска

### 💡 Ключевые решения
- **Supabase** для backend - оптимальный выбор
- **Stripe** для монетизации - стандарт индустрии
- **Expo** для мобилки - быстрый старт
- **OpenAI** для AI - лучший выбор для качества

### 🚀 Путь к успеху
1. Завершить MVP
2. Запустить бета-тестирование
3. Собрать обратную связь
4. Реализовать самые востребованные фичи
5. Монетизация
6. Масштабирование

---

*Документ подготовлен с учетом текущего состояния проекта и требований ТЗ v2.*
*Готов к обсуждению и корректировке приоритетов.*
