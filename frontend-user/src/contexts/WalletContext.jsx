import React, { createContext, useContext, useState, useCallback } from 'react'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState(0)
  const [connected, setConnected] = useState(false)

  const connectWallet = useCallback(async (provider) => {
    // placeholder: integrate with web3 provider
    // Example: const accounts = await provider.request({ method: 'eth_requestAccounts' })
    // setAddress(accounts[0])
    setConnected(true)
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setBalance(0)
    setConnected(false)
  }, [])

  const value = {
    address,
    balance,
    connected,
    connectWallet,
    disconnectWallet,
    setAddress,
    setBalance,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
