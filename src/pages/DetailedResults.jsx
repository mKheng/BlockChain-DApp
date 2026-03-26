import { useOutletContext } from 'react-router-dom'
import { BarChart2, Users, Trophy, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '../components/shared/StatusBadge'
import { CONTRACT_ADDRESS } from '../lib/contract'

function OptionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="h-3 w-32 bg-surface-400 rounded animate-pulse" />
            <div className="h-3 w-16 bg-surface-400 rounded animate-pulse" />
          </div>
          <div className="h-1.5 bg-surface-400 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-surface-400 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DetailedResults() {
  const {
    candidates, votingOpen, totalVotesCast,
    loadingData, contractError, refreshData,
  } = useOutletContext()

  const winner = !votingOpen && candidates.length > 0
    ? [...candidates].sort((a, b) => b.votes - a.votes)[0]
    : null

  const BAR_COLORS = [
    'bg-brand', 'bg-purple-500', 'bg-amber-chain',
    'bg-green-chain', 'bg-pink-500', 'bg-cyan-500',
  ]

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[860px] mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-brand" />
            <span className="text-brand text-sm font-medium">Phân tích bầu cử</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Kết quả chi tiết</h1>
          <p className="text-text-muted text-sm mt-1">
            Kết quả cuộc bầu cử ghi nhận trực tiếp từ blockchain.
          </p>
        </div>
        <button onClick={refreshData} disabled={loadingData} className="btn-ghost text-xs py-2 shrink-0">
          <RefreshCw className={clsx('w-3.5 h-3.5', loadingData && 'animate-spin')} />
          Làm mới
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng phiếu', value: loadingData ? '...' : totalVotesCast.toLocaleString(), sub: 'Tổng số phiếu đã bỏ' },
          { label: 'Ứng cử viên', value: loadingData ? '...' : candidates.length.toString(), sub: 'Đã đăng ký' },
          { label: 'Trạng thái', value: votingOpen ? 'Đang mở' : 'Đã đóng', sub: votingOpen ? 'Đang nhận phiếu' : 'Đã kết thúc', valueColor: votingOpen ? 'text-green-chain' : undefined },
        ].map((s) => (
          <div key={s.label} className="bg-surface-600 border border-border rounded-xl p-4">
            <p className="text-text-muted text-xs">{s.label}</p>
            <p className={clsx('font-bold text-xl tracking-tight mt-1', s.valueColor ?? 'text-text-primary')}>{s.value}</p>
            <p className="text-text-muted text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Winner */}
      {winner && winner.votes > 0 && (
        <div className="flex items-center gap-4 bg-amber-chain/5 border border-amber-chain/15 rounded-xl px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-amber-chain/15 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-amber-light" />
          </div>
          <div>
            <p className="text-amber-light text-xs font-semibold uppercase tracking-wider mb-0.5">Người chiến thắng</p>
            <p className="text-text-primary font-bold">{winner.name}</p>
            <p className="text-text-muted text-xs">{winner.role} — {winner.votes.toLocaleString()} phiếu ({totalVotesCast > 0 ? Math.round((winner.votes / totalVotesCast) * 100) : 0}%)</p>
          </div>
        </div>
      )}

      {/* Results card */}
      <div className="bg-surface-600 border border-border rounded-xl overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={votingOpen ? 'active' : 'closed'} />
            </div>
            <h3 className="text-text-primary font-semibold text-sm mt-1">Hệ thống Bỏ phiếu Điện tử</h3>
            <div className="flex items-center gap-3 text-text-muted text-xs">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {totalVotesCast.toLocaleString()} phiếu
              </span>
              {CONTRACT_ADDRESS && (
                <span className="font-mono">
                  {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="px-5 py-5">
          {loadingData ? (
            <OptionSkeleton />
          ) : contractError ? (
            <div className="text-center py-10 text-text-muted text-sm">{contractError}</div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm">
              Chưa có ứng cử viên nào được đăng ký
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...candidates]
                .sort((a, b) => b.votes - a.votes)
                .map((c, i) => {
                  const pct = totalVotesCast > 0 ? Math.round((c.votes / totalVotesCast) * 100) : 0
                  const isWinner = !votingOpen && winner?.id === c.id && c.votes > 0
                  return (
                    <div key={c.id} className={clsx(
                      'flex flex-col gap-1.5 p-3 rounded-lg',
                      isWinner && 'bg-amber-chain/5 border border-amber-chain/10',
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={clsx(
                            'w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br text-white text-[10px] font-bold shrink-0',
                            c.avatarColor,
                          )}>
                            {c.avatar}
                          </div>
                          <div>
                            <span className="text-text-primary text-sm font-semibold">{c.name}</span>
                            <span className="text-text-muted text-xs ml-2">{c.role}</span>
                          </div>
                          {isWinner && <Trophy className="w-3.5 h-3.5 text-amber-light ml-1" />}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-text-primary text-sm font-bold">{c.votes.toLocaleString()}</span>
                          <span className="text-text-muted text-xs w-9 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden ml-9">
                        <div
                          className={clsx('h-full rounded-full transition-all duration-500', BAR_COLORS[i % BAR_COLORS.length])}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loadingData && candidates.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <span className="text-text-muted text-xs">{candidates.length} ứng cử viên</span>
            {CONTRACT_ADDRESS && (
              <span className="text-text-muted text-xs font-mono">
                {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
