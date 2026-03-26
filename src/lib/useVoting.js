import { useState, useCallback, useEffect } from 'react'
import { BrowserProvider, Contract, keccak256, toUtf8Bytes } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract'

const AVATAR_COLORS = [
  'from-blue-600 to-purple-600',
  'from-green-600 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-violet-500',
  'from-cyan-500 to-blue-500',
]

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  return new BrowserProvider(window.ethereum)
}

async function getContract(withSigner = false) {
  if (!CONTRACT_ADDRESS) throw new Error('CONTRACT_ADDRESS chưa được điền trong src/lib/contract.js')
  const provider = getProvider()
  if (withSigner) {
    const signer = await provider.getSigner()
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
}

// Helper lấy error message readable từ ethers v6
function parseError(err) {
  return err?.reason ?? err?.info?.error?.message ?? err?.shortMessage ?? err?.message ?? 'Transaction thất bại'
}

// ─────────────────────────────────────────────────────────────────────────────
export function useVoting() {
  const [walletState, setWalletState]       = useState('disconnected')
  const [walletAddress, setWalletAddress]   = useState('')
  const [isOwner, setIsOwner]               = useState(false)

  const [candidates, setCandidates]         = useState([])
  const [votingOpen, setVotingOpen]         = useState(false)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [isRegistered, setIsRegistered]     = useState(false)
  const [userVotedFor, setUserVotedFor]     = useState(null)
  const [totalVotesCast, setTotalVotesCast] = useState(0)
  const [voteHistory, setVoteHistory]       = useState([]) // [{txHash, blockNumber, candidateId}]

  const [loadingData, setLoadingData]       = useState(false)
  const [contractError, setContractError]   = useState('')

  // ── Fetch tất cả data từ contract ─────────────────────────────────────────
  const fetchData = useCallback(async (address) => {
    if (!CONTRACT_ADDRESS) {
      setContractError('CONTRACT_ADDRESS chưa được điền. Hãy deploy contract và cập nhật src/lib/contract.js')
      return
    }
    setContractError('')
    setLoadingData(true)
    try {
      const contract = await getContract()
      const [ids, names, roles, voteCounts] = await contract.getResults()
      const isOpen    = await contract.votingOpen()
      const regOpen   = await contract.registrationOpen()
      const ownerAddr = await contract.owner()

      setVotingOpen(isOpen)
      setRegistrationOpen(regOpen)
      if (address) setIsOwner(ownerAddr.toLowerCase() === address.toLowerCase())

      const total = voteCounts.reduce((s, v) => s + Number(v), 0)
      setTotalVotesCast(total)

      const mapped = ids.map((id, i) => ({
        id: Number(id),
        name: names[i],
        role: roles[i],
        votes: Number(voteCounts[i]),
        totalVotes: Math.max(total, 1),
        status: isOpen ? 'active' : 'closed',
        blockchainId: `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`,
        avatar: getInitials(names[i]),
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        canVote: false,
      }))

      if (address) {
        const registered = await contract.isRegistered(address)
        setIsRegistered(registered)

        const voted = await contract.hasVoted(address)
        if (voted) {
          const votedId = Number(await contract.votedFor(address))
          setUserVotedFor(votedId)
          // Lấy lịch sử vote từ blockchain events
          try {
            const filter = contract.filters.VoteCast(address)
            const events = await contract.queryFilter(filter)
            setVoteHistory(events.map((e) => ({
              txHash:      e.transactionHash,
              blockNumber: e.blockNumber,
              candidateId: Number(e.args.candidateId),
            })))
          } catch {
            setVoteHistory([])
          }
        } else {
          setUserVotedFor(null)
          setVoteHistory([])
          // Chỉ voter đã đăng ký mới có thể vote
          mapped.forEach((c) => { c.canVote = isOpen && registered })
        }
      } else {
        setIsRegistered(false)
        setUserVotedFor(null)
        setVoteHistory([])
      }

      setCandidates(mapped)
    } catch (err) {
      console.error('[useVoting] fetchData error:', err)
      setContractError(err.message ?? 'Không thể kết nối contract')
    } finally {
      setLoadingData(false)
    }
  }, [])

  // ── Connect MetaMask ───────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) { alert('Vui lòng cài MetaMask trước!'); return }
    setWalletState('connecting')
    try {
      const provider = getProvider()
      
      // Buộc MetaMask hiển thị bảng chọn tài khoản bằng cách yêu cầu permissions
      await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }])
      
      const accounts = await provider.send('eth_requestAccounts', [])
      const address = accounts[0]
      setWalletAddress(address)
      setWalletState('connected')
      localStorage.setItem('wallet_disconnected', 'false')
      await fetchData(address)
    } catch (err) {
      console.error('[useVoting] connectWallet error:', err)
      setWalletState('disconnected')
    }
  }, [fetchData])

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const disconnectWallet = useCallback(() => {
    localStorage.setItem('wallet_disconnected', 'true')
    setWalletAddress('')
    setIsOwner(false)
    setUserVotedFor(null)
    setVoteHistory([])
    
    // Delay setting state to 'disconnected' to avoid UI click-through races
    setTimeout(() => {
      setWalletState('disconnected')
    }, 100)

    fetchData(null)
  }, [fetchData])

  // ── Bỏ phiếu ──────────────────────────────────────────────────────────────
  const castVote = useCallback(async (candidateId, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.vote(candidateId)
      onPending?.()
      const receipt = await tx.wait()
      await fetchData(walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchData])

  // ── Đăng ký ứng cử viên (chỉ owner) ──────────────────────────────────────
  const registerCandidate = useCallback(async (name, role, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.registerCandidate(name, role)
      onPending?.()
      const receipt = await tx.wait()
      await fetchData(walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchData])

  // ── Mở / đóng bầu cử (chỉ owner) ─────────────────────────────────────────
  const setVotingStatus = useCallback(async (open, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.setVotingStatus(open)
      onPending?.()
      const receipt = await tx.wait()
      await fetchData(walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchData])

  // ── Mở / đóng đăng ký voter (chỉ owner) ──────────────────────────────────
  const setRegistrationStatus = useCallback(async (open, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.setRegistrationStatus(open)
      onPending?.()
      const receipt = await tx.wait()
      await fetchData(walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchData])

  // ── Voter đăng ký bằng CCCD ───────────────────────────────────────────────
  const registerVoter = useCallback(async (cccdNumber, { onPending } = {}) => {
    try {
      const cccdHash = keccak256(toUtf8Bytes(cccdNumber.trim()))
      const contract = await getContract(true)
      const tx = await contract.registerVoter(cccdHash)
      onPending?.()
      const receipt = await tx.wait()
      await fetchData(walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchData])

  // ── Auto-reconnect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) { 
        await fetchData(null)
        return 
      }
      
      const isManualDisconnect = localStorage.getItem('wallet_disconnected') === 'true'
      if (isManualDisconnect) {
        await fetchData(null)
        return
      }

      try {
        const provider = getProvider()
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const address = accounts[0].address
          setWalletAddress(address)
          setWalletState('connected')
          await fetchData(address)
        } else {
          await fetchData(null)
        }
      } catch (err) { 
        await fetchData(null) 
      }
    }
    init()

    const onAccountsChanged = (accounts) => {
      const isManualDisconnect = localStorage.getItem('wallet_disconnected') === 'true'
      if (isManualDisconnect) return

      if (accounts.length === 0) {
        setWalletState('disconnected')
        setWalletAddress('')
        setIsOwner(false)
        setUserVotedFor(null)
        setVoteHistory([])
        fetchData(null)
      } else {
        const address = accounts[0]
        setWalletAddress(address)
        setWalletState('connected')
        fetchData(address)
      }
    }
    const onChainChanged = () => window.location.reload()
    window.ethereum?.on('accountsChanged', onAccountsChanged)
    window.ethereum?.on('chainChanged', onChainChanged)
    return () => {
      window.ethereum?.removeListener('accountsChanged', onAccountsChanged)
      window.ethereum?.removeListener('chainChanged', onChainChanged)
    }
  }, [fetchData])

  return {
    walletState, walletAddress, isOwner,
    candidates, votingOpen, registrationOpen, isRegistered,
    userVotedFor, totalVotesCast, voteHistory,
    loadingData, contractError,
    connectWallet, disconnectWallet,
    castVote, registerCandidate, setVotingStatus, setRegistrationStatus, registerVoter,
    refreshData: () => fetchData(walletAddress),
  }
}
