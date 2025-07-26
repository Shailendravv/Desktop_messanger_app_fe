import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Server } from 'socket.io'
import { io } from 'socket.io-client'
import { machineId } from 'node-machine-id'
import { Bonjour } from 'bonjour-service'
import { createServer } from 'http'

let mainWindow
let localServer
let internetSocket
let bonjour
let currentMode = 'local' // 'local' or 'internet'
let machineIdentifier
let connectedPeers = new Map()
let localPeerSockets = new Map()

// For testing purposes - you can deploy this to Heroku/Railway/Vercel
// const INTERNET_SERVER_URL = 'wss://your-messaging-server.herokuapp.com'
const INTERNET_SERVER_URL = 'wss://desktop-messanger-app.onrender.com'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Initialize machine identifier with test mode support
async function initializeMachineId() {
  try {
    const baseMachineId = await machineId()
    // Add random suffix for testing multiple instances
    const testSuffix = Math.random().toString(36).substr(2, 4)
    machineIdentifier = `${baseMachineId}-${testSuffix}`
    console.log('Machine ID:', machineIdentifier)
  } catch (error) {
    console.error('Error getting machine ID:', error)
    machineIdentifier = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Start local server for P2P communication
function startLocalServer() {
  stopLocalServer()

  const httpServer = createServer()
  localServer = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  const PORT = Math.floor(Math.random() * 1000) + 8000 // Random port for testing

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Local server started on port ${PORT}`)

    // Advertise service on local network
    advertiseService(PORT)

    mainWindow?.webContents.send('local-server-started', { port: PORT })
  })

  localServer.on('connection', (socket) => {
    console.log('Local client connected:', socket.id)

    socket.on('join-room', (data) => {
      const { username, machineId: clientMachineId } = data
      socket.username = username
      socket.machineId = clientMachineId

      connectedPeers.set(socket.id, {
        username,
        machineId: clientMachineId,
        socketId: socket.id,
        type: 'local'
      })

      mainWindow?.webContents.send('peer-connected', {
        username,
        machineId: clientMachineId,
        socketId: socket.id,
        type: 'local'
      })

      socket.broadcast.emit('user-joined', {
        username,
        machineId: clientMachineId,
        socketId: socket.id
      })

      // Send current user info to new peer
      socket.emit('user-joined', {
        username: 'You',
        machineId: machineIdentifier,
        socketId: 'self'
      })
    })

    socket.on('send-message', (data) => {
      const messageData = {
        ...data,
        timestamp: Date.now(),
        senderSocketId: socket.id,
        type: 'received'
      }

      socket.broadcast.emit('message-received', messageData)
      mainWindow?.webContents.send('message-received', messageData)
    })

    socket.on('disconnect', () => {
      console.log('Local client disconnected:', socket.id)

      const peer = connectedPeers.get(socket.id)
      if (peer) {
        connectedPeers.delete(socket.id)

        mainWindow?.webContents.send('peer-disconnected', {
          socketId: socket.id,
          username: peer.username,
          machineId: peer.machineId
        })

        socket.broadcast.emit('user-left', {
          username: peer.username,
          machineId: peer.machineId,
          socketId: socket.id
        })
      }
    })
  })
}

function stopLocalServer() {
  if (localServer) {
    localServer.close()
    localServer = null
  }

  if (bonjour) {
    bonjour.destroy()
    bonjour = null
  }

  // Disconnect all local peer connections
  localPeerSockets.forEach((socket) => socket.disconnect())
  localPeerSockets.clear()
}

// Advertise service on local network
function advertiseService(port) {
  if (bonjour) {
    bonjour.destroy()
  }

  bonjour = new Bonjour()
  bonjour.publish({
    name: `DesktopMessenger-${machineIdentifier.slice(-8)}`,
    type: 'desktop-messenger',
    port: port,
    txt: {
      id: machineIdentifier,
      version: '1.0.0'
    }
  })

  console.log('Service advertised on local network')
}

// Discover local services
function discoverLocalServices() {
  if (!bonjour) {
    bonjour = new Bonjour()
  }

  const browser = bonjour.find({ type: 'desktop-messenger' })

  browser.on('up', (service) => {
    if (service.txt && service.txt.id !== machineIdentifier) {
      console.log('Discovered local service:', service)

      mainWindow?.webContents.send('local-service-discovered', {
        name: service.name,
        host: service.referer.address,
        port: service.port,
        id: service.txt.id,
        version: service.txt.version || '1.0.0'
      })
    }
  })

  browser.on('down', (service) => {
    console.log('Local service went down:', service.name)

    mainWindow?.webContents.send('local-service-lost', {
      name: service.name,
      id: service.txt?.id
    })
  })
}

// Connect to local peer
function connectToLocalPeer(host, port) {
  const peerKey = `${host}:${port}`

  if (localPeerSockets.has(peerKey)) {
    console.log('Already connected to this peer')
    return { success: false, error: 'Already connected' }
  }

  const socket = io(`http://${host}:${port}`, {
    timeout: 5000
  })

  socket.on('connect', () => {
    console.log('Connected to local peer:', peerKey)
    localPeerSockets.set(peerKey, socket)

    mainWindow?.webContents.send('local-peer-connected', {
      host,
      port,
      socketId: socket.id
    })
  })

  socket.on('message-received', (data) => {
    mainWindow?.webContents.send('message-received', {
      ...data,
      type: 'received'
    })
  })

  socket.on('user-joined', (data) => {
    if (data.machineId !== machineIdentifier) {
      mainWindow?.webContents.send('peer-connected', {
        ...data,
        type: 'local-peer'
      })
    }
  })

  socket.on('user-left', (data) => {
    mainWindow?.webContents.send('peer-disconnected', data)
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from local peer:', peerKey)
    localPeerSockets.delete(peerKey)

    mainWindow?.webContents.send('local-peer-disconnected', { host, port })
  })

  socket.on('connect_error', (error) => {
    console.error('Failed to connect to local peer:', error)
    localPeerSockets.delete(peerKey)

    mainWindow?.webContents.send('local-peer-connection-failed', {
      host,
      port,
      error: error.message
    })
  })

  return { success: true, socket }
}

