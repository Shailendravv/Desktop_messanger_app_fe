import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, User } from 'lucide-react'

const ChatArea = ({ messages, username, isJoined, onSendMessage, machineId }) => {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageInput.trim() && isJoined) {
      onSendMessage(messageInput.trim())
      setMessageInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatMachineId = (id) => {
    if (!id) return 'Unknown'
    return id.length > 12 ? `${id.slice(0, 4)}...${id.slice(-4)}` : id
  }

  const getMessageAlignment = (message) => {
    if (message.type === 'system') return 'center'
    if (message.type === 'sent' || message.senderId === machineId) return 'right'
    return 'left'
  }

  const renderMessage = (message, index) => {
    const alignment = getMessageAlignment(message)

    if (message.type === 'system') {
      return (
        <div key={message.id} className="flex justify-center mb-4">
          <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm">
            {message.message}
          </div>
        </div>
      )
    }

    const isOwn = alignment === 'right'

    return (
      <div
        key={message.id}
        className={`flex mb-4 message-bubble-enter ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
            }`}
          >
            <div className="break-words whitespace-pre-wrap">{message.message}</div>
          </div>

          <div className={`mt-1 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center space-x-2">
              {!isOwn && (
                <>
                  <span className="font-medium">{message.username}</span>
                  <span className="font-mono text-xs">({formatMachineId(message.senderId)})</span>
                </>
              )}
              <span>{formatTime(message.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isJoined) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Welcome to Desktop Messenger
            </h3>
            <p className="text-gray-500 max-w-md">
              Enter your username and join the chat to start messaging with peers on your local
              network or across the internet.
            </p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Quick Start:</h4>
              <ol className="text-sm text-blue-700 text-left space-y-1">
                <li>1. Enter your username in the sidebar</li>
                <li>2. Click "Join Chat"</li>
                <li>3. Wait for peers to be discovered</li>
                <li>4. Start messaging!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Messages Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isJoined ? 'Type your message...' : 'Join the chat to send messages'}
              disabled={!isJoined}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              maxLength={500}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {messageInput.length}/500
            </div>
          </div>

          <button
            type="submit"
            disabled={!messageInput.trim() || !isJoined}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        {isJoined && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <User className="w-3 h-3" />
              <span>
                Signed in as <strong>{username}</strong>
              </span>
            </div>
            <div className="font-mono">Your ID: {formatMachineId(machineId)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatArea
