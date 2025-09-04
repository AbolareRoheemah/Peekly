"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAccount, useBalance, useSwitchChain } from "wagmi"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useSetActiveWallet } from "@privy-io/wagmi"

function shorten(address: string, chars = 4) {
  if (!address) return ""
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

const MonoLabel = ({ label }: { label: string }) => (
  <span className="rounded bg-slate-800/80 px-2 py-1 font-mono text-xs text-white">{label}</span>
)

function WalletDropdown({
  open,
  onClose,
  address,
  chain,
  chains,
  switchChain,
  switchNetworkError,
  wallets,
  setActiveWallet,
  connectWallet,
  linkWallet,
  privyReady,
  privyAuthenticated,
  logoutPrivy,
}: any) {
  // Get balance for the current address and chain
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useBalance({
    address: address,
    chainId: chain?.id,
    // enabled: !!address && !!chain,
    // watch: true,
  })

  // Click outside to close
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-transparent">
      <div
        ref={dropdownRef}
        className="mt-20 mr-8 bg-gray-900 border border-purple-900/40 rounded-xl shadow-xl p-5 min-w-[320px] max-w-[95vw]"
        style={{ position: "absolute", right: 0, top: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-lg text-purple-300">Wallet</div>
          <button
            className="text-gray-400 hover:text-white text-xl px-2"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Address</div>
          <div className="flex items-center gap-2">
            <MonoLabel label={shorten(address)} />
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Network</div>
          <div className="flex items-center gap-2 flex-wrap">
            {chain && (
              <span className="text-sm text-purple-300 font-semibold">{chain.name}</span>
            )}
            {chains &&
              chains.map((x: any) => (
                <button
                  key={x.id}
                  disabled={x.id === chain?.id}
                  onClick={() => {
                    switchChain?.({ chainId: x.id })
                    onClose()
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    x.id === chain?.id
                      ? "bg-purple-700 text-white"
                      : "bg-gray-800 text-purple-200 hover:bg-purple-800"
                  }`}
                  style={{ marginRight: 4, marginBottom: 4 }}
                >
                  {x.name}
                </button>
              ))}
          </div>
          {switchNetworkError && (
            <div className="text-red-400 text-xs mt-2">
              Network switch error: {JSON.stringify(switchNetworkError, null, 2)}
            </div>
          )}
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Balance</div>
          <div className="flex items-center gap-2">
            {balanceLoading ? (
              <span className="text-gray-400 text-xs">Loading...</span>
            ) : balanceError ? (
              <span className="text-red-400 text-xs">Error</span>
            ) : balance ? (
              <span className="text-white font-mono text-sm">
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Switch Wallet</div>
          {wallets && wallets.length > 1 ? (
            <div className="flex flex-col gap-2">
              {wallets.map((wallet: any) => (
                <button
                  key={wallet.address}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    wallet.address === address
                      ? "bg-purple-700 text-white"
                      : "bg-gray-800 text-purple-200 hover:bg-purple-800"
                  }`}
                  onClick={() => setActiveWallet(wallet)}
                  disabled={wallet.address === address}
                >
                  <MonoLabel label={shorten(wallet.address)} />
                  {wallet.address === address && <span className="text-green-400">Active</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-xs">No other wallets connected.</div>
          )}
          <div className="flex gap-2 mt-3">
            <button
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              onClick={connectWallet}
            >
              Connect Other Wallet
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              onClick={linkWallet}
            >
              Link Other Wallet
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button
            className="bg-gray-700 hover:bg-gray-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors text-red-400"
            onClick={() => {
              if (logoutPrivy) logoutPrivy()
              onClose()
            }}
          >
            Disconnect Privy (Logout)
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const router = useRouter()

  // Privy hooks
  const { 
    ready: privyReady, 
    authenticated: privyAuthenticated, 
    connectWallet, 
    linkWallet, 
    logout 
  } = usePrivy()
  const { wallets = [] } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount()
  const { chains, error: switchNetworkError, switchChain } = useSwitchChain()

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Close dropdown on escape
  useEffect(() => {
    if (!dropdownOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dropdownOpen])

  // Handler for logging out privy
  const handleLogoutPrivy = async () => {
    if (logout) {
      await logout()
      router.push("/sign-in")
    }
  }

  return (
    <header className="border-b border-purple-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/peekly-logo.png" alt="Peekly" width={32} height={32} className="invert" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Peekly
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={() => router.push("/create")}
          >
            Create Post
          </button>
          {isConnected && address && (
            <button
              className="flex items-center gap-2 bg-gray-800 hover:bg-purple-800 px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-purple-900/40"
              onClick={() => setDropdownOpen((v) => !v)}
              title="Wallet"
            >
              <MonoLabel label={shorten(address)} />
              <svg width="16" height="16" fill="none" className="ml-1" viewBox="0 0 20 20">
                <path d="M7 7l3 3 3-3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <WalletDropdown
        open={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        address={address}
        chain={chain}
        chains={chains}
        switchChain={switchChain}
        switchNetworkError={switchNetworkError}
        wallets={wallets}
        setActiveWallet={setActiveWallet}
        connectWallet={connectWallet}
        linkWallet={linkWallet}
        privyReady={privyReady}
        privyAuthenticated={privyAuthenticated}
        logoutPrivy={handleLogoutPrivy}
      />
    </header>
  )
}
