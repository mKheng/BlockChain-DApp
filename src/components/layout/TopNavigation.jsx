import { Wallet, Loader2, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import NetworkBadge from '../shared/NetworkBadge'

export default function TopNavigation({
  walletState = 'disconnected',
  walletAddress = '',
  isOwner = false,
  onConnectWallet,
  onDisconnectWallet,
}) {
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : ''

  return (
    <header className="h-14 flex items-center justify-end px-6 shrink-0 border-b border-border bg-surface-800">
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
          <div className="flex items-center gap-2">
            <span className={clsx(
              'text-[11px] font-semibold px-2.5 py-1 rounded-lg',
              isOwner
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-brand-dim text-brand',
            )}>
              {isOwner ? 'Quản trị' : 'Cử tri'}
            </span>

            <button
              onClick={onDisconnectWallet}
              className="flex items-center gap-2 bg-surface-400 text-text-secondary
                         text-sm font-mono rounded-lg px-3 py-1.5 hover:bg-surface-400/80 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-green-chain" />
              {shortAddress}
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
