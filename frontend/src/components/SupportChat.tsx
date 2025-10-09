import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, X, Send } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface Message {
  from: 'user' | 'admin'
  text: string
  timestamp: number
}

interface ChatSession {
  chatId: string
  name: string
  messages: Message[]
  lastMessage: Message | null
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function SupportChat() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch sessions every 5 seconds
  useEffect(() => {
    if (!isOpen) return

    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sessions`)
        if (response.ok) {
          const data = await response.json()
          setSessions(data)

          // Update selected session if it exists
          if (selectedSession) {
            const updated = data.find((s: ChatSession) => s.chatId === selectedSession.chatId)
            if (updated) {
              setSelectedSession(updated)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      }
    }

    fetchSessions()
    const interval = setInterval(fetchSessions, 5000)

    return () => clearInterval(interval)
  }, [isOpen, selectedSession])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedSession?.messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedSession || sending) return

    setSending(true)
    try {
      const response = await fetch(`${API_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedSession.chatId,
          message: message.trim()
        })
      })

      if (response.ok) {
        setMessage('')
        // Refresh sessions to get updated messages
        const sessionsResponse = await fetch(`${API_URL}/api/sessions`)
        if (sessionsResponse.ok) {
          const data = await sessionsResponse.json()
          setSessions(data)
          const updated = data.find((s: ChatSession) => s.chatId === selectedSession.chatId)
          if (updated) {
            setSelectedSession(updated)
          }
        }
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-50"
        title="Support Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold">Support Chat</h3>
          <p className="text-xs opacity-90">{sessions.length} active conversations</p>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-green-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sessions List */}
        {!selectedSession && (
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((session) => (
                  <div
                    key={session.chatId}
                    onClick={() => setSelectedSession(session)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{session.name}</span>
                      {session.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(session.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      ID: {session.chatId}
                    </p>
                    {session.lastMessage && (
                      <p className="text-sm text-gray-700 truncate mt-1">
                        {session.lastMessage.from === 'admin' ? '👤 ' : ''}
                        {session.lastMessage.text}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {session.messages.length} messages
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat View */}
        {selectedSession && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
              <div>
                <Button
                  onClick={() => setSelectedSession(null)}
                  variant="ghost"
                  size="sm"
                  className="text-xs mb-1"
                >
                  ← Back
                </Button>
                <p className="font-semibold text-sm">{selectedSession.name}</p>
                <p className="text-xs text-gray-500">ID: {selectedSession.chatId}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedSession.messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-8">
                  No messages yet
                </div>
              ) : (
                selectedSession.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.from === 'admin'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.from === 'admin' ? 'text-green-100' : 'text-gray-500'
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
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
