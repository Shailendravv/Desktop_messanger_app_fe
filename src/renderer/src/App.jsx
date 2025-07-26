import React, { useState, useEffect, useCallback } from 'react'
import { Wifi, Globe, Users, Send, Settings, MessageCircle, Monitor, WifiOff } from 'lucide-react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ConnectionStatus from './components/ConnectionStatus'
import { useMessenger } from './hooks/useMessenger'

function App() {
  const {
    currentMode,
    machineId,
    username,
    isJoined,
    messages,
    peers,
    discoveredServices,
    connectionStatus,
    setUsername,
    switchMode,
    joinRoom,
    sendMessage,
    connectToLocalPeer,
    disconnectFromPeer
  } = useMessenger()

  const [showSettings, setShowSettings] = useState(false)

  const handleModeSwitch = useCallback(
    (mode) => {
      switchMode(mode)
    },
    [switchMode]
  )

  const handleJoinRoom = useCallback(() => {
    if (username.trim()) {
      joinRoom(username.trim())
    }
  }, [username, joinRoom])

  const handleSendMessage = useCallback(
    (messageText) => {
      if (messageText.trim() && isJoined) {
        sendMessage({
          message: messageText.trim(),
          username,
          timestamp: Date.now()
        })
      }
    },
    [isJoined, username, sendMessage]
  )

  const handleConnectToPeer = useCallback(
    (service) => {
      connectToLocalPeer({
        host: service.host,
        port: service.port
      })
    },
    [connectToLocalPeer]
  )

  return (
    <div className="h-screen bg-white m-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <Header
        currentMode={currentMode}
        onModeSwitch={handleModeSwitch}
        onSettingsClick={() => setShowSettings(!showSettings)}
      />

      {/* Connection Status Bar */}
      <ConnectionStatus
        connectionStatus={connectionStatus}
        currentMode={currentMode}
        machineId={machineId}
        peersCount={peers.size}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          username={username}
          onUsernameChange={setUsername}
          isJoined={isJoined}
          onJoinRoom={handleJoinRoom}
          peers={peers}
          discoveredServices={discoveredServices}
          currentMode={currentMode}
          onConnectToPeer={handleConnectToPeer}
          onDisconnectFromPeer={disconnectFromPeer}
          machineId={machineId}
        />

        {/* Chat Area */}
        <ChatArea
          messages={messages}
          username={username}
          isJoined={isJoined}
          onSendMessage={handleSendMessage}
          machineId={machineId}
        />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machine ID</label>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-xs text-gray-600 break-all">{machineId}</code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Mode
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleModeSwitch('local')}
                    className={`flex-1 p-2 rounded-lg border ${
                      currentMode === 'local'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Wifi className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs">Local Network</div>
                  </button>
                  <button
                    onClick={() => handleModeSwitch('internet')}
                    className={`flex-1 p-2 rounded-lg border ${
                      currentMode === 'internet'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Globe className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs">Internet</div>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Testing Instructions:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Open multiple instances of this app</li>
                    <li>Each instance gets a unique Machine ID</li>
                    <li>Use "Local Network" mode for testing</li>
                    <li>Services will be discovered automatically</li>
                    <li>Click on discovered services to connect</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
