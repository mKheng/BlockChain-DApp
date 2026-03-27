import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Plus, Shield, Lock, Wallet, Calendar, AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'
import ConfirmTransactionModal from '../components/modals/ConfirmTransactionModal'

export default function CreateElection() {
  const {
    walletState, isOwner,
    onConnectWallet, createElection,
  } = useOutletContext()

  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', description: '', startTime: '', endTime: '' })
  const [formError, setFormError] = useState({})
  const [txState, setTxState] = useState('idle')
  const [txHash, setTxHash] = useState('')
  const [txError, setTxError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên cuộc bầu cử'
    if (!form.startTime) e.startTime = 'Vui lòng chọn thời gian bắt đầu'
    if (!form.endTime) e.endTime = 'Vui lòng chọn thời gian kết thúc'
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime)) {
      e.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }
    setFormError(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setTxState('idle'); setTxHash(''); setTxError('')
    setModalOpen(true)
  }

  const handleConfirm = async () => {
    setTxState('signing')
    const startTs = Math.floor(new Date(form.startTime).getTime() / 1000)
    const endTs = Math.floor(new Date(form.endTime).getTime() / 1000)
    const result = await createElection(form.name.trim(), form.description.trim(), startTs, endTs, {
      onPending: () => setTxState('pending'),
    })
    if (result.success) {
      setTxHash(result.hash)
      setTxState('success')
    } else {
      setTxError(result.error)
      setTxState('idle')
      setModalOpen(false)
    }
  }

  const handleModalClose = () => {
    if (txState === 'signing' || txState === 'pending') return
    setModalOpen(false)
    if (txState === 'success') navigate('/')
  }

  const fieldCls = (key) => clsx(
    'w-full bg-surface-800 text-text-primary text-sm rounded-lg px-4 py-2.5 outline-none border transition-colors',
    formError[key] ? 'border-red-500/40 focus:border-red-500' : 'border-border focus:border-brand/40',
  )

  // Guards
  if (walletState !== 'connected') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-dim flex items-center justify-center">
            <Wallet className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Chưa kết nối ví</h2>
          <p className="text-text-muted text-sm max-w-sm">Kết nối MetaMask để tạo cuộc bầu cử.</p>
          <button onClick={onConnectWallet} className="btn-primary mt-2">Kết nối ví</button>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-text-primary font-bold text-lg">Truy cập bị từ chối</h2>
          <p className="text-text-muted text-sm max-w-sm">Chỉ chủ sở hữu hợp đồng mới có thể tạo cuộc bầu cử.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col gap-8 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-brand" />
          <span className="text-brand text-sm font-medium">Quản trị viên</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Tạo cuộc bầu cử mới</h1>
        <p className="text-text-muted text-sm mt-1">
          Tạo cuộc bầu cử với thời gian tự động mở/đóng. Sau khi tạo, thêm ứng cử viên trong bảng quản trị.
        </p>
      </div>

      {/* Form */}
      <div className="bg-surface-600 border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
          <Calendar className="w-4 h-4 text-brand" />
          <div>
            <h2 className="text-text-primary font-semibold text-sm">Thông tin cuộc bầu cử</h2>
            <p className="text-text-muted text-xs mt-0.5">Dữ liệu được ghi trực tiếp lên blockchain</p>
          </div>
        </div>

        <div className="px-5 py-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">
                Tên cuộc bầu cử <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="vd: Bầu cử Hội sinh viên 2026"
                className={fieldCls('name')}
              />
              {formError.name && <p className="text-red-400 text-xs">{formError.name}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-text-secondary text-sm font-medium">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về cuộc bầu cử (tùy chọn)"
                rows={3}
                className={clsx(fieldCls('description'), 'resize-none')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">
                  Bắt đầu <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className={fieldCls('startTime')}
                />
                {formError.startTime && <p className="text-red-400 text-xs">{formError.startTime}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">
                  Kết thúc <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className={fieldCls('endTime')}
                />
                {formError.endTime && <p className="text-red-400 text-xs">{formError.endTime}</p>}
              </div>
            </div>

            {txError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm flex-1">{txError}</p>
                <button onClick={() => setTxError('')}><X className="w-4 h-4 text-red-400 hover:text-red-300" /></button>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" className="btn-primary">
                <Plus className="w-4 h-4" />
                Tạo cuộc bầu cử
              </button>
              <p className="text-text-muted text-xs">Gas fee ~0.001 ETH (Ganache)</p>
            </div>
          </form>
        </div>
      </div>

      <ConfirmTransactionModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
        proposal={`Tạo: ${form.name}`}
        voteChoice="CREATE"
        votingPower="Owner"
        gasFee="~0.001 ETH"
        gasUSD="(Ganache local)"
        txState={txState}
        txHash={txHash}
      />
    </div>
  )
}
