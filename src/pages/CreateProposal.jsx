import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Shield, UserPlus, Power, PowerOff, Lock, AlertCircle, CheckCircle2,
  AlertTriangle, X, Loader2, Users, UserCheck,
} from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '../components/shared/StatusBadge'
import ConfirmTransactionModal from '../components/modals/ConfirmTransactionModal'

// ── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-surface-600 border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <Icon className="w-4 h-4 text-brand" />
        <div>
          <h2 className="text-text-primary font-semibold text-sm">{title}</h2>
          {subtitle && <p className="text-text-muted text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

// ── Inline error/success banner ─────────────────────────────────────────────
function TxBanner({ error, onDismiss }) {
  if (!error) return null
  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
      <p className="text-red-400 text-sm flex-1">{error}</p>
      <button onClick={onDismiss}><X className="w-4 h-4 text-red-400 hover:text-red-300" /></button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const {
    walletState, isOwner,
    candidates, votingOpen, registrationOpen,
    onConnectWallet,
    registerCandidate, setVotingStatus, setRegistrationStatus,
  } = useOutletContext()

  // ── Register candidate state ────────────────────────────────────────────
  const [form, setForm]       = useState({ name: '', role: '' })
  const [formError, setFormError] = useState({})
  const [regTxState, setRegTxState]   = useState('idle')
  const [regTxHash, setRegTxHash]     = useState('')
  const [regTxError, setRegTxError]   = useState('')
  const [regModalOpen, setRegModalOpen] = useState(false)

  // ── Voting status state ─────────────────────────────────────────────────
  const [statusTxState, setStatusTxState]     = useState('idle')
  const [statusTxHash, setStatusTxHash]       = useState('')
  const [statusTxError, setStatusTxError]     = useState('')
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [pendingStatus, setPendingStatus]     = useState(null) // true | false

  // ── Registration status state ───────────────────────────────────────────
  const [regStatusTxState, setRegStatusTxState]     = useState('idle')
  const [regStatusTxHash, setRegStatusTxHash]       = useState('')
  const [regStatusTxError, setRegStatusTxError]     = useState('')
  const [regStatusModalOpen, setRegStatusModalOpen] = useState(false)
  const [pendingRegStatus, setPendingRegStatus]     = useState(null) // true | false

  // ── Validate form ───────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name = 'Vui lòng nhập tên ứng cử viên'
    if (!form.role.trim())  e.role = 'Vui lòng nhập chức vụ / mô tả'
    setFormError(e)
    return Object.keys(e).length === 0
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setRegTxState('idle')
    setRegTxHash('')
    setRegTxError('')
    setRegModalOpen(true)
  }

  const handleConfirmRegister = async () => {
    setRegTxState('signing')
    const result = await registerCandidate(form.name.trim(), form.role.trim(), {
      onPending: () => setRegTxState('pending'),
    })
    if (result.success) {
      setRegTxHash(result.hash)
      setRegTxState('success')
      setForm({ name: '', role: '' })
    } else {
      setRegTxError(result.error)
      setRegTxState('idle')
      setRegModalOpen(false)
    }
  }

  const handleToggleVoting = (open) => {
    setPendingStatus(open)
    setStatusTxState('idle')
    setStatusTxHash('')
    setStatusTxError('')
    setStatusModalOpen(true)
  }

  const handleConfirmStatus = async () => {
    setStatusTxState('signing')
    const result = await setVotingStatus(pendingStatus, {
      onPending: () => setStatusTxState('pending'),
    })
    if (result.success) {
      setStatusTxHash(result.hash)
      setStatusTxState('success')
    } else {
      setStatusTxError(result.error)
      setStatusTxState('idle')
      setStatusModalOpen(false)
    }
  }

  const handleToggleRegistration = (open) => {
    setPendingRegStatus(open)
    setRegStatusTxState('idle')
    setRegStatusTxHash('')
    setRegStatusTxError('')
    setRegStatusModalOpen(true)
  }

  const handleConfirmRegStatus = async () => {
    setRegStatusTxState('signing')
    const result = await setRegistrationStatus(pendingRegStatus, {
      onPending: () => setRegStatusTxState('pending'),
    })
    if (result.success) {
      setRegStatusTxHash(result.hash)
      setRegStatusTxState('success')
    } else {
      setRegStatusTxError(result.error)
      setRegStatusTxState('idle')
      setRegStatusModalOpen(false)
    }
  }

  const fieldCls = (key) => clsx(
    'w-full bg-surface-800 text-text-primary text-sm rounded-lg px-4 py-2.5 outline-none border transition-colors',
    formError[key] ? 'border-red-500/40 focus:border-red-500' : 'border-border focus:border-brand/40',
  )

  // ── Guards ──────────────────────────────────────────────────────────────
  if (walletState !== 'connected') {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-dim flex items-center justify-center">
            <Shield className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Bảng quản trị</h2>
          <p className="text-text-secondary text-sm max-w-sm">
            Kết nối ví MetaMask với tài khoản chủ sở hữu để truy cập bảng quản trị.
          </p>
          <button onClick={onConnectWallet} className="btn-primary mt-2">
            Kết nối ví
          </button>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Truy cập bị từ chối</h2>
          <p className="text-text-secondary text-sm max-w-sm">
            Chỉ tài khoản chủ sở hữu hợp đồng thông minh mới có thể truy cập bảng quản trị.
            Hãy chuyển sang tài khoản đã triển khai hợp đồng.
          </p>
          <div className="flex items-center gap-2 bg-surface-600 border border-border rounded-lg px-4 py-2 mt-1">
            <AlertCircle className="w-4 h-4 text-text-muted" />
            <span className="text-text-muted text-xs">Tài khoản hiện tại không phải chủ sở hữu</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Owner view ──────────────────────────────────────────────────────────
  return (
    <div className="p-8 flex flex-col gap-8 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-brand" />
          <span className="text-brand text-sm font-medium">Quản trị viên</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Bảng quản trị</h1>
        <p className="text-text-muted text-sm mt-1">
          Quản lý cuộc bầu cử: mở/đóng bỏ phiếu và đăng ký ứng cử viên trực tiếp trên blockchain.
        </p>
      </div>

      {/* ── Section 0: Registration Status ── */}
      <Section icon={UserCheck} title="Đăng ký cử tri" subtitle="Mở hoặc đóng giai đoạn đăng ký CCCD">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-text-primary text-sm font-medium">Đăng ký hiện tại</p>
            <div className={clsx(
              'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit',
              registrationOpen
                ? 'bg-brand/10 text-brand'
                : 'bg-surface-400 text-text-muted border border-border-zinc',
            )}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', registrationOpen ? 'bg-brand animate-pulse' : 'bg-text-muted')} />
              {registrationOpen ? 'Đang mở — Cử tri có thể đăng ký' : 'Đã đóng — Không nhận đăng ký mới'}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleToggleRegistration(false)}
              disabled={!registrationOpen}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
                !registrationOpen
                  ? 'opacity-40 cursor-not-allowed border-border text-text-muted'
                  : 'border-red-500/40 text-red-400 hover:bg-red-500/10',
              )}
            >
              <PowerOff className="w-4 h-4" /> Đóng Đăng ký
            </button>
            <button
              onClick={() => handleToggleRegistration(true)}
              disabled={registrationOpen}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
                registrationOpen
                  ? 'opacity-40 cursor-not-allowed border-border text-text-muted'
                  : 'border-brand/40 text-brand hover:bg-brand/10',
              )}
            >
              <Power className="w-4 h-4" /> Mở Đăng ký
            </button>
          </div>
        </div>
        {regStatusTxError && <TxBanner error={regStatusTxError} onDismiss={() => setRegStatusTxError('')} />}
      </Section>

      {/* ── Section 1: Voting Status ── */}
      <Section icon={Power} title="Trạng thái bầu cử" subtitle="Mở hoặc đóng phiên bỏ phiếu">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-text-primary text-sm font-medium">Bỏ phiếu hiện tại</p>
            <StatusBadge
              status={votingOpen ? 'active' : 'closed'}
              label={votingOpen ? 'Đang mở — Cử tri có thể bỏ phiếu' : 'Đã đóng — Không nhận phiếu mới'}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleToggleVoting(false)}
              disabled={!votingOpen}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
                !votingOpen
                  ? 'opacity-40 cursor-not-allowed border-border text-text-muted'
                  : 'border-red-500/40 text-red-400 hover:bg-red-500/10',
              )}
            >
              <PowerOff className="w-4 h-4" /> Đóng bỏ phiếu
            </button>
            <button
              onClick={() => handleToggleVoting(true)}
              disabled={votingOpen}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
                votingOpen
                  ? 'opacity-40 cursor-not-allowed border-border text-text-muted'
                  : 'border-green-chain/40 text-green-chain hover:bg-green-chain/10',
              )}
            >
              <Power className="w-4 h-4" /> Mở bỏ phiếu
            </button>
          </div>
        </div>
        {statusTxError && <TxBanner error={statusTxError} onDismiss={() => setStatusTxError('')} />}
      </Section>

      {/* ── Section 2: Register Candidate ── */}
      <Section
        icon={UserPlus}
        title="Đăng ký ứng cử viên"
        subtitle="Thêm ứng cử viên vào cuộc bầu cử (ghi trực tiếp lên blockchain)"
      >
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-text-secondary text-sm font-medium">
              Tên ứng cử viên <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="vd: Nguyễn Văn A"
              className={fieldCls('name')}
            />
            {formError.name && <p className="text-red-400 text-xs">{formError.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text-secondary text-sm font-medium">
              Chức vụ / Mô tả <span className="text-red-400">*</span>
            </label>
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="vd: Chủ tịch Hội sinh viên"
              className={fieldCls('role')}
            />
            {formError.role && <p className="text-red-400 text-xs">{formError.role}</p>}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="btn-primary">
              <UserPlus className="w-4 h-4" />
              Đăng ký lên Blockchain
            </button>
            <p className="text-text-muted text-xs">Gas fee ~0.001 ETH (Ganache)</p>
          </div>
        </form>
        {regTxError && <TxBanner error={regTxError} onDismiss={() => setRegTxError('')} />}
      </Section>

      {/* ── Section 3: Current Candidates ── */}
      <Section
        icon={Users}
        title={`Danh sách ứng cử viên (${candidates.length})`}
        subtitle="Dữ liệu đọc từ blockchain"
      >
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2 text-text-muted">
            <Users className="w-8 h-8 opacity-30" />
            <p className="text-sm">Chưa có ứng cử viên nào được đăng ký</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {candidates.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-4 p-3 bg-surface-500 border border-border rounded-lg"
              >
                <div className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br text-white text-xs font-bold shrink-0',
                  c.avatarColor,
                )}>
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-text-muted text-xs truncate">{c.role}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-text-muted text-xs font-mono">ID #{c.id}</span>
                  <span className="text-white text-sm font-bold">{c.votes.toLocaleString()} phiếu</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Modal: Register Candidate ── */}
      <ConfirmTransactionModal
        isOpen={regModalOpen}
        onClose={() => { if (regTxState !== 'signing' && regTxState !== 'pending') setRegModalOpen(false) }}
        onConfirm={handleConfirmRegister}
        proposal={`Đăng ký: ${form.name}`}
        voteChoice="REGISTER"
        votingPower="Owner"
        gasFee="~0.001 ETH"
        gasUSD="(Ganache local)"
        txState={regTxState}
        txHash={regTxHash}
      />

      {/* ── Modal: Voting Status ── */}
      <ConfirmTransactionModal
        isOpen={statusModalOpen}
        onClose={() => { if (statusTxState !== 'signing' && statusTxState !== 'pending') setStatusModalOpen(false) }}
        onConfirm={handleConfirmStatus}
        proposal={pendingStatus ? 'Mở phiên bỏ phiếu' : 'Đóng phiên bỏ phiếu'}
        voteChoice={pendingStatus ? 'OPEN' : 'CLOSE'}
        votingPower="Owner"
        gasFee="~0.001 ETH"
        gasUSD="(Ganache local)"
        txState={statusTxState}
        txHash={statusTxHash}
      />

      {/* ── Modal: Registration Status ── */}
      <ConfirmTransactionModal
        isOpen={regStatusModalOpen}
        onClose={() => { if (regStatusTxState !== 'signing' && regStatusTxState !== 'pending') setRegStatusModalOpen(false) }}
        onConfirm={handleConfirmRegStatus}
        proposal={pendingRegStatus ? 'Mở đăng ký cử tri' : 'Đóng đăng ký cử tri'}
        voteChoice={pendingRegStatus ? 'OPEN' : 'CLOSE'}
        votingPower="Owner"
        gasFee="~0.001 ETH"
        gasUSD="(Ganache local)"
        txState={regStatusTxState}
        txHash={regStatusTxHash}
      />
    </div>
  )
}
