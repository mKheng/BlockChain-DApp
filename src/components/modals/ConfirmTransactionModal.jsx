import { X, Fingerprint, ArrowRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

// txState: 'idle' | 'signing' | 'pending' | 'success' | 'failed'
export default function ConfirmTransactionModal({
  isOpen,
  onClose,
  onConfirm,
  proposal = '#43: New Listing Criteria',
  voteChoice = 'YES',
  votingPower = '1,250.00 VP',
  gasFee = '0.0002 ETH',
  gasUSD = '~$0.45',
  txState = 'idle',
  txHash = '',
}) {
  if (!isOpen) return null

  const isLoading = txState === 'signing' || txState === 'pending'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-surface-800 border border-border w-full max-w-[420px] rounded-xl overflow-hidden">

        {/* Header */}
        <div className="border-b border-border flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500/15 flex items-center justify-center">
              <span className="text-orange-400 text-xs font-bold">M</span>
            </div>
            <span className="text-text-primary text-sm font-semibold">Yêu cầu ký xác nhận</span>
          </div>
          {!isLoading && (
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Icon + title */}
          <div className="flex flex-col items-center gap-2">
            {txState === 'success' ? (
              <div className="w-14 h-14 rounded-xl bg-green-chain/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-chain" />
              </div>
            ) : isLoading ? (
              <div className="w-14 h-14 rounded-xl bg-brand-dim flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-brand animate-spin" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-dim flex items-center justify-center">
                <Fingerprint className="w-7 h-7 text-brand" />
              </div>
            )}
            <h3 className="text-lg font-bold text-text-primary mt-1">
              {txState === 'success' ? 'Xác nhận thành công!' : 'Xác nhận giao dịch'}
            </h3>
            <p className="text-text-muted text-sm text-center">
              {txState === 'success'
                ? 'Phiếu bầu của bạn đã được ghi nhận trên blockchain.'
                : (
                  <>
                    Bạn đang bỏ phiếu{' '}
                    <span className="font-semibold text-green-chain">{voteChoice}</span>{' '}
                    cho {proposal}.
                  </>
                )}
            </p>
          </div>

          {/* Details */}
          {txState !== 'success' && (
            <div className="bg-surface-900 border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Nội dung</span>
                <span className="text-text-primary text-sm font-medium text-right max-w-[180px] truncate">{proposal}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Quyền bỏ phiếu</span>
                <span className="text-text-primary font-mono text-sm">{votingPower}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Phí gas (ước tính)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-text-muted font-mono text-xs">{gasUSD}</span>
                  <span className="text-text-primary font-mono text-sm">{gasFee}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tx hash */}
          {txState === 'success' && txHash && (
            <div className="bg-surface-900 border border-border rounded-xl p-4 text-center">
              <p className="text-text-muted text-xs mb-1">Mã giao dịch</p>
              <p className="text-brand font-mono text-sm truncate">{txHash}</p>
            </div>
          )}

          {/* Info notice */}
          {txState !== 'success' && (
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-blue-400 text-xs leading-relaxed">
                Hành động này không thể hoàn tác sau khi xác nhận trên blockchain.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex flex-col gap-2.5">
          {txState === 'success' ? (
            <button onClick={onClose} className="btn-primary w-full justify-center py-3 rounded-xl">
              Đóng
            </button>
          ) : (
            <>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer',
                  isLoading
                    ? 'bg-brand/50 cursor-not-allowed'
                    : 'bg-brand hover:bg-brand-hover',
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {txState === 'signing' ? 'Đang chờ ký...' : 'Đang phát sóng...'}
                  </>
                ) : (
                  <>
                    Xác nhận giao dịch
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full border border-border text-text-secondary font-medium rounded-xl py-2.5 text-sm
                           hover:bg-white/[0.04] hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
              >
                Từ chối
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
