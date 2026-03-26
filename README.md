# BlockChain-DApp

Hệ thống bỏ phiếu phi tập trung (DApp) xây dựng trên Ethereum blockchain, sử dụng React + Solidity.

## Tổng quan

DApp cho phép tổ chức bầu cử minh bạch trên blockchain:
- **Owner** đăng ký ứng cử viên, quản lý trạng thái bầu cử
- **Cử tri** đăng ký bằng CCCD (mã hóa keccak256), bỏ phiếu cho ứng cử viên
- Mọi giao dịch được ghi bất biến trên blockchain

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Blockchain | Solidity, ethers.js v6 |
| Local Chain | Ganache (Chain ID 1337) |
| Wallet | MetaMask |

## Cấu trúc thư mục

```
src/
├── components/
│   ├── layout/          # Layout, Sidebar, TopNavigation
│   ├── modals/          # ConfirmTransactionModal
│   └── shared/          # StatCard, StatusBadge, Toggle, ...
├── lib/
│   ├── contract.js      # Contract address + ABI
│   └── useVoting.js     # Custom hook quản lý Web3 state
├── pages/
│   ├── Dashboard.jsx    # Trang chủ - danh sách ứng cử viên + bỏ phiếu
│   ├── CreateProposal.jsx  # Admin Panel (chỉ owner)
│   ├── RegisterVoter.jsx   # Đăng ký cử tri bằng CCCD
│   ├── DetailedResults.jsx # Kết quả bầu cử chi tiết
│   ├── TransactionHistory.jsx # Lịch sử phiếu bầu on-chain
│   └── AccountSettings.jsx    # Cài đặt tài khoản
├── App.jsx
├── main.jsx
└── index.css
```

## Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- [Ganache](https://trufflesuite.com/ganache/) (local blockchain)
- [MetaMask](https://metamask.io/) extension trên trình duyệt

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone https://github.com/mKheng/BlockChain-DApp.git
cd BlockChain-DApp
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Khởi động Ganache

- Mở Ganache, tạo workspace mới
- Đảm bảo RPC Server chạy ở `http://127.0.0.1:7545`
- Chain ID: `1337`

### 4. Kết nối MetaMask với Ganache

1. Mở MetaMask → Settings → Networks → Add Network
2. Điền thông tin:
   - Network Name: `Ganache`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
3. Import tài khoản từ Ganache bằng private key

### 5. Deploy Smart Contract

1. Mở [Remix IDE](https://remix.ethereum.org/)
2. Tạo file `Voting.sol`, paste code smart contract
3. Compile với Solidity `^0.8.0`
4. Environment: **Injected Provider - MetaMask** (kết nối Ganache)
5. Deploy → xác nhận trên MetaMask
6. Copy địa chỉ contract → paste vào `src/lib/contract.js` dòng `CONTRACT_ADDRESS`

### 6. Chạy Frontend

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

## Luồng sử dụng

```
Owner                              Cử tri
  │                                  │
  ├─ Mở đăng ký cử tri              │
  │                                  ├─ Kết nối MetaMask
  │                                  ├─ Đăng ký bằng CCCD (12 số)
  ├─ Đăng ký ứng cử viên            │
  ├─ Mở bỏ phiếu                    │
  │                                  ├─ Bỏ phiếu (1 lần duy nhất)
  ├─ Đóng bỏ phiếu                  │
  │                                  ├─ Xem kết quả
  └─ Xem kết quả                    └─ Xem lịch sử giao dịch
```

## Smart Contract

Contract `Voting.sol` bao gồm:

| Function | Quyền | Mô tả |
|----------|-------|-------|
| `registerCandidate(name, role)` | Owner | Đăng ký ứng cử viên |
| `setVotingStatus(bool)` | Owner | Mở/đóng bỏ phiếu |
| `setRegistrationStatus(bool)` | Owner | Mở/đóng đăng ký cử tri |
| `registerVoter(cccdHash)` | Public | Đăng ký cử tri (CCCD hash) |
| `vote(candidateId)` | Registered | Bỏ phiếu |
| `getResults()` | Public | Xem kết quả |

## Thành viên nhóm

<!-- Thêm tên thành viên tại đây -->
Võ Minh Khang - 23162041
Nguyễn Thành Tâm - 23162087
Trịnh Bảo Toàn - 23162103

## License

MIT
