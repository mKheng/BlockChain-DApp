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

function parseError(err) {
  return err?.reason ?? err?.info?.error?.message ?? err?.shortMessage ?? err?.message ?? 'Transaction thất bại'
}

// Status labels: 0 = pending, 1 = active, 2 = ended
export const ELECTION_STATUS = { 0: 'pending', 1: 'active', 2: 'ended' }

// ─────────────────────────────────────────────────────────────────────────────
export function useVoting() {
  const [walletState, setWalletState]       = useState('disconnected')
  const [walletAddress, setWalletAddress]   = useState('')
  const [isOwner, setIsOwner]               = useState(false)

  // Election list
  const [elections, setElections]           = useState([])
  const [loadingElections, setLoadingElections] = useState(false)

  // Per-election state
  const [currentElection, setCurrentElection] = useState(null)
  const [candidates, setCandidates]         = useState([])
  const [isRegistered, setIsRegistered]     = useState(false)
  const [userVotedFor, setUserVotedFor]     = useState(null)
  const [totalVotesCast, setTotalVotesCast] = useState(0)
  const [voteHistory, setVoteHistory]       = useState([])

  const [loadingData, setLoadingData]       = useState(false)
  const [contractError, setContractError]   = useState('')

  // ── Fetch all elections ───────────────────────────────────────────────────
  const fetchElections = useCallback(async (address) => {
    if (!CONTRACT_ADDRESS) {
      setContractError('CONTRACT_ADDRESS chưa được điền. Hãy deploy contract và cập nhật src/lib/contract.js')
      return
    }
    setContractError('')
    setLoadingElections(true)
    try {
      const contract = await getContract()
      const ownerAddr = await contract.owner()
      if (address) setIsOwner(ownerAddr.toLowerCase() === address.toLowerCase())

      const count = Number(await contract.electionCount())
      const list = []
      for (let i = 1; i <= count; i++) {
        const [id, name, description, startTime, endTime, candidateCount, status] = await contract.getElectionInfo(i)
        list.push({
          id: Number(id),
          name,
          description,
          startTime: Number(startTime),
          endTime: Number(endTime),
          candidateCount: Number(candidateCount),
          status: Number(status), // 0=pending, 1=active, 2=ended
        })
      }
      setElections(list)
    } catch (err) {
      console.error('[useVoting] fetchElections error:', err)
      setContractError(err.message ?? 'Không thể kết nối contract')
    } finally {
      setLoadingElections(false)
    }
  }, [])

  // ── Fetch single election data ────────────────────────────────────────────
  const fetchElectionData = useCallback(async (electionId, address) => {
    if (!CONTRACT_ADDRESS || !electionId) return
    setContractError('')
    setLoadingData(true)
    try {
      const contract = await getContract()
      const [id, name, description, startTime, endTime, candidateCount, status] = await contract.getElectionInfo(electionId)
      setCurrentElection({
        id: Number(id), name, description,
        startTime: Number(startTime), endTime: Number(endTime),
        candidateCount: Number(candidateCount), status: Number(status),
      })

      const [ids, names, roles, voteCounts] = await contract.getElectionResults(electionId)
      const total = voteCounts.reduce((s, v) => s + Number(v), 0)
      setTotalVotesCast(total)

      const elStatus = Number(status)
      const mapped = ids.map((cid, i) => ({
        id: Number(cid),
        name: names[i],
        role: roles[i],
        votes: Number(voteCounts[i]),
        totalVotes: Math.max(total, 1),
        status: elStatus === 1 ? 'active' : 'closed',
        blockchainId: `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`,
        avatar: getInitials(names[i]),
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        canVote: false,
      }))

      if (address) {
        const registered = await contract.isRegistered(electionId, address)
        setIsRegistered(registered)

        const voted = await contract.hasVoted(electionId, address)
        if (voted) {
          const votedId = Number(await contract.votedFor(electionId, address))
          setUserVotedFor(votedId)
          try {
            const filter = contract.filters.VoteCast(electionId, address)
            const events = await contract.queryFilter(filter)
            setVoteHistory(events.map((e) => ({
              txHash: e.transactionHash,
              blockNumber: e.blockNumber,
              candidateId: Number(e.args.candidateId),
            })))
          } catch { setVoteHistory([]) }
        } else {
          setUserVotedFor(null)
          setVoteHistory([])
          mapped.forEach((c) => { c.canVote = elStatus === 1 && registered })
        }
      } else {
        setIsRegistered(false)
        setUserVotedFor(null)
        setVoteHistory([])
      }

      setCandidates(mapped)
    } catch (err) {
      console.error('[useVoting] fetchElectionData error:', err)
      setContractError(err.message ?? 'Không thể tải dữ liệu cuộc bầu cử')
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
      await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }])
      const accounts = await provider.send('eth_requestAccounts', [])
      const address = accounts[0]
      setWalletAddress(address)
      setWalletState('connected')
      localStorage.setItem('wallet_disconnected', 'false')
      await fetchElections(address)
    } catch (err) {
      console.error('[useVoting] connectWallet error:', err)
      setWalletState('disconnected')
    }
  }, [fetchElections])

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const disconnectWallet = useCallback(() => {
    localStorage.setItem('wallet_disconnected', 'true')
    setWalletAddress('')
    setIsOwner(false)
    setUserVotedFor(null)
    setVoteHistory([])
    setCurrentElection(null)
    setCandidates([])
    setElections([])
    setTimeout(() => { setWalletState('disconnected') }, 100)
  }, [])

  // ── Create election (owner) ────────────────────────────────────────────────
  const createElection = useCallback(async (name, description, startTime, endTime, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.createElection(name, description, startTime, endTime)
      onPending?.()
      const receipt = await tx.wait()
      await fetchElections(walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchElections])

  // ── Force end election (owner) ─────────────────────────────────────────────
  const forceEndElection = useCallback(async (electionId, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.forceEndElection(electionId)
      onPending?.()
      const receipt = await tx.wait()
      await fetchElections(walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchElections])

  // ── Add candidate (owner) ──────────────────────────────────────────────────
  const addCandidate = useCallback(async (electionId, name, role, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.addCandidate(electionId, name, role)
      onPending?.()
      const receipt = await tx.wait()
      await fetchElectionData(electionId, walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchElectionData])

  // ── Register voter ─────────────────────────────────────────────────────────
  const registerVoter = useCallback(async (electionId, cccdNumber, { onPending } = {}) => {
    try {
      const cccdHash = keccak256(toUtf8Bytes(cccdNumber.trim()))
      const contract = await getContract(true)
      const tx = await contract.registerVoter(electionId, cccdHash)
      onPending?.()
      const receipt = await tx.wait()
      await fetchElectionData(electionId, walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchElectionData])

  // ── Cast vote ──────────────────────────────────────────────────────────────
  const castVote = useCallback(async (electionId, candidateId, { onPending } = {}) => {
    try {
      const contract = await getContract(true)
      const tx = await contract.vote(electionId, candidateId)
      onPending?.()
      const receipt = await tx.wait()
      await fetchElectionData(electionId, walletAddress)
      return { success: true, hash: receipt.hash ?? tx.hash }
    } catch (err) {
      return { success: false, error: parseError(err) }
    }
  }, [walletAddress, fetchElectionData])

  // ── Auto-reconnect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) { await fetchElections(null); return }
      const isManualDisconnect = localStorage.getItem('wallet_disconnected') === 'true'
      if (isManualDisconnect) { await fetchElections(null); return }
      try {
        const provider = getProvider()
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const address = accounts[0].address
          setWalletAddress(address)
          setWalletState('connected')
          await fetchElections(address)
        } else {
          await fetchElections(null)
        }
      } catch { await fetchElections(null) }
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
        setElections([])
        fetchElections(null)
      } else {
        const address = accounts[0]
        setWalletAddress(address)
        setWalletState('connected')
        fetchElections(address)
      }
    }
    const onChainChanged = () => window.location.reload()
    window.ethereum?.on('accountsChanged', onAccountsChanged)
    window.ethereum?.on('chainChanged', onChainChanged)
    return () => {
      window.ethereum?.removeListener('accountsChanged', onAccountsChanged)
      window.ethereum?.removeListener('chainChanged', onChainChanged)
    }
  }, [fetchElections])

  return {
    walletState, walletAddress, isOwner,
    elections, loadingElections,
    currentElection, candidates,
    isRegistered, userVotedFor, totalVotesCast, voteHistory,
    loadingData, contractError,
    connectWallet, disconnectWallet,
    fetchElections, fetchElectionData,
    createElection, forceEndElection, addCandidate, registerVoter, castVote,
  }
}
