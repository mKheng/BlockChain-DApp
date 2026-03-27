import { NavLink } from 'react-router-dom'
import { Home, Shield, Vote, BarChart2, Settings, HelpCircle, Zap, UserCheck, Plus, ArrowLeft } from 'lucide-react'
import clsx from 'clsx'

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-100',
          isActive
            ? 'bg-brand-dim text-brand font-medium'
            : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
        )
      }
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {label}
    </NavLink>
  )
}

export default function Sidebar({ isOwner, walletConnected, walletAddress, electionId, currentElection }) {
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : ''

  const insideElection = !!electionId
  const base = `/elections/${electionId}`

  return (
    <aside className="w-60 shrink-0 bg-surface-800 border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border shrink-0">
        <div className="bg-brand rounded-lg w-7 h-7 flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" fill="currentColor" />
        </div>
        <span className="ml-2.5 font-bold text-base tracking-tight text-text-primary">VoteChain</span>
      </div>

      {/* Role indicator */}
      {walletConnected && (
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-lg bg-surface-600 border border-border">
          <p className={clsx(
            'text-xs font-semibold',
            isOwner ? 'text-amber-400' : 'text-brand',
          )}>
            {isOwner ? 'Ban tổ chức' : 'Cử tri'}
          </p>
          <p className="text-text-muted text-[11px] font-mono mt-0.5">{shortAddress}</p>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {insideElection ? (
          <>
            {/* Back to elections list */}
            <NavLink
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-text-secondary hover:bg-white/[0.04] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tất cả cuộc bầu cử
            </NavLink>

            {/* Current election name */}
            {currentElection && (
              <div className="px-3 mb-3">
                <p className="text-text-primary text-sm font-semibold truncate">{currentElection.name}</p>
                <p className="text-text-muted text-[11px] mt-0.5 truncate">{currentElection.description}</p>
              </div>
            )}

            <NavItem to={base} icon={Home} label="Tổng quan" end />
            {isOwner && <NavItem to={`${base}/manage`} icon={Shield} label="Quản trị" />}
            {!isOwner && <NavItem to={`${base}/register`} icon={UserCheck} label="Đăng ký Cử tri" />}
            {!isOwner && <NavItem to={`${base}/history`} icon={Vote} label="Phiếu của tôi" />}
            <NavItem to={`${base}/results`} icon={BarChart2} label="Kết quả" />
          </>
        ) : (
          <>
            <NavItem to="/" icon={Home} label="Cuộc bầu cử" end />
            {isOwner && <NavItem to="/elections/new" icon={Plus} label="Tạo mới" />}
          </>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-border px-3 py-3 flex flex-col gap-0.5">
        <NavItem to="/settings" icon={Settings} label="Cài đặt" />
      </div>
    </aside>
  )
}
