import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Machine identification
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),

  // Mode switching
  switchMode: (mode) => ipcRenderer.invoke('switch-mode', mode),
  getCurrentMode: () => ipcRenderer.invoke('get-current-mode'),

  // Messaging
  sendMessage: (data) => ipcRenderer.invoke('send-message', data),
  joinRoom: (data) => ipcRenderer.invoke('join-room', data),

  // Local network
  connectToLocalPeer: (data) => ipcRenderer.invoke('connect-to-local-peer', data),
  disconnectFromPeer: (data) => ipcRenderer.invoke('disconnect-from-peer', data),

  // Connection stats
  getConnectionStats: () => ipcRenderer.invoke('get-connection-stats'),

  // Event listeners with cleanup
  onMessageReceived: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('message-received', listener)
    return () => ipcRenderer.removeListener('message-received', listener)
  },

  onPeerConnected: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('peer-connected', listener)
    return () => ipcRenderer.removeListener('peer-connected', listener)
  },

  onPeerDisconnected: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('peer-disconnected', listener)
    return () => ipcRenderer.removeListener('peer-disconnected', listener)
  },

  onLocalServiceDiscovered: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('local-service-discovered', listener)
    return () => ipcRenderer.removeListener('local-service-discovered', listener)
  },

  onLocalServiceLost: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('local-service-lost', listener)
    return () => ipcRenderer.removeListener('local-service-lost', listener)
  },

  onLocalServerStarted: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('local-server-started', listener)
    return () => ipcRenderer.removeListener('local-server-started', listener)
  },

  onLocalPeerConnected: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('local-peer-connected', listener)
    return () => ipcRenderer.removeListener('local-peer-connected', listener)
  },

  onLocalPeerDisconnected: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('local-peer-disconnected', listener)
    return () => ipcRenderer.removeListener('local-peer-disconnected', listener)
  },

  onLocalPeerConnectionFailed: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('local-peer-connection-failed', listener)
    return () => ipcRenderer.removeListener('local-peer-connection-failed', listener)
  },

  onInternetConnected: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('internet-connected', listener)
    return () => ipcRenderer.removeListener('internet-connected', listener)
  },

  onInternetDisconnected: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('internet-disconnected', listener)
    return () => ipcRenderer.removeListener('internet-disconnected', listener)
  },

  onInternetConnectionFailed: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('internet-connection-failed', listener)
    return () => ipcRenderer.removeListener('internet-connection-failed', listener)
  },

  onRoomJoined: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on('room-joined', listener)
    return () => ipcRenderer.removeListener('room-joined', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
