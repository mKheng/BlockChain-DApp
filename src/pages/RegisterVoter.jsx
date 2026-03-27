import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  UserCheck, Wallet, Lock, CheckCircle2, AlertTriangle, X, ShieldCheck, Shield, Clock,
} from 'lucide-react'
import clsx from 'clsx'
import ConfirmTransactionModal from '../components/modals/ConfirmTransactionModal'

function ErrorBanner({ error, onDismiss }) {
  if (!error) return null
  return (
    <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
      <p className="text-red-400 text-sm flex-1">{error}</p>
      <button onClick={onDismiss} className="cursor-pointer"><X className="w-4 h-4 text-red-400 hover:text-red-300" /></button>
    </div>
  )
}

export default function RegisterVoter() {
  const {
    walletState, walletAddress, electionId,
    currentElection, isRegistered, isOwner,
    onConnectWallet, registerVoter,
  } = useOutletContext()

  const [cccd, setCccd]               = useState('')
  const [cccdError, setCccdError]     = useState('')
  const [inviteCode, setInviteCode]   = useState('')
  const [inviteError, setInviteError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [txState, setTxState]     = useState('idle')
  const [txHash, setTxHash]       = useState('')
  const [txError, setTxError]     = useState('')

  const elStatus = currentElection?.status ?? 2
  const isActive = elStatus === 1

  const validate = () => {
    let valid = true
    if (!inviteCode.trim()) { setInviteError('Vui lòng nhập mã mời'); valid = false } else { setInviteError('') }
    if (!cccd.trim()) { setCccdError('Vui lòng nhập số CCCD'); valid = false }
    else if (!/^\d{12}$/.test(cccd.trim())) { setCccdError('CCCD phải gồm đúng 12 chữ số'); valid = false }
    else { setCccdError('') }
    return valid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setTxState('idle'); setTxHash(''); setTxError('')
    setModalOpen(true)
  }

  const handleConfirm = async () => {
    setTxState('signing')
    const result = await registerVoter(electionId, cccd.trim(), inviteCode.trim(), {
      onPending: () => setTxState('pending'),
    })
    if (result.success) {
      setTxHash(result.hash)
      setTxState('success')
      setCccd('')
    } else {
      setTxError(result.error)
      setTxState('idle')
      setModalOpen(false)
    }
  }

  // ── Chưa kết nối ví
  if (walletState !== 'connected') {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-dim flex items-center justify-center">
            <Wallet className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Chưa kết nối ví</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Kết nối MetaMask để đăng ký tư cách cử tri. Mỗi ví chỉ được liên kết với một CCCD.
          </p>
          <button onClick={onConnectWallet} className="btn-primary mt-1">Kết nối ví</button>
        </div>
      </div>
    )
  }

  // ── Owner không được đăng ký
  if (isOwner) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Người tổ chức không được bỏ phiếu</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Để đảm bảo tính công bằng, người tổ chức bầu cử không được phép đăng ký cử tri và tham gia bỏ phiếu.
          </p>
        </div>
      </div>
    )
  }

  // ── Đã đăng ký
  if (isRegistered) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-green-chain/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-chain" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Đã đăng ký thành công</h2>
          <p className="text-text-muted text-sm max-w-sm">
            Ví của bạn đã được xác minh và đủ điều kiện tham gia bỏ phiếu cho cuộc bầu cử này.
          </p>
          <div className="flex items-center gap-2 bg-green-chain/10 border border-green-chain/15 rounded-lg px-3 py-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-green-chain" />
            <span className="text-green-chain text-xs font-medium">Cử tri đã xác minh</span>
          </div>
          <p className="text-text-muted font-mono text-xs mt-1">{walletAddress}</p>
        </div>
      </div>
    )
  }

  // ── Chưa đến thời gian hoặc đã kết thúc
  if (!isActive) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-400 flex items-center justify-center">
            {elStatus === 0 ? <Clock className="w-6 h-6 text-text-muted" /> : <Lock className="w-6 h-6 text-text-muted" />}
          </div>
          <h2 className="text-text-primary font-bold text-lg">
            {elStatus === 0 ? 'Cuộc bầu cử chưa bắt đầu' : 'Cuộc bầu cử đã kết thúc'}
          </h2>
          <p className="text-text-muted text-sm max-w-sm">
            {elStatus === 0
              ? 'Đăng ký cử tri sẽ mở khi cuộc bầu cử bắt đầu. Vui lòng quay lại sau.'
              : 'Cuộc bầu cử đã kết thúc, không thể đăng ký cử tri.'}
          </p>
        </div>
      </div>
    )
  }

  // ── Form đăng ký
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[540px] mx-auto w-full">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-brand" />
          <span className="text-brand text-sm font-medium">Đăng ký cử tri</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Đăng ký Cử tri</h1>
        <p className="text-text-muted text-sm mt-1">
          Xác minh danh tính bằng CCCD để được quyền tham gia bỏ phiếu
          {currentElection ? ` — ${currentElection.name}` : ''}.
        </p>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-brand-dim border border-brand/15 rounded-xl px-4 py-3">
        <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        <div>
          <p className="text-brand font-semibold text-sm">Bảo mật & Riêng tư</p>
          <p className="text-text-muted text-xs mt-0.5 leading-relaxed">
            Số CCCD được mã hóa (keccak256) ngay tại trình duyệt trước khi gửi lên blockchain.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface-600 border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
          <UserCheck className="w-4 h-4 text-brand" />
          <div>
            <h2 className="text-text-primary font-semibold text-sm">Thông tin xác minh</h2>
            <p className="text-text-muted text-xs mt-0.5">Nhập đúng số CCCD 12 chữ số</p>
          </div>
        </div>

        <div className="px-5 py-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Địa chỉ ví (tự động)</label>
              <div className="w-full bg-surface-800 text-text-muted text-xs font-mono rounded-lg px-4 py-2.5 border border-border truncate">
                {walletAddress}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">
                Mã mời <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Nhập mã mời từ người tổ chức"
                className={clsx(
                  'w-full bg-surface-800 text-text-primary text-sm rounded-lg px-4 py-2.5 outline-none border transition-colors',
                  inviteError ? 'border-red-500/40 focus:border-red-500' : 'border-border focus:border-brand/40',
                )}
              />
              {inviteError
                ? <p className="text-red-400 text-xs">{inviteError}</p>
                : <p className="text-text-muted text-xs">Mã mời do người tổ chức bầu cử cung cấp</p>
              }
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">
                Số CCCD <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={cccd}
                onChange={(e) => setCccd(e.target.value.replace(/\D/g, ''))}
                placeholder="Nhập 12 chữ số CCCD"
                className={clsx(
                  'w-full bg-surface-800 text-text-primary text-sm rounded-lg px-4 py-2.5 outline-none border transition-colors font-mono tracking-widest',
                  cccdError ? 'border-red-500/40 focus:border-red-500' : 'border-border focus:border-brand/40',
                )}
              />
              {cccdError
                ? <p className="text-red-400 text-xs">{cccdError}</p>
                : <p className="text-text-muted text-xs">Số CCCD gồm 12 chữ số, không có khoảng trắng</p>
              }
            </div>

            <ErrorBanner error={txError} onDismiss={() => setTxError('')} />

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" className="btn-primary">
                <UserCheck className="w-4 h-4" />
                Đăng ký Cử tri
              </button>
              <p className="text-text-muted text-xs">Gas fee ~0.001 ETH (Ganache)</p>
            </div>
          </form>
        </div>
      </div>

      <ConfirmTransactionModal
        isOpen={modalOpen}
        onClose={() => { if (txState !== 'signing' && txState !== 'pending') setModalOpen(false) }}
        onConfirm={handleConfirm}
        proposal="Đăng ký tư cách cử tri"
        voteChoice="REGISTER"
        votingPower="CCCD Verified"
        gasFee="~0.001 ETH"
        gasUSD="(Ganache local)"
        txState={txState}
        txHash={txHash}
      />
    </div>
  )
}
