import React from 'react'
import { Wifi, Globe, Server, Users, WifiOff } from 'lucide-react'

const ConnectionStatus = ({ connectionStatus, currentMode, machineId, peersCount }) => {
  const getStatusColor = () => {
    if (!connectionStatus.connected) return 'text-red-500'
    if (currentMode === 'local' && connectionStatus.localServerActive) return 'text-green-500'
    if (currentMode === 'internet' && connectionStatus.internetConnected) return 'text-green-500'
    return 'text-yellow-500'
  }

  const getStatusText = () => {
    if (currentMode === 'local') {
      if (connectionStatus.localServerActive) {
        return `Local Server Active • ${peersCount} peer${peersCount !== 1 ? 's' : ''} connected`
      }
      return 'Local Server Starting...'
    } else {
      if (connectionStatus.internetConnected) {
        return `Internet Connected • ${peersCount} peer${peersCount !== 1 ? 's' : ''} connected`
      }
      return 'Connecting to Internet Server...'
    }
  }

  const getStatusIcon = () => {
    if (!connectionStatus.connected) {
      return <WifiOff className="w-4 h-4" />
    }

    if (currentMode === 'local') {
      return <Server className="w-4 h-4" />
    } else {
      return <Globe className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <div className="connection-indicator">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
          </div>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-500">
        {currentMode === 'local' && (
          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3" />
            <span>Local Network</span>
          </div>
        )}

        {currentMode === 'internet' && (
          <div className="flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>Internet Mode</span>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{peersCount} Connected</span>
        </div>

        <div className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">
          {machineId ? `ID: ${machineId.slice(-8)}` : 'Loading...'}
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus
