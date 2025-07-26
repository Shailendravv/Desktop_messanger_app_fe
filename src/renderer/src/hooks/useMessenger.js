import { useState, useEffect, useCallback, useRef } from 'react'

export function useMessenger() {
  const [currentMode, setCurrentMode] = useState('local')
  const [machineId, setMachineId] = useState('')
  const [username, setUsername] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [peers, setPeers] = useState(new Map())
  const [discoveredServices, setDiscoveredServices] = useState(new Map())
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    localServerActive: false,
    internetConnected: false,
    localPeersCount: 0,
    connectedPeersCount: 0
  })

  const cleanupFunctions = useRef([])

  // Initialize
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const id = await window.api.getMachineId()
        setMachineId(id)

        const mode = await window.api.getCurrentMode()
        setCurrentMode(mode)

        // Update connection stats
        updateConnectionStats()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [])

  // Setup event listeners
  useEffect(() => {
    const setupEventListeners = () => {
      // Clear previous listeners
      cleanupFunctions.current.forEach((cleanup) => cleanup())
      cleanupFunctions.current = []

      // Message received
      const unsubscribeMessageReceived = window.api.onMessageReceived((data) => {
        console.log('Message received:', data)
        setMessages((prev) => [
          ...prev,
          {
            id: `${data.timestamp}-${Math.random()}`,
            ...data,
            type: data.senderId === machineId ? 'sent' : 'received'
          }
        ])
      })
      cleanupFunctions.current.push(unsubscribeMessageReceived)

      // Peer connected
      const unsubscribePeerConnected = window.api.onPeerConnected((data) => {
        console.log('Peer connected:', data)
        setPeers((prev) => {
          const newPeers = new Map(prev)
          newPeers.set(data.socketId || data.machineId, {
            ...data,
            connectedAt: Date.now()
          })
          return newPeers
        })
        updateConnectionStats()
      })
      cleanupFunctions.current.push(unsubscribePeerConnected)

      // Peer disconnected
      const unsubscribePeerDisconnected = window.api.onPeerDisconnected((data) => {
        console.log('Peer disconnected:', data)
        setPeers((prev) => {
          const newPeers = new Map(prev)
          newPeers.delete(data.socketId || data.machineId)
          return newPeers
        })
        updateConnectionStats()
      })
      cleanupFunctions.current.push(unsubscribePeerDisconnected)

      // Local service discovered
      const unsubscribeLocalServiceDiscovered = window.api.onLocalServiceDiscovered((data) => {
        console.log('Local service discovered:', data)
        setDiscoveredServices((prev) => {
          const newServices = new Map(prev)
          newServices.set(data.id, {
            ...data,
            discoveredAt: Date.now(),
            connected: false
          })
          return newServices
        })
      })
      cleanupFunctions.current.push(unsubscribeLocalServiceDiscovered)

      // Local service lost
      const unsubscribeLocalServiceLost = window.api.onLocalServiceLost((data) => {
        console.log('Local service lost:', data)
        setDiscoveredServices((prev) => {
          const newServices = new Map(prev)
          newServices.delete(data.id)
          return newServices
        })
      })
      cleanupFunctions.current.push(unsubscribeLocalServiceLost)

      // Local peer connected
      const unsubscribeLocalPeerConnected = window.api.onLocalPeerConnected((data) => {
        console.log('Local peer connected:', data)
        setDiscoveredServices((prev) => {
          const newServices = new Map(prev)
          const serviceKey = Array.from(newServices.entries()).find(
            ([key, service]) => service.host === data.host && service.port === data.port
          )?.[0]

          if (serviceKey) {
            const service = newServices.get(serviceKey)
            newServices.set(serviceKey, { ...service, connected: true })
          }
          return newServices
        })
        updateConnectionStats()
      })
      cleanupFunctions.current.push(unsubscribeLocalPeerConnected)

      // Local peer disconnected
      const unsubscribeLocalPeerDisconnected = window.api.onLocalPeerDisconnected((data) => {
        console.log('Local peer disconnected:', data)
        setDiscoveredServices((prev) => {
          const newServices = new Map(prev)
          const serviceKey = Array.from(newServices.entries()).find(
            ([key, service]) => service.host === data.host && service.port === data.port
          )?.[0]

          if (serviceKey) {
            const service = newServices.get(serviceKey)
            newServices.set(serviceKey, { ...service, connected: false })
          }
          return newServices
        })
        updateConnectionStats()
      })
      cleanupFunctions.current.push(unsubscribeLocalPeerDisconnected)

      // Local peer connection failed
      const unsubscribeLocalPeerConnectionFailed = window.api.onLocalPeerConnectionFailed(
        (data) => {
          console.error('Local peer connection failed:', data)
          // You could show a notification here
        }
      )
      cleanupFunctions.current.push(unsubscribeLocalPeerConnectionFailed)

      // Internet connected
      const unsubscribeInternetConnected = window.api.onInternetConnected(() => {
        console.log('Internet connected')
        setConnectionStatus((prev) => ({ ...prev, internetConnected: true, connected: true }))
      })
      cleanupFunctions.current.push(unsubscribeInternetConnected)

      // Internet disconnected
      const unsubscribeInternetDisconnected = window.api.onInternetDisconnected(() => {
        console.log('Internet disconnected')
        setConnectionStatus((prev) => ({ ...prev, internetConnected: false, connected: false }))
      })
      cleanupFunctions.current.push(unsubscribeInternetDisconnected)

      // Internet connection failed
      const unsubscribeInternetConnectionFailed = window.api.onInternetConnectionFailed((data) => {
        console.error('Internet connection failed:', data)
        setConnectionStatus((prev) => ({ ...prev, internetConnected: false, connected: false }))
      })
      cleanupFunctions.current.push(unsubscribeInternetConnectionFailed)

      // Room joined
      const unsubscribeRoomJoined = window.api.onRoomJoined((data) => {
        console.log('Room joined:', data)
        setIsJoined(true)
      })
      cleanupFunctions.current.push(unsubscribeRoomJoined)

      // Local server started
      const unsubscribeLocalServerStarted = window.api.onLocalServerStarted((data) => {
        console.log('Local server started:', data)
        setConnectionStatus((prev) => ({
          ...prev,
          localServerActive: true,
          connected: true
        }))
      })
      cleanupFunctions.current.push(unsubscribeLocalServerStarted)
    }

    setupEventListeners()

    return () => {
      cleanupFunctions.current.forEach((cleanup) => cleanup())
    }
  }, [machineId])

  const updateConnectionStats = useCallback(async () => {
    try {
      const stats = await window.api.getConnectionStats()
      setConnectionStatus((prev) => ({
        ...prev,
        ...stats,
        connected: stats.localServerActive || stats.internetConnected
      }))
    } catch (error) {
      console.error('Failed to update connection stats:', error)
    }
  }, [])

  const switchMode = useCallback(
    async (mode) => {
      try {
        const result = await window.api.switchMode(mode)
        if (result.success) {
          setCurrentMode(mode)
          setIsJoined(false)
          setMessages([])
          setPeers(new Map())
          setDiscoveredServices(new Map())

          // Update connection stats after a short delay
          setTimeout(updateConnectionStats, 1000)
        }
      } catch (error) {
        console.error('Failed to switch mode:', error)
      }
    },
    [updateConnectionStats]
  )

  const joinRoom = useCallback(async (username) => {
    try {
      const result = await window.api.joinRoom({ username })
      if (result) {
        setIsJoined(true)
        setUsername(username)

        // Add system message
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            message: `You joined as ${username}`,
            timestamp: Date.now()
          }
        ])
      }
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }, [])

  const sendMessage = useCallback(async (messageData) => {
    try {
      const result = await window.api.sendMessage(messageData)
      if (result) {
        setMessages((prev) => [
          ...prev,
          {
            id: `${result.timestamp}-${Math.random()}`,
            ...result,
            type: 'sent'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [])

  const connectToLocalPeer = useCallback(async (peerData) => {
    try {
      const result = await window.api.connectToLocalPeer(peerData)
      console.log('Connect to peer result:', result)
      return result
    } catch (error) {
      console.error('Failed to connect to local peer:', error)
      return { success: false, error: error.message }
    }
  }, [])

  const disconnectFromPeer = useCallback(async (peerData) => {
    try {
      const result = await window.api.disconnectFromPeer(peerData)
      return result
    } catch (error) {
      console.error('Failed to disconnect from peer:', error)
      return { success: false, error: error.message }
    }
  }, [])

  return {
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
    disconnectFromPeer,
    updateConnectionStats
  }
}
