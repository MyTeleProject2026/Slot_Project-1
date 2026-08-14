import React, { createContext, useContext, useState, useCallback } from 'react'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [isRunning, setIsRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)

  const startGame = useCallback(() => {
    setIsRunning(true)
    setScore(0)
    setLevel(1)
  }, [])

  const endGame = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetGame = useCallback(() => {
    setIsRunning(false)
    setScore(0)
    setLevel(1)
  }, [])

  const incrementScore = useCallback((amount = 1) => {
    setScore((s) => s + amount)
  }, [])

  const value = {
    isRunning,
    score,
    level,
    startGame,
    endGame,
    resetGame,
    incrementScore,
    setLevel,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
