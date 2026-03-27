import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Vote, Copy, CheckCircle2, Wallet, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '../components/shared/StatusBadge'

export default function TransactionHistory() {
  const {
    walletState, walletAddress, currentElection, candidates, userVotedFor,
    voteHistory, loadingData, onConnectWallet, refreshData,
  } = useOutletContext()

  const [copied, setCopied] = useState(false)

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const votedCandidate = candidates.find((c) => c.id === userVotedFor)
  const latestVote = voteHistory[voteHistory.length - 1] ?? null

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[900px] mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Vote className="w-4 h-4 text-brand" />
            <span className="text-brand text-sm font-medium">Hoạt động on-chain</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Phiếu của tôi</h1>
          <p className="text-text-muted text-sm mt-1">
            Lịch sử bỏ phiếu {currentElection?.name ? `— ${currentElection.name}` : ''} được ghi nhận bất biến trên blockchain.
          </p>
        </div>
        {walletState === 'connected' && (
          <button onClick={refreshData} disabled={loadingData} className="btn-ghost text-xs py-2 shrink-0">
            <RefreshCw className={clsx('w-3.5 h-3.5', loadingData && 'animate-spin')} />
            Làm mới
          </button>
        )}
      </div>

      {/* Not connected */}
      {walletState !== 'connected' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-dim flex items-center justify-center">
            <Wallet className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Chưa kết nối ví</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Kết nối MetaMask để xem lịch sử bỏ phiếu trên blockchain.
          </p>
          <button onClick={onConnectWallet} className="btn-primary mt-1">Kết nối ví</button>
        </div>
      )}

      {/* Connected but not voted */}
      {walletState === 'connected' && !userVotedFor && !loadingData && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-400 flex items-center justify-center">
            <Vote className="w-6 h-6 text-text-muted" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Chưa có giao dịch</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Bạn chưa bỏ phiếu trong cuộc bầu cử này. Về trang tổng quan để tham gia.
          </p>
        </div>
      )}

      {/* Connected + voted */}
      {walletState === 'connected' && userVotedFor && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tổng phiếu', value: '1', color: 'text-text-primary' },
              { label: 'Thành công', value: '1', color: 'text-green-chain' },
              { label: 'Đã bầu cho', value: votedCandidate?.name ?? '—', color: 'text-brand' },
            ].map((s) => (
              <div key={s.label} className="bg-surface-600 border border-border rounded-xl p-4">
                <p className="text-text-muted text-xs">{s.label}</p>
                <p className={clsx('font-bold text-xl tracking-tight mt-1 truncate', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Transaction table */}
          <div className="bg-surface-600 border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] px-5 py-3 border-b border-border">
              {['Ứng cử viên', 'Phiếu', 'Mã giao dịch', 'Block', 'Trạng thái'].map((h, i) => (
                <div key={h} className={clsx('text-text-muted text-xs font-medium', i === 4 && 'text-right')}>
                  {h}
                </div>
              ))}
            </div>

            <div className="px-5 py-4">
              <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] items-center">
                <div className="flex items-center gap-3">
                  {votedCandidate && (
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br text-white text-[10px] font-bold shrink-0',
                      votedCandidate.avatarColor,
                    )}>
                      {votedCandidate.avatar}
                    </div>
                  )}
                  <div>
                    <p className="text-text-primary text-sm font-semibold">
                      {votedCandidate?.name ?? `Candidate #${userVotedFor}`}
                    </p>
                    <p className="text-text-muted text-xs">{votedCandidate?.role ?? '—'}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-green-chain text-sm font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã bầu
                </span>

                <div className="flex items-center gap-1.5">
                  {latestVote?.txHash ? (
                    <>
                      <span className="text-text-muted font-mono text-xs">
                        {latestVote.txHash.slice(0, 10)}...{latestVote.txHash.slice(-6)}
                      </span>
                      <button
                        onClick={() => handleCopy(latestVote.txHash)}
                        className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Copy className={clsx('w-3 h-3', copied && 'text-green-chain')} />
                      </button>
                    </>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </div>

                <span className="text-text-muted text-xs font-mono">
                  {latestVote?.blockNumber ? `#${latestVote.blockNumber}` : '—'}
                </span>

                <div className="flex justify-end">
                  <StatusBadge status="success" />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-border">
              <p className="text-text-muted text-xs">
                Mỗi ví chỉ được bỏ phiếu 1 lần. Giao dịch được ghi bất biến trên blockchain.
              </p>
            </div>
          </div>

          {/* Wallet info */}
          <div className="flex items-center gap-3 bg-surface-600 border border-border rounded-xl px-4 py-3">
            <Wallet className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-text-muted text-xs">Địa chỉ cử tri:</span>
            <span className="text-text-secondary font-mono text-xs flex-1 truncate">{walletAddress}</span>
            <button
              onClick={() => handleCopy(walletAddress)}
              className="text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
            >
              <Copy className={clsx('w-3.5 h-3.5', copied && 'text-green-chain')} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
