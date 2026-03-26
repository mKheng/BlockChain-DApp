import { useState, useRef, useEffect } from 'react'
import { Wallet, Loader2, ChevronDown, LogOut, Copy, Check, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import NetworkBadge from '../shared/NetworkBadge'

export default function TopNavigation({
  walletState = 'disconnected',
  walletAddress = '',
  isOwner = false,
  onConnectWallet,
  onDisconnectWallet,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : ''

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopy = (e) => {
    e.stopPropagation()
    if (walletAddress) navigator.clipboard?.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDisconnect = () => {
    setDropdownOpen(false)
    onDisconnectWallet()
  }

  return (
    <header className="h-14 flex items-center justify-end px-6 shrink-0 border-b border-border bg-surface-800 relative z-50">
      <div className="flex items-center gap-3">
        {walletState === 'connected' && <NetworkBadge />}

        {walletState === 'disconnected' && (
          <button onClick={onConnectWallet} className="btn-primary text-sm py-2">
            <Wallet className="w-4 h-4" />
            Kết nối ví
          </button>
        )}

        {walletState === 'connecting' && (
          <button disabled className="btn-ghost text-sm py-2 opacity-60 cursor-not-allowed">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang kết nối...
          </button>
        )}

        {walletState === 'connected' && (
          <div className="flex items-center gap-2" ref={dropdownRef}>
            <span className={clsx(
              'text-[11px] font-semibold px-2.5 py-1 rounded-lg hidden sm:inline-block',
              isOwner
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-brand-dim text-brand',
            )}>
              {isOwner ? 'Quản trị' : 'Cử tri'}
            </span>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={clsx(
                  "flex items-center gap-2 bg-surface-400 text-text-secondary text-sm font-mono rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                  dropdownOpen ? "ring-2 ring-brand/40 bg-surface-400/80" : "hover:bg-surface-400/80"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-green-chain animate-pulse" />
                {shortAddress}
                <ChevronDown className={clsx("w-3.5 h-3.5 text-text-muted transition-transform duration-200", dropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-600 border border-border rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Tài khoản</p>
                    <p className="text-xs text-text-primary font-mono truncate mt-1">{walletAddress}</p>
                  </div>

                  <button
                    onClick={() => { navigate('/settings'); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Cài đặt tài khoản
                  </button>

                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Copy className="w-4 h-4" />
                      Sao chép địa chỉ
                    </div>
                    {copied && <Check className="w-3.5 h-3.5 text-green-chain" />}
                  </button>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Ngắt kết nối
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
