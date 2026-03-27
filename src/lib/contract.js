// ─────────────────────────────────────────────────────────────────────────────
// BƯỚC 1: Deploy VotingMulti.sol trên Remix IDE
//   - Chọn Environment: "Custom - External Http Provider" → http://127.0.0.1:7545
//   - Click Deploy → xác nhận
//
// BƯỚC 2: Dán địa chỉ contract vào CONTRACT_ADDRESS bên dưới
//
// BƯỚC 3: ABI đã được cập nhật sẵn cho VotingMulti.sol
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = '0xc82Df3BE1816bC541BF3FC414fA412849e858488' // ← Điền địa chỉ contract MỚI sau khi deploy VotingMulti.sol

export const CONTRACT_ABI = [
  // ── Constructor ─────────────────────────────────────────────────────────────
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },

  // ── Events ──────────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'endTime', type: 'uint256' },
    ],
    name: 'ElectionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'candidateId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
    ],
    name: 'CandidateRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: false, internalType: 'bytes32', name: 'cccdHash', type: 'bytes32' },
    ],
    name: 'VoterRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'candidateId', type: 'uint256' },
    ],
    name: 'VoteCast',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
    ],
    name: 'ElectionForceEnded',
    type: 'event',
  },

  // ── View functions ───────────────────────────────────────────────────────────
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'electionCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_electionId', type: 'uint256' }],
    name: 'getElectionStatus',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_electionId', type: 'uint256' }],
    name: 'getElectionInfo',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'uint256', name: 'candidateCount', type: 'uint256' },
      { internalType: 'uint8', name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_electionId', type: 'uint256' }],
    name: 'getElectionResults',
    outputs: [
      { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
      { internalType: 'string[]', name: 'names', type: 'string[]' },
      { internalType: 'string[]', name: 'roles', type: 'string[]' },
      { internalType: 'uint256[]', name: 'voteCounts', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'isRegistered',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'hasVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'votedFor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ── Write functions ──────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_description', type: 'string' },
      { internalType: 'uint256', name: '_startTime', type: 'uint256' },
      { internalType: 'uint256', name: '_endTime', type: 'uint256' },
    ],
    name: 'createElection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_electionId', type: 'uint256' }],
    name: 'forceEndElection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_electionId', type: 'uint256' },
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_role', type: 'string' },
    ],
    name: 'addCandidate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_electionId', type: 'uint256' },
      { internalType: 'bytes32', name: '_cccdHash', type: 'bytes32' },
    ],
    name: 'registerVoter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_electionId', type: 'uint256' },
      { internalType: 'uint256', name: '_candidateId', type: 'uint256' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
