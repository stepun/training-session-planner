import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, X, Send } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface Message {
  from: 'user' | 'admin'
  text: string
  timestamp: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function UserChat() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate or retrieve user ID from localStorage
  useEffect(() => {
    let storedUserId = localStorage.getItem('chatUserId')
    if (!storedUserId) {
      // Generate unique ID based on timestamp and random number
      storedUserId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('chatUserId', storedUserId)
    }
    setUserId(storedUserId)
  }, [])

  // Fetch messages every 3 seconds when chat is open
  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/user-messages/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)

    return () => clearInterval(interval)
  }, [isOpen, userId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !userId) return

    setSending(true)
    try {
      const response = await fetch(`${API_URL}/user-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: message.trim()
        })
      })

      if (response.ok) {
        setMessage('')
        // Immediately add message to local state for instant feedback
        const newMessage: Message = {
          from: 'user',
          text: message.trim(),
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, newMessage])
      } else {
        alert('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const chatContent = !isOpen ? (
    <Button
      onClick={() => setIsOpen(true)}
      className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}
      title="Chat with Support"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  ) : (
    <Card
      className="w-full max-w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-8rem)] md:h-[500px] shadow-2xl flex flex-col overflow-hidden"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold">Support Chat</h3>
          <p className="text-xs opacity-90">We typically reply in a few minutes</p>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-semibold mb-1">Start a conversation</p>
            <p className="text-xs">Send us a message and we'll respond as soon as possible</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.from === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {msg.from === 'admin' && (
                  <p className="text-xs font-semibold mb-1 text-blue-600">Support Team</p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.from === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )

  // Render using portal to ensure fixed positioning works correctly
  return createPortal(chatContent, document.body)
}
