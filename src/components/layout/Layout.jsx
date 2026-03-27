import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNavigation from './TopNavigation'
import { useVoting } from '../../lib/useVoting'

export default function Layout() {
  const { electionId } = useParams()
  const voting = useVoting()

  // Load election-specific data when electionId changes
  useEffect(() => {
    if (electionId && voting.walletState !== 'connecting') {
      voting.fetchElectionData(Number(electionId), voting.walletAddress || null)
    }
  }, [electionId, voting.walletAddress, voting.walletState])

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar
        walletConnected={voting.walletState === 'connected'}
        walletAddress={voting.walletAddress}
        isOwner={voting.isOwner}
        electionId={electionId}
        currentElection={voting.currentElection}
        onConnectWallet={voting.connectWallet}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNavigation
          walletState={voting.walletState}
          walletAddress={voting.walletAddress}
          isOwner={voting.isOwner}
          onConnectWallet={voting.connectWallet}
          onDisconnectWallet={voting.disconnectWallet}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{
            ...voting,
            electionId: electionId ? Number(electionId) : null,
            onConnectWallet: voting.connectWallet,
            onDisconnectWallet: voting.disconnectWallet,
            refreshElections: () => voting.fetchElections(voting.walletAddress),
            refreshData: () => electionId
              ? voting.fetchElectionData(Number(electionId), voting.walletAddress)
              : voting.fetchElections(voting.walletAddress),
          }} />
        </main>
      </div>
    </div>
  )
}
