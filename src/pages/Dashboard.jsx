import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import {
  Users, Vote, Zap, TrendingUp, Copy, Check,
  X, AlertTriangle, RefreshCw, CheckCircle2, UserCheck,
  Shield, Plus, Clock,
} from 'lucide-react'
import clsx from 'clsx'
import StatCard from '../components/shared/StatCard'
import StatusBadge from '../components/shared/StatusBadge'
import VoteProgressBar from '../components/shared/VoteProgressBar'
import EmptyState from '../components/shared/EmptyState'
import ConfirmTransactionModal from '../components/modals/ConfirmTransactionModal'
import { CONTRACT_ADDRESS } from '../lib/contract'
import { ELECTION_STATUS } from '../lib/useVoting'

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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

// ── Setup banner ─────────────────────────────────────────────────────────────
function SetupBanner({ error }) {
  return (
    <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-amber-400 font-medium text-sm">Contract chưa được cấu hình</p>
        <p className="text-text-muted text-xs mt-0.5">
          {error || 'Điền CONTRACT_ADDRESS vào src/lib/contract.js sau khi deploy VotingMulti.sol trên Remix IDE.'}
        </p>
      </div>
    </div>
  )
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function CandidateSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface-600 border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-400 animate-pulse" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 w-36 bg-surface-400 rounded animate-pulse" />
            <div className="h-2.5 w-24 bg-surface-400 rounded animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-surface-400 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ── Candidate card ───────────────────────────────────────────────────────────
function CandidateCard({ candidate: c, isVotedByUser, onVote }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(CONTRACT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={clsx(
        'bg-surface-600 border rounded-xl p-4 hover:bg-surface-500 transition-colors duration-150',
        isVotedByUser ? 'border-emerald-500/20' : 'border-border',
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br',
            c.avatarColor,
          )}>
            {c.avatar}
          </div>
          {isVotedByUser && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-surface-600 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-text-primary text-sm font-semibold truncate">{c.name}</p>
            {isVotedByUser && (
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Phiếu của bạn
              </span>
            )}
          </div>
          <p className="text-text-muted text-xs mt-0.5">{c.role}</p>
        </div>

        <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
          <div className="flex items-baseline gap-1">
            <span className="text-text-primary text-lg font-bold tabular-nums">{c.votes}</span>
            <span className="text-text-muted text-xs">
              / {c.totalVotes} ({c.totalVotes > 0 ? Math.round((c.votes / c.totalVotes) * 100) : 0}%)
            </span>
          </div>
          <VoteProgressBar value={c.votes} total={c.totalVotes} className="w-full" />
        </div>

        <button
          onClick={handleCopy}
          className="hidden sm:flex items-center gap-1.5 text-text-muted text-[11px] font-mono bg-surface-400 hover:bg-surface-400/70 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
        >
          {c.blockchainId}
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>

        <div className="shrink-0">
          {c.status === 'closed' ? (
            <StatusBadge status="closed" />
          ) : isVotedByUser ? (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã bầu
            </span>
          ) : c.canVote ? (
            <button onClick={() => onVote(c)} className="btn-primary text-xs py-2 px-4">
              Bỏ phiếu
            </button>
          ) : (
            <button className="btn-ghost text-xs py-2 px-3">Xem</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const {
    walletState, walletAddress, isOwner, electionId,
    currentElection, candidates,
    isRegistered, userVotedFor, totalVotesCast,
    loadingData, contractError,
    onConnectWallet, castVote, refreshData,
  } = useOutletContext()

  const [modalOpen, setModalOpen]                = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [txState, setTxState]                    = useState('idle')
  const [txHash, setTxHash]                      = useState('')
  const [txError, setTxError]                    = useState('')

  const contractNotReady = !CONTRACT_ADDRESS || !!contractError
  const userVotedCandidate = candidates.find((c) => c.id === userVotedFor)
  const elStatus = currentElection?.status ?? 2
  const isActive = elStatus === 1
  const statusLabel = { 0: 'Sắp diễn ra', 1: 'Đang diễn ra', 2: 'Đã kết thúc' }

  const handleVote = (candidate) => {
    if (walletState !== 'connected') { onConnectWallet(); return }
    setSelectedCandidate(candidate)
    setTxState('idle'); setTxHash(''); setTxError('')
    setModalOpen(true)
  }

  const handleConfirmTx = async () => {
    setTxState('signing')
    const result = await castVote(electionId, selectedCandidate.id, {
      onPending: () => setTxState('pending'),
    })
    if (result.success) {
      setTxHash(result.hash)
      setTxState('success')
    } else {
      setTxError(result.error ?? 'Transaction thất bại')
      setTxState('idle')
      setModalOpen(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1100px] mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge
              status={isActive ? 'active' : elStatus === 0 ? 'warning' : 'closed'}
              label={statusLabel[elStatus]}
            />
            {isActive && currentElection && <TimeRemaining endTime={currentElection.endTime} />}
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {currentElection?.name ?? 'Cuộc bầu cử'}
          </h1>
          <p className="text-text-muted text-sm mt-1 max-w-lg">
            {currentElection?.description || 'Bỏ phiếu phi tập trung — mọi giao dịch minh bạch và bất biến trên blockchain.'}
          </p>
          {currentElection && (
            <p className="text-text-muted text-xs mt-2">
              {formatDate(currentElection.startTime)} — {formatDate(currentElection.endTime)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <Link to={`/elections/${electionId}/manage`} className="btn-ghost text-xs py-2">
              <Shield className="w-3.5 h-3.5" />
              Quản trị
            </Link>
          )}
          <button onClick={refreshData} disabled={loadingData} className="btn-ghost text-xs py-2">
            <RefreshCw className={clsx('w-3.5 h-3.5', loadingData && 'animate-spin')} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Banners */}
      {contractNotReady && <SetupBanner error={contractError} />}

      {walletState === 'connected' && !isRegistered && !contractNotReady && isActive && (
        <div className="flex items-center gap-3 bg-brand-dim border border-brand/15 rounded-xl px-4 py-3">
          <UserCheck className="w-4 h-4 text-brand shrink-0" />
          <p className="text-text-secondary text-sm flex-1">
            Bạn chưa đăng ký cử tri cho cuộc bầu cử này. Đăng ký bằng CCCD để bỏ phiếu.
          </p>
          <Link to={`/elections/${electionId}/register`} className="btn-primary text-xs py-2 px-4 shrink-0">
            Đăng ký ngay
          </Link>
        </div>
      )}

      {txError && (
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm flex-1">{txError}</p>
          <button onClick={() => setTxError('')} className="cursor-pointer">
            <X className="w-4 h-4 text-red-400 hover:text-red-300" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Tổng phiếu bầu"
          value={totalVotesCast.toLocaleString()}
          subtitle={`Trên ${candidates.length} ứng cử viên`}
          icon={TrendingUp}
        />
        <StatCard
          title="Ứng cử viên"
          value={candidates.length.toString()}
          subtitle={statusLabel[elStatus]}
          icon={Users}
          subtitleColor={isActive ? 'text-emerald-400' : undefined}
        />
        <StatCard
          title="Trạng thái"
          value={statusLabel[elStatus]}
          subtitle={currentElection ? formatDate(currentElection.endTime) : '—'}
          icon={Vote}
        />
        <StatCard
          title={walletState === 'connected' ? 'Tư cách' : 'Quyền bầu cử'}
          value={
            walletState !== 'connected' ? '—'
            : userVotedFor ? 'Đã bầu'
            : isRegistered ? 'Sẵn sàng'
            : 'Chưa xác minh'
          }
          subtitle={
            userVotedCandidate ? `Đã bầu cho ${userVotedCandidate.name}`
            : walletState === 'connected' && isRegistered ? 'Đủ điều kiện bỏ phiếu'
            : walletState === 'connected' ? 'Đăng ký bằng CCCD'
            : 'Kết nối ví để bỏ phiếu'
          }
          icon={Zap}
          subtitleColor={userVotedFor ? 'text-emerald-400' : undefined}
        />
      </div>

      {/* Candidate list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary text-sm font-semibold">Ứng cử viên</h2>
          <span className="text-text-muted text-xs">{candidates.length} ứng cử viên</span>
        </div>

        <div className="flex flex-col gap-2">
          {loadingData ? (
            <CandidateSkeleton />
          ) : candidates.length === 0 ? (
            contractNotReady ? (
              <EmptyState icon={AlertTriangle} title="Contract chưa sẵn sàng" description="Deploy contract và tạo cuộc bầu cử để bắt đầu." />
            ) : (
              <EmptyState
                icon={Users}
                title="Chưa có ứng cử viên nào"
                description="Ban tổ chức cần thêm ứng cử viên qua bảng quản trị."
                action={isOwner && (
                  <Link to={`/elections/${electionId}/manage`} className="btn-primary text-xs py-2 px-4 mt-1">
                    <Plus className="w-3.5 h-3.5" /> Thêm ứng cử viên
                  </Link>
                )}
              />
            )
          ) : (
            candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                isVotedByUser={c.id === userVotedFor}
                onVote={handleVote}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <ConfirmTransactionModal
        isOpen={modalOpen}
        onClose={() => {
          if (txState !== 'signing' && txState !== 'pending') setModalOpen(false)
        }}
        onConfirm={handleConfirmTx}
        proposal={selectedCandidate ? `#${selectedCandidate.id}: ${selectedCandidate.name}` : ''}
        voteChoice={selectedCandidate?.name ?? 'YES'}
        votingPower="1 Phiếu"
        gasFee="~0.001 ETH"
        gasUSD="(Ganache cục bộ)"
        txState={txState}
        txHash={txHash}
      />
    </div>
  )
}
