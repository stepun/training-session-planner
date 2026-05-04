const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Telegram Bot Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8335950496:AAG8Hnu_8-hJIl4gIlD_q_CTvuxk4XFOVNI';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '120962578';

// Initialize bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Restart polling after EFATAL (DNS/network) — node-telegram-bot-api stops polling
// permanently on EFATAL and never recovers on its own.
bot.on('polling_error', async (error) => {
  console.error('[POLLING_ERROR]', error.code, error.message);
  if (error.code === 'EFATAL') {
    try { await bot.stopPolling({ cancel: true }); } catch (e) {}
    setTimeout(async () => {
      try {
        await bot.startPolling({ restart: true });
        console.log('[POLLING] Restarted after EFATAL');
      } catch (e) {
        console.error('[POLLING] Restart failed, exiting for docker restart:', e.message);
        process.exit(1);
      }
    }, 10000);
  }
});

// Persistence file paths
const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory storage for messages (с персистентностью на диск)
const userSessions = new Map(); // Map<userId, { name: string, messages: Message[] }>

// Load data from disk
function loadData() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const sessionsData = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      for (const [key, value] of Object.entries(sessionsData)) {
        userSessions.set(key, value);
      }
      console.log('[LOAD] Loaded', userSessions.size, 'user sessions');
    }
  } catch (error) {
    console.error('[LOAD] Error loading data:', error);
  }
}

// Save data to disk
function saveData() {
  try {
    // Convert Map to Object for JSON serialization
    const sessionsObj = Object.fromEntries(userSessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsObj, null, 2));

    console.log('[SAVE] Data persisted to disk');
  } catch (error) {
    console.error('[SAVE] Error saving data:', error);
  }
}

// Load existing data on startup
loadData();

// Bot Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'User';

  // Initialize user session
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, {
      name: userName,
      messages: []
    });
  }

  bot.sendMessage(chatId,
    `Привет, ${userName}! 👋\n\n` +
    `Я бот поддержки Training Session Planner.\n` +
    `Задайте ваш вопрос, и администратор ответит вам в ближайшее время.`
  );

  // Notify admin about new user
  bot.sendMessage(ADMIN_CHAT_ID,
    `🆕 Новый пользователь начал чат:\n` +
    `ID: ${chatId}\n` +
    `Имя: ${userName}`
  );
});

// Handle replies from admin (using Telegram "Reply" function)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if this is a reply from admin
  if (chatId.toString() === ADMIN_CHAT_ID && msg.reply_to_message) {
    const originalText = msg.reply_to_message.text || '';
    const idMatch = originalText.match(/ID(?:\sсессии)?:\s*(.+)/);
    let userId = idMatch ? idMatch[1].trim() : null;

    // Telegram user IDs are stored as numbers in the Map, try numeric lookup
    if (userId && !userSessions.has(userId) && /^\d+$/.test(userId)) {
      userId = parseInt(userId);
    }

    console.log('[REPLY] Admin replied, extracted userId:', userId);

    if (userId) {
      // This is a reply to a user message
      const replyText = text;

      // Check if user session exists
      if (!userSessions.has(userId)) {
        bot.sendMessage(ADMIN_CHAT_ID, '❌ Пользователь не найден.');
        return;
      }

      // Store admin message
      const messageData = {
        from: 'admin',
        text: replyText,
        timestamp: Date.now()
      };

      userSessions.get(userId).messages.push(messageData);
      console.log('[SAVE] Saved admin reply for userId:', userId);
      console.log('[SAVE] Total messages for this user:', userSessions.get(userId).messages.length);
      saveData(); // Persist to disk

      // Send to user (only if it's a Telegram user, not web user)
      if (userId.toString().startsWith('web_')) {
        // Web user - message stored only, they'll see it on website
        console.log('[WEB] This is a web user, storing message only');
        bot.sendMessage(ADMIN_CHAT_ID, '✅ Ответ сохранён. Пользователь увидит его на сайте.');
      } else {
        // Telegram user - send via bot
        bot.sendMessage(userId,
          `📨 Ответ от администратора:\n\n${replyText}`
        ).then(() => {
          bot.sendMessage(ADMIN_CHAT_ID, '✅ Ответ отправлен пользователю.');
        }).catch((error) => {
          bot.sendMessage(ADMIN_CHAT_ID, `❌ Ошибка отправки: ${error.message}`);
        });
      }

      return; // Important: stop processing this message
    }
  }

  // Skip commands
  if (text && text.startsWith('/')) return;

  // Skip messages from admin (that are not replies)
  if (chatId.toString() === ADMIN_CHAT_ID) return;

  const userName = msg.from.first_name || 'User';

  // Initialize session if doesn't exist
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, {
      name: userName,
      messages: []
    });
  }

  // Store message
  const messageData = {
    id: msg.message_id,
    from: 'user',
    text: text,
    timestamp: msg.date * 1000
  };

  userSessions.get(chatId).messages.push(messageData);
  saveData(); // Persist to disk

  // Forward to admin
  const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  bot.sendMessage(ADMIN_CHAT_ID,
    `📩 Новое сообщение\n\n` +
    `👤 ${userName}\n` +
    `🆔 ID: ${chatId}\n` +
    `📝 Сообщение:\n${text}\n\n` +
    `⏰ Время: ${timestamp}`
  );

  // Confirm receipt to user
  bot.sendMessage(chatId, '✅ Сообщение отправлено администратору.');
});

