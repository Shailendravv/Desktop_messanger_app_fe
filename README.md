# 💬 Desktop Messenger

A modern, real-time messaging application built with **React**, **Electron**, **Vite**, and **Tailwind CSS**. Supports both local network (P2P) and internet-based communication with automatic peer discovery.

![Desktop Messenger](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🔄 **Dual Communication Modes**: Switch between local network and internet communication
- 🚀 **Real-time Messaging**: Instant message delivery with Socket.IO
- 🔍 **Auto-discovery**: Automatic discovery of peers on local network using Bonjour/mDNS
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- 🔒 **Unique Identification**: Each instance has a unique machine ID
- 📱 **Cross-platform**: Works on Windows, macOS, and Linux
- 🧪 **Testing-friendly**: Multiple instances for single-system testing
- ⚡ **Built with Vite**: Fast development and build times

## 🖼️ Screenshots

### Main Interface

```
┌─────────────────────────────────────────────────────┐
│ 💬 Desktop Messenger        [Local] [Internet] ⚙️  │
├─────────────────────────────────────────────────────┤
│ 🔘 Local Server Active • 2 peers connected         │
├──────────────┬──────────────────────────────────────┤
│ User Setup   │                                      │
│ ┌──────────┐ │     Welcome to Desktop Messenger     │
│ │username  │ │                                      │
│ └──────────┘ │  Enter your username and join the    │
│ [Join Chat]  │  chat to start messaging with peers  │
│              │                                      │
│ Peers (2)    │                                      │
│ 🟢 Alice     │                                      │
│ 🟢 Bob       │                                      │
│              │                                      │
│ Services (1) │                                      │
│ 🖥️ PC-001    │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone or create the project**:

```bash
# Method 1: Start with electron-vite template
npm create electron-vite@latest desktop-messenger --template react
cd desktop-messenger

# Method 2: Clone this repository (if available)
git clone <repository-url>
cd desktop-messenger
```

2. **Install dependencies**:

```bash
npm install socket.io socket.io-client node-machine-id bonjour-service lucide-react
npm install -D tailwindcss autoprefixer postcss
```

3. **Initialize Tailwind CSS**:

```bash
npx tailwindcss init -p
```

4. **Add the provided source files** (replace the generated template files)

5. **Create resources directory**:

```bash
mkdir resources
# Add an icon.png file (app icon)
```

### Development

```bash
# Start development server
npm run dev

# For testing with multiple instances
# Terminal 1:
npm run dev

# Terminal 2:
npm run dev
# (Each instance gets unique machine ID)
```

### Production Build

```bash
# Build the app
npm run build

# Create Windows executable
npm run build:win

# Create macOS app
npm run build:mac

# Create Linux package
npm run build:linux
```

The executable will be created in the `dist` directory.

## 🔧 Configuration

### Internet Mode Setup

To use internet communication, deploy the included server and update the URL:

1. **Deploy the server** (see [Server Deployment](#server-deployment))
2. **Update the URL** in `src/main/index.js`:

```javascript
const INTERNET_SERVER_URL = 'https://your-deployed-server.herokuapp.com'
```

### Local Network Configuration

No configuration needed! The app automatically:

- Starts a local Socket.IO server
- Advertises itself via Bonjour/mDNS
- Discovers other instances on the network

## 🏗️ Project Structure

```
desktop-messenger/
├── src/
│   ├── main/
│   │   └── index.js              # Electron main process
│   ├── preload/
│   │   └── index.js              # IPC preload script
│   └── renderer/
│       ├── index.html            # Main HTML template
│       └── src/
│           ├── main.jsx          # React entry point
│           ├── App.jsx           # Main application component
│           ├── assets/
│           │   └── index.css     # Tailwind CSS styles
│           ├── components/
│           │   ├── Header.jsx    # App header with mode toggle
│           │   ├── Sidebar.jsx   # User setup and peers list
│           │   ├── ChatArea.jsx  # Message display and input
│           │   └── ConnectionStatus.jsx # Connection indicators
│           └── hooks/
│               └── useMessenger.js # Main messaging logic hook
├── resources/
│   └── icon.png                  # Application icon
├── server.js                     # Optional internet server
├── package.json
├── electron.vite.config.js       # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── README.md
```

## 🧪 Testing

### Single System Testing

Since you might not have multiple systems available, the app includes several testing methods:

#### Method 1: Multiple Instances (Recommended)

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev

# Each instance gets a unique machine ID automatically
```

#### Method 2: Built Executables

```bash
npm run build:win
# Run the generated .exe file multiple times
```

#### Method 3: Different Ports (Advanced)

```bash
# Terminal 1
ELECTRON_RENDERER_PORT=3000 npm run dev

# Terminal 2
ELECTRON_RENDERER_PORT=3001 npm run dev
```

### Testing Checklist

- [ ] Multiple instances launch successfully
- [ ] Each instance shows unique machine ID
- [ ] Local services are discovered automatically
- [ ] Messages send and receive in real-time
- [ ] Internet mode connects to deployed server
- [ ] Mode switching works correctly

## 🌐 Server Deployment

For internet communication, deploy the included `server.js`:

### Heroku Deployment

1. **Create a new Heroku app**:

```bash
heroku create your-messenger-server
```

2. **Create server package.json**:

```json
{
  "name": "desktop-messenger-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.5",
    "cors": "^2.8.5"
  }
}
```

3. **Deploy**:

```bash
git add .
git commit -m "Deploy server"
git push heroku main
```

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Deploy the server directory
3. Railway will automatically detect and deploy

### Other Platforms

The server works on any Node.js hosting platform:

- **Render**: Connect repository and deploy
- **Vercel**: Deploy as serverless function
- **DigitalOcean App Platform**: Deploy from GitHub

## 🎨 Customization

### Styling

The app uses Tailwind CSS for styling. Customize by:

1. **Editing component classes** in JSX files
2. **Modifying Tailwind config** in `tailwind.config.js`
3. **Adding custom CSS** in `src/renderer/src/assets/index.css`

### Adding Features

Popular extensions:

- **File sharing**: Extend the messaging protocol
- **Voice/Video chat**: Integrate WebRTC
- **Message encryption**: Add end-to-end encryption
- **Chat rooms**: Support multiple conversation rooms
- **Message history**: Persistent message storage

## 🛠️ Troubleshooting

### Common Issues

**Local discovery not working**:

- Check Windows Firewall settings
- Ensure mDNS/Bonjour is enabled
- Try different port ranges

**Build errors**:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Internet connection fails**:

- Verify server URL format (use `https://`, not `wss://`)
- Check server deployment status
- Ensure server is running Socket.IO

### Debug Mode

Enable debug logging:

```bash
# Windows
set DEBUG=socket.io* && npm run dev

# macOS/Linux
DEBUG=socket.io* npm run dev
```

## 📚 Tech Stack

- **[Electron](https://electronjs.org/)**: Desktop application framework
- **[React 18](https://reactjs.org/)**: UI library with hooks
- **[Vite](https://vitejs.dev/)**: Build tool and dev server
- **[electron-vite](https://electron-vite.org/)**: Electron + Vite integration
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Socket.IO](https://socket.io/)**: Real-time communication
- **[Bonjour](https://github.com/watson/bonjour)**: Service discovery
- **[Lucide React](https://lucide.dev/)**: Icon library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [electron-vite](https://electron-vite.org/) template
- Icons provided by [Lucide](https://lucide.dev/)
- Inspired by modern messaging applications

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [electron-vite documentation](https://electron-vite.org/guide/)
3. Open an issue in the repository

---

**Happy messaging! 🚀**