// Internet communication
function connectToInternetServer() {
  if (internetSocket) {
    internetSocket.disconnect()
  }

  internetSocket = io(INTERNET_SERVER_URL, {
    timeout: 10000
  })

  internetSocket.on('connect', () => {
    console.log('Connected to internet server')
    mainWindow?.webContents.send('internet-connected')
  })

  internetSocket.on('message-received', (data) => {
    mainWindow?.webContents.send('message-received', {
      ...data,
      type: 'received'
    })
  })

  internetSocket.on('user-joined', (data) => {
    if (data.machineId !== machineIdentifier) {
      mainWindow?.webContents.send('peer-connected', {
        ...data,
        type: 'internet'
      })
    }
  })

  internetSocket.on('user-left', (data) => {
    mainWindow?.webContents.send('peer-disconnected', data)
  })

  internetSocket.on('disconnect', () => {
    console.log('Disconnected from internet server')
    mainWindow?.webContents.send('internet-disconnected')
  })

  internetSocket.on('connect_error', (error) => {
    console.error('Failed to connect to internet server:', error)
    mainWindow?.webContents.send('internet-connection-failed', { error: error.message })
  })
}

// IPC Handlers
ipcMain.handle('get-machine-id', () => {
  return machineIdentifier
})

ipcMain.handle('switch-mode', async (_, mode) => {
  currentMode = mode

  if (mode === 'local') {
    if (internetSocket) {
      internetSocket.disconnect()
      internetSocket = null
    }

    startLocalServer()
    discoverLocalServices()
  } else {
    stopLocalServer()
    connectToInternetServer()
  }

  return { success: true, mode }
})

ipcMain.handle('get-current-mode', () => {
  return currentMode
})

ipcMain.handle('send-message', (_, data) => {
  const messageData = {
    ...data,
    timestamp: Date.now(),
    senderId: machineIdentifier,
    type: 'sent'
  }

  if (currentMode === 'local') {
    // Send to local server clients
    if (localServer) {
      localServer.emit('message-received', messageData)
    }

    // Send to connected local peers
    localPeerSockets.forEach((socket) => {
      socket.emit('send-message', messageData)
    })
  } else if (currentMode === 'internet' && internetSocket && internetSocket.connected) {
    internetSocket.emit('send-message', messageData)
  }

  return messageData
})

ipcMain.handle('join-room', (_, data) => {
  const joinData = {
    ...data,
    machineId: machineIdentifier
  }

  if (currentMode === 'local') {
    // Join local server room
    if (localServer) {
      mainWindow?.webContents.send('room-joined', joinData)
    }

    // Join connected local peers
    localPeerSockets.forEach((socket) => {
      socket.emit('join-room', joinData)
    })
  } else if (currentMode === 'internet' && internetSocket && internetSocket.connected) {
    internetSocket.emit('join-room', joinData)
  }

  return joinData
})

ipcMain.handle('connect-to-local-peer', (_, { host, port }) => {
  return connectToLocalPeer(host, port || 8080)
})

ipcMain.handle('disconnect-from-peer', (_, { host, port }) => {
  const peerKey = `${host}:${port}`
  const socket = localPeerSockets.get(peerKey)

  if (socket) {
    socket.disconnect()
    localPeerSockets.delete(peerKey)
    return { success: true }
  }

  return { success: false, error: 'Peer not found' }
})

ipcMain.handle('get-connection-stats', () => {
  return {
    localServerActive: !!localServer,
    internetConnected: internetSocket?.connected || false,
    localPeersCount: localPeerSockets.size,
    connectedPeersCount: connectedPeers.size,
    currentMode
  }
})

// App event handlers
app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await initializeMachineId()
  createWindow()

  // Start in local mode by default
  startLocalServer()
  setTimeout(() => {
    discoverLocalServices()
  }, 1000)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  cleanup()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  cleanup()
})

function cleanup() {
  stopLocalServer()

  if (internetSocket) {
    internetSocket.disconnect()
    internetSocket = null
  }

  connectedPeers.clear()
}
