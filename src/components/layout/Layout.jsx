import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNavigation from './TopNavigation'
import { useVoting } from '../../lib/useVoting'

export default function Layout() {
  const {
    walletState, walletAddress, isOwner,
    candidates, votingOpen, registrationOpen, isRegistered,
    userVotedFor, totalVotesCast, voteHistory,
    loadingData, contractError,
    connectWallet, disconnectWallet,
    castVote, registerCandidate, setVotingStatus, setRegistrationStatus, registerVoter,
    refreshData,
  } = useVoting()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar
        walletConnected={walletState === 'connected'}
        walletAddress={walletAddress}
        isOwner={isOwner}
        onConnectWallet={connectWallet}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNavigation
          walletState={walletState}
          walletAddress={walletAddress}
          isOwner={isOwner}
          onConnectWallet={connectWallet}
          onDisconnectWallet={disconnectWallet}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{
            walletState, walletAddress, isOwner,
            candidates, votingOpen, registrationOpen, isRegistered,
            userVotedFor, totalVotesCast, voteHistory,
            loadingData, contractError,
            onConnectWallet: connectWallet,
            onDisconnectWallet: disconnectWallet,
            castVote, registerCandidate, setVotingStatus, setRegistrationStatus, registerVoter,
            refreshData,
          }} />
        </main>
      </div>
    </div>
  )
}
