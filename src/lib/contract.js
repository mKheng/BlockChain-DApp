// ─────────────────────────────────────────────────────────────────────────────
// BƯỚC 1: Deploy Voting.sol trên Remix IDE
//   - Chọn Environment: "Injected Provider - MetaMask" → kết nối Ganache
//   - Click Deploy → MetaMask popup → xác nhận
//
// BƯỚC 2: Dán địa chỉ contract vào CONTRACT_ADDRESS bên dưới
//   (ví dụ: '0xd9145CCE52D386f254917e481eB44e9943F39138')
//
// BƯỚC 3: Dán ABI vào CONTRACT_ABI bên dưới
//   Remix IDE → tab Solidity Compiler → "Compilation Details" → copy "ABI"
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = '0xCdA876f0Be6995C2Ad9798AE40128C1B0B9C13e3' // ← Điền địa chỉ contract MỚI sau khi redeploy

export const CONTRACT_ABI = [
  // ── Constructor ─────────────────────────────────────────────────────────────
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },

  // ── Events ──────────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'uint256', name: 'id',   type: 'uint256' },
      { indexed: false, internalType: 'string',  name: 'name', type: 'string'  },
    ],
    name: 'CandidateRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'voter',       type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'candidateId', type: 'uint256' },
    ],
    name: 'VoteCast',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'bool', name: 'isOpen', type: 'bool' }],
    name: 'VotingStatusChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'bool', name: 'isOpen', type: 'bool' }],
    name: 'RegistrationStatusChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'address', name: 'voter',    type: 'address' },
      { indexed: false, internalType: 'bytes32', name: 'cccdHash', type: 'bytes32' },
    ],
    name: 'VoterRegistered',
    type: 'event',
  },

  // ── View functions ───────────────────────────────────────────────────────────
  {
    inputs: [],
    name: 'candidateCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'candidates',
    outputs: [
      { internalType: 'uint256', name: 'id',        type: 'uint256' },
      { internalType: 'string',  name: 'name',      type: 'string'  },
      { internalType: 'string',  name: 'role',      type: 'string'  },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' },
      { internalType: 'bool',    name: 'exists',    type: 'bool'    },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getResults',
    outputs: [
      { internalType: 'uint256[]', name: 'ids',        type: 'uint256[]' },
      { internalType: 'string[]',  name: 'names',      type: 'string[]'  },
      { internalType: 'string[]',  name: 'roles',      type: 'string[]'  },
      { internalType: 'uint256[]', name: 'voteCounts', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isRegistered',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'cccdUsed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'votingOpen',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registrationOpen',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'votedFor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'voterCCCD',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ── Write functions ──────────────────────────────────────────────────────────
  {
    inputs: [{ internalType: 'bytes32', name: 'cccdHash', type: 'bytes32' }],
    name: 'registerVoter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bool', name: '_open', type: 'bool' }],
    name: 'setRegistrationStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_role', type: 'string' },
    ],
    name: 'registerCandidate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bool', name: '_open', type: 'bool' }],
    name: 'setVotingStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_candidateId', type: 'uint256' }],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
