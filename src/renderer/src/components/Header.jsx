import React from 'react'
import { Wifi, Globe, Settings, MessageCircle } from 'lucide-react'

const Header = ({ currentMode, onModeSwitch, onSettingsClick }) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <MessageCircle className="w-8 h-8" />
        <h1 className="text-2xl font-bold">Desktop Messenger</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Mode Toggle */}
        <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => onModeSwitch('local')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              currentMode === 'local'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Local</span>
          </button>
          <button
            onClick={() => onModeSwitch('internet')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              currentMode === 'internet'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">Internet</span>
          </button>
        </div>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Header
