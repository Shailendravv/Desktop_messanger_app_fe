import React, { useState } from 'react'
import { Users, Wifi, Monitor, User, LogIn, Scan, Link, Unlink } from 'lucide-react'

const Sidebar = ({
  username,
  onUsernameChange,
  isJoined,
  onJoinRoom,
  peers,
  discoveredServices,
  currentMode,
  onConnectToPeer,
  onDisconnectFromPeer,
  machineId
}) => {
  const [isConnecting, setIsConnecting] = useState(new Set())

  const handleConnectToPeer = async (service) => {
    const key = service.id
    setIsConnecting((prev) => new Set([...prev, key]))

    try {
      await onConnectToPeer(service)
    } finally {
      setIsConnecting((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  const handleDisconnectFromPeer = async (service) => {
    try {
      await onDisconnectFromPeer({
        host: service.host,
        port: service.port
      })
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const formatMachineId = (id) => {
    if (!id) return 'Unknown'
    return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* User Setup Section */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">User Setup</h3>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Enter your username"
            maxLength={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={isJoined}
          />

          {!isJoined ? (
            <button
              onClick={onJoinRoom}
              disabled={!username.trim()}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Chat</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">Connected as {username}</span>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded font-mono">
            ID: {formatMachineId(machineId)}
          </div>
        </div>
      </div>

      {/* Connected Peers Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Connected Peers ({peers.size})</h3>
          </div>

          {peers.size > 0 ? (
            <div className="space-y-2">
              {Array.from(peers.values()).map((peer) => (
                <div
                  key={peer.socketId || peer.machineId}
                  className="p-3 bg-white border border-gray-200 rounded-lg peer-animation"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">{peer.username}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {peer.type || 'local'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    {formatMachineId(peer.machineId)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No peers connected</p>
              <p className="text-xs mt-1">
                {currentMode === 'local'
                  ? 'Waiting for local discoveries...'
                  : 'Waiting for internet connections...'}
              </p>
            </div>
          )}
        </div>

        {/* Local Network Discovery Section */}
        {currentMode === 'local' && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Scan className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                Discovered Services ({discoveredServices.size})
              </h3>
            </div>

            {discoveredServices.size > 0 ? (
              <div className="space-y-2">
                {Array.from(discoveredServices.values()).map((service) => (
                  <div
                    key={service.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg peer-animation"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900 text-sm">
                          {service.name || 'Desktop Messenger'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {service.connected ? (
                          <button
                            onClick={() => handleDisconnectFromPeer(service)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Disconnect"
                          >
                            <Unlink className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnectToPeer(service)}
                            disabled={isConnecting.has(service.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                            title="Connect"
                          >
                            {isConnecting.has(service.id) ? (
                              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Link className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="font-mono">
                        {service.host}:{service.port}
                      </div>
                      <div className="font-mono">ID: {formatMachineId(service.id)}</div>
                      {service.connected && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>Connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wifi className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Scanning for services...</p>
                <p className="text-xs mt-1">
                  Make sure other instances are running on the same network
                </p>
              </div>
            )}
          </div>
        )}

        {/* Testing Instructions */}
        <div className="p-6 border-t border-gray-200">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Monitor className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Testing Mode</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• Open multiple app instances</p>
                  <p>• Each gets unique Machine ID</p>
                  <p>• Services auto-discover on LAN</p>
                  <p>• Click discovered services to connect</p>
                  <p>• Use different usernames for clarity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
