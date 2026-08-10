// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadSavedTheme } from '../data/themes'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('rf-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('rf-theme', theme)
    // Re-apply accent colour AFTER dark/light switch so custom theme isn't wiped
    loadSavedTheme()
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
