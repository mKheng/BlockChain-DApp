import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Settings, Wallet, Bell, Shield, LogOut, Copy,
  Check, ChevronDown, User,
} from 'lucide-react'
import clsx from 'clsx'
import Toggle from '../components/shared/Toggle'

const NOTIFICATION_PREFS = [
  { key: 'voteReminders', label: 'Nhắc nhở bỏ phiếu', desc: 'Thông báo trước khi phiên bỏ phiếu đóng' },
  { key: 'proposalResults', label: 'Kết quả bầu cử', desc: 'Thông báo khi bỏ phiếu kết thúc và có kết quả' },
  { key: 'txConfirmations', label: 'Xác nhận giao dịch', desc: 'Cảnh báo khi giao dịch on-chain được xác nhận' },
  { key: 'newProposals', label: 'Cuộc bầu cử mới', desc: 'Cảnh báo khi có cuộc bầu cử mới được tạo' },
]

const LANGUAGES = ['English', 'Tiếng Việt', '中文', 'Español']

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-surface-600 border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <Icon className="w-4 h-4 text-brand" />
        <h2 className="text-text-primary font-semibold text-sm">{title}</h2>
      </div>
      <div className="px-5 py-5 flex flex-col gap-5">{children}</div>
    </div>
  )
}

function SettingRow({ label, desc, action }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-text-primary text-sm font-medium">{label}</span>
        {desc && <span className="text-text-muted text-xs">{desc}</span>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

export default function AccountSettings() {
  const { walletState, walletAddress, onConnectWallet } = useOutletContext()
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState('English')
  const [notifications, setNotifications] = useState({
    voteReminders: true, proposalResults: true,
    txConfirmations: false, newProposals: true,
  })

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : ''

  const handleCopy = () => {
    if (walletAddress) navigator.clipboard?.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const toggleNotif = (key) =>
    setNotifications((n) => ({ ...n, [key]: !n[key] }))

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-brand" />
          <span className="text-brand text-sm font-medium">Tùy chỉnh</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-text-muted text-sm mt-1">
          Quản lý kết nối ví, thông báo và tùy chỉnh hiển thị.
        </p>
      </div>

      {/* Wallet */}
      <Section title="Ví đã kết nối" icon={Wallet}>
        {walletState === 'connected' ? (
          <>
            <SettingRow
              label="Địa chỉ ví"
              desc="Tài khoản Ethereum đang kết nối"
              action={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-muted">{shortAddress}</span>
                  <button onClick={handleCopy} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-chain" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              }
            />
            <SettingRow
              label="Quyền bỏ phiếu"
              desc="Dựa trên tư cách cử tri đã đăng ký"
              action={<span className="text-brand font-semibold text-sm">1 Phiếu</span>}
            />
            <SettingRow
              label="Mạng lưới"
              desc="Blockchain đang kết nối"
              action={
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-chain" />
                  <span className="text-text-muted text-sm">Ethereum Mainnet</span>
                </div>
              }
            />
            <div className="pt-1 border-t border-border">
              <button className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition-colors font-medium cursor-pointer">
                <LogOut className="w-4 h-4" />
                Ngắt kết nối ví
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-text-muted text-sm">Chưa kết nối ví. Kết nối để sử dụng tính năng bỏ phiếu.</p>
            <button onClick={onConnectWallet} className="btn-primary">
              <Wallet className="w-4 h-4" /> Kết nối ví
            </button>
          </div>
        )}
      </Section>

      {/* Profile */}
      <Section title="Hồ sơ" icon={User}>
        <SettingRow
          label="Tên hiển thị"
          desc="Hiển thị trên các hoạt động của bạn"
          action={
            <input
              defaultValue="Anonymous"
              className="bg-surface-800 border border-border text-text-primary text-sm rounded-lg px-3 py-1.5 outline-none focus:border-brand/40 transition-colors w-36 text-right"
            />
          }
        />
        <SettingRow
          label="Ngôn ngữ"
          desc="Ngôn ngữ hiển thị giao diện"
          action={
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-surface-800 border border-border text-text-primary text-sm rounded-lg px-3 pr-8 py-1.5 outline-none focus:border-brand/40 transition-colors cursor-pointer"
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          }
        />
      </Section>

      {/* Notifications */}
      <Section title="Thông báo" icon={Bell}>
        {NOTIFICATION_PREFS.map(({ key, label, desc }) => (
          <SettingRow
            key={key}
            label={label}
            desc={desc}
            action={<Toggle checked={notifications[key]} onChange={() => toggleNotif(key)} />}
          />
        ))}
      </Section>

      {/* Security */}
      <Section title="Bảo mật & Riêng tư" icon={Shield}>
        <SettingRow
          label="Ký giao dịch"
          desc="Yêu cầu xác nhận cho mọi phiếu bầu"
          action={<Toggle checked={true} onChange={() => {}} />}
        />
        <SettingRow
          label="Phân tích"
          desc="Chia sẻ dữ liệu ẩn danh để cải thiện nền tảng"
          action={<Toggle checked={false} onChange={() => {}} />}
        />
      </Section>
    </div>
  )
}
