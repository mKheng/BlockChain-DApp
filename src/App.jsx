import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CreateProposal from './pages/CreateProposal'
import RegisterVoter from './pages/RegisterVoter'
import DetailedResults from './pages/DetailedResults'
import TransactionHistory from './pages/TransactionHistory'
import AccountSettings from './pages/AccountSettings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'create', element: <CreateProposal /> },
      { path: 'register', element: <RegisterVoter /> },
      { path: 'results', element: <DetailedResults /> },
      { path: 'history', element: <TransactionHistory /> },
      { path: 'settings', element: <AccountSettings /> },
      { path: 'support', element: <Navigate to="/" replace /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