// Admin reply command
bot.onText(/\/reply (\S+) (.+)/, (msg, match) => {
  const adminChatId = msg.chat.id;

  // Only admin can reply
  if (adminChatId.toString() !== ADMIN_CHAT_ID) {
    bot.sendMessage(adminChatId, '❌ У вас нет прав для использования этой команды.');
    return;
  }

  const userChatId = match[1];
  const replyText = match[2];

  // Check if user session exists
  if (!userSessions.has(userChatId)) {
    bot.sendMessage(adminChatId, '❌ Пользователь не найден.');
    return;
  }

  // Store admin message
  const messageData = {
    from: 'admin',
    text: replyText,
    timestamp: Date.now()
  };

  userSessions.get(userChatId).messages.push(messageData);
  saveData(); // Persist to disk

  // Send to user (only if it's a Telegram user, not web user)
  if (userChatId.toString().startsWith('web_')) {
    // Web user - message stored only, they'll see it on website
    bot.sendMessage(adminChatId, '✅ Ответ сохранён. Пользователь увидит его на сайте.');
  } else {
    // Telegram user - send via bot
    bot.sendMessage(userChatId,
      `📨 Ответ от администратора:\n\n${replyText}`
    ).then(() => {
      bot.sendMessage(adminChatId, '✅ Ответ отправлен пользователю.');
    }).catch((error) => {
      bot.sendMessage(adminChatId, `❌ Ошибка отправки: ${error.message}`);
    });
  }
});

// Admin list users command
bot.onText(/\/users/, (msg) => {
  const adminChatId = msg.chat.id;

  if (adminChatId.toString() !== ADMIN_CHAT_ID) {
    bot.sendMessage(adminChatId, '❌ У вас нет прав для использования этой команды.');
    return;
  }

  if (userSessions.size === 0) {
    bot.sendMessage(adminChatId, 'Нет активных пользователей.');
    return;
  }

  let userList = '👥 Список пользователей:\n\n';
  for (const [chatId, session] of userSessions.entries()) {
    const messageCount = session.messages.length;
    userList += `• ${session.name} (ID: ${chatId}) - ${messageCount} сообщений\n`;
  }

  bot.sendMessage(adminChatId, userList);
});

// REST API Endpoints

// Get all user sessions (for web interface)
app.get('/api/sessions', (req, res) => {
  const sessions = [];
  for (const [chatId, session] of userSessions.entries()) {
    sessions.push({
      chatId,
      name: session.name,
      messages: session.messages,
      lastMessage: session.messages[session.messages.length - 1] || null
    });
  }
  res.json(sessions);
});

// Send message from web interface (admin to user)
app.post('/api/send', async (req, res) => {
  const { chatId, message } = req.body;

  if (!chatId || !message) {
    return res.status(400).json({ error: 'chatId and message are required' });
  }

  try {
    // Check if user exists
    if (!userSessions.has(chatId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store admin message
    const messageData = {
      from: 'admin',
      text: message,
      timestamp: Date.now()
    };

    userSessions.get(chatId).messages.push(messageData);

    // Try to send via Telegram (if chatId is numeric - Telegram user)
    // If chatId starts with 'web_' - it's a web user, message stored only
    if (!chatId.toString().startsWith('web_')) {
      try {
        await bot.sendMessage(chatId, `📨 Ответ от администратора:\n\n${message}`);
      } catch (telegramError) {
        console.error('Telegram send failed (user might be web-only):', telegramError.message);
      }
    }

    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user messages (for web users)
app.get('/api/user-messages/:userId', (req, res) => {
  const { userId } = req.params;

  if (!userSessions.has(userId)) {
    return res.json({ messages: [] });
  }

  const session = userSessions.get(userId);
  res.json({ messages: session.messages });
});

// Send message from web user
app.post('/api/user-send', async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  try {
    // Initialize session if doesn't exist
    if (!userSessions.has(userId)) {
      userSessions.set(userId, {
        name: 'Web User',
        messages: []
      });

      // Notify admin about new web user
      bot.sendMessage(ADMIN_CHAT_ID,
        `🆕 Новый пользователь с сайта:\n` +
        `ID: ${userId}\n` +
        `Тип: Web`
      );
    }

    // Store message
    const messageData = {
      from: 'user',
      text: message,
      timestamp: Date.now()
    };

    userSessions.get(userId).messages.push(messageData);
    saveData(); // Persist to disk

    // Forward to admin via Telegram
    const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    bot.sendMessage(ADMIN_CHAT_ID,
      `📩 Новое сообщение с сайта\n\n` +
      `👤 ID сессии: ${userId}\n` +
      `📝 Сообщение:\n${message}\n\n` +
      `⏰ Время: ${timestamp}`
    );

    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', users: userSessions.size });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 Telegram bot started`);
  console.log(`👤 Admin ID: ${ADMIN_CHAT_ID}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  bot.stopPolling();
  process.exit(0);
});
