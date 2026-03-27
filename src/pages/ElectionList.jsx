import { useOutletContext, Link } from 'react-router-dom'
import { Plus, Vote, Clock, CheckCircle2, RefreshCw, AlertTriangle, Wallet, Users } from 'lucide-react'
import clsx from 'clsx'
import { ELECTION_STATUS } from '../lib/useVoting'

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusTag({ status }) {
  const config = {
    pending: { label: 'Sắp diễn ra', bg: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
    active:  { label: 'Đang diễn ra', bg: 'bg-green-500/10 text-green-400', dot: 'bg-green-400 animate-pulse' },
    ended:   { label: 'Đã kết thúc', bg: 'bg-surface-400 text-text-muted', dot: 'bg-text-muted' },
  }
  const c = config[ELECTION_STATUS[status]] ?? config.ended
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', c.bg)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}

function TimeRemaining({ endTime }) {
  const now = Math.floor(Date.now() / 1000)
  const diff = endTime - now
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return (
    <span className="text-text-muted text-xs flex items-center gap-1">
      <Clock className="w-3 h-3" />
      Còn {h > 0 ? `${h}h ` : ''}{m}p
    </span>
  )
}

export default function ElectionList() {
  const {
    walletState, isOwner, elections, loadingElections,
    contractError, onConnectWallet, refreshElections,
  } = useOutletContext()

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1100px] mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Cuộc bầu cử
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Danh sách các cuộc bầu cử trên blockchain. Chọn để xem chi tiết và bỏ phiếu.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <Link to="/elections/new" className="btn-primary text-xs py-2">
              <Plus className="w-3.5 h-3.5" />
              Tạo cuộc bầu cử
            </Link>
          )}
          <button onClick={refreshElections} disabled={loadingElections} className="btn-ghost text-xs py-2">
            <RefreshCw className={clsx('w-3.5 h-3.5', loadingElections && 'animate-spin')} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Contract error */}
      {contractError && (
        <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-medium text-sm">Contract chưa được cấu hình</p>
            <p className="text-text-muted text-xs mt-0.5">{contractError}</p>
          </div>
        </div>
      )}

      {/* Not connected */}
      {walletState !== 'connected' && !contractError && (
        <div className="flex items-center gap-3 bg-brand-dim border border-brand/15 rounded-xl px-4 py-3">
          <Wallet className="w-4 h-4 text-brand shrink-0" />
          <p className="text-text-secondary text-sm flex-1">Kết nối ví MetaMask để tham gia bầu cử.</p>
          <button onClick={onConnectWallet} className="btn-primary text-xs py-2 px-4 shrink-0">
            Kết nối ví
          </button>
        </div>
      )}

      {/* Election grid */}
      {loadingElections ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-600 border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="h-4 w-32 bg-surface-400 rounded animate-pulse" />
              <div className="h-3 w-48 bg-surface-400 rounded animate-pulse" />
              <div className="h-3 w-24 bg-surface-400 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : elections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-400 flex items-center justify-center">
            <Vote className="w-6 h-6 text-text-muted" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Chưa có cuộc bầu cử nào</h2>
          <p className="text-text-muted text-sm max-w-sm">
            {isOwner
              ? 'Bạn là ban tổ chức — hãy tạo cuộc bầu cử đầu tiên.'
              : 'Ban tổ chức chưa tạo cuộc bầu cử. Vui lòng quay lại sau.'}
          </p>
          {isOwner && (
            <Link to="/elections/new" className="btn-primary mt-1">
              <Plus className="w-4 h-4" /> Tạo cuộc bầu cử
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {elections.map((el) => (
            <Link
              key={el.id}
              to={`/elections/${el.id}`}
              className="bg-surface-600 border border-border rounded-xl p-5 flex flex-col gap-3 hover:bg-surface-500 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <StatusTag status={el.status} />
                {el.status === 1 && <TimeRemaining endTime={el.endTime} />}
              </div>

              <div>
                <h3 className="text-text-primary font-semibold text-sm truncate">{el.name}</h3>
                {el.description && (
                  <p className="text-text-muted text-xs mt-1 line-clamp-2">{el.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-text-muted text-xs mt-auto pt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {el.candidateCount} ứng cử viên
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(el.startTime)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
