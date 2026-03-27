# BlockChain-DApp

Hệ thống bỏ phiếu phi tập trung (DApp) xây dựng trên Ethereum blockchain, sử dụng React + Solidity.

## Tổng quan

DApp cho phép tổ chức **nhiều cuộc bầu cử** minh bạch trên blockchain:
- **Owner** tạo cuộc bầu cử (thời gian tự động mở/đóng), thêm ứng cử viên, kết thúc sớm nếu cần
- **Cử tri** đăng ký bằng CCCD (mã hóa keccak256), bỏ phiếu cho ứng cử viên
- Trạng thái bầu cử tự động: **Sắp diễn ra** → **Đang diễn ra** → **Đã kết thúc** (dựa theo thời gian)
- Mọi giao dịch được ghi bất biến trên blockchain

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Blockchain | Solidity ^0.8.0, ethers.js v6 |
| Local Chain | Ganache (Chain ID 1337) |
| Wallet | MetaMask |

## Cấu trúc thư mục

```
contracts/
└── VotingMulti.sol         # Smart contract hỗ trợ multi-election
src/
├── components/
│   ├── layout/             # Layout, Sidebar, TopNavigation
│   ├── modals/             # ConfirmTransactionModal
│   └── shared/             # StatCard, StatusBadge, Toggle, ...
├── lib/
│   ├── contract.js         # Contract address + ABI
│   └── useVoting.js        # Custom hook quản lý Web3 state
├── pages/
│   ├── ElectionList.jsx    # Danh sách cuộc bầu cử
│   ├── CreateElection.jsx  # Tạo cuộc bầu cử mới (owner)
│   ├── Dashboard.jsx       # Trang chủ bầu cử - ứng cử viên + bỏ phiếu
│   ├── CreateProposal.jsx  # Bảng quản trị (owner)
│   ├── RegisterVoter.jsx   # Đăng ký cử tri bằng CCCD
│   ├── DetailedResults.jsx # Kết quả bầu cử chi tiết
│   ├── TransactionHistory.jsx # Lịch sử phiếu bầu on-chain
│   └── AccountSettings.jsx # Cài đặt tài khoản
├── App.jsx
├── main.jsx
└── index.css
```

## Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- [Ganache](https://trufflesuite.com/ganache/) (local blockchain)
- [MetaMask](https://metamask.io/) extension trên trình duyệt
- [Remix IDE](https://remix.ethereum.org/) hoặc Remix Desktop (deploy contract)

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
3. Import tài khoản đầu tiên từ Ganache bằng private key (đây là Owner)

### 5. Deploy Smart Contract

1. Mở Remix IDE (web hoặc Desktop)
2. Tạo file `VotingMulti.sol`, paste code từ `contracts/VotingMulti.sol`
3. Compile với Solidity `^0.8.0`
4. Environment: **Injected Provider - MetaMask** hoặc **Ganache Provider** (`http://127.0.0.1:7545`)
5. Deploy → xác nhận trên MetaMask
6. Copy địa chỉ contract → paste vào `src/lib/contract.js` dòng `CONTRACT_ADDRESS`

### 6. Chạy Frontend

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

## Luồng sử dụng

```
Owner                                    Cử tri
  │                                        │
  ├─ Tạo cuộc bầu cử (tên, thời gian)     │
  ├─ Thêm ứng cử viên                     │
  │                                        │
  │         ── Bầu cử tự động mở ──        │
  │                                        │
  │                                        ├─ Kết nối MetaMask
  │                                        ├─ Đăng ký cử tri bằng CCCD (12 số)
  │                                        ├─ Bỏ phiếu (1 lần duy nhất)
  │                                        │
  │         ── Hết giờ / Kết thúc sớm ──   │
  │                                        │
  ├─ Xem kết quả                           ├─ Xem kết quả
  └─ Tạo cuộc bầu cử mới                  └─ Xem lịch sử giao dịch
```

## Smart Contract — VotingMulti.sol

Contract hỗ trợ tạo nhiều cuộc bầu cử, mỗi cuộc có danh sách ứng cử viên, cử tri riêng biệt.

| Function | Quyền | Mô tả |
|----------|-------|-------|
| `createElection(name, desc, startTime, endTime)` | Owner | Tạo cuộc bầu cử mới |
| `forceEndElection(electionId)` | Owner | Kết thúc bầu cử sớm |
| `addCandidate(electionId, name, role)` | Owner | Thêm ứng cử viên |
| `registerVoter(electionId, cccdHash)` | Public | Đăng ký cử tri (CCCD hash) |
| `vote(electionId, candidateId)` | Registered | Bỏ phiếu |
| `getElectionInfo(electionId)` | Public | Xem thông tin cuộc bầu cử |
| `getElectionResults(electionId)` | Public | Xem kết quả |
| `getElectionStatus(electionId)` | Public | 0: Sắp diễn ra, 1: Đang diễn ra, 2: Đã kết thúc |

## Routing

| Route | Trang |
|-------|-------|
| `/` | Danh sách cuộc bầu cử |
| `/elections/new` | Tạo cuộc bầu cử mới |
| `/elections/:id` | Dashboard bầu cử |
| `/elections/:id/manage` | Bảng quản trị (owner) |
| `/elections/:id/register` | Đăng ký cử tri |
| `/elections/:id/results` | Kết quả chi tiết |
| `/elections/:id/history` | Lịch sử phiếu bầu |
| `/settings` | Cài đặt tài khoản |

## Thành viên nhóm

Vo Minh Khang - 23162041
Nguyen Thanh Tam - 23162087
Trinh Bao Toan - 23162103

## License

MIT
