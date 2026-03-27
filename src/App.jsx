import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ElectionList from './pages/ElectionList'
import CreateElection from './pages/CreateElection'
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
      { index: true, element: <ElectionList /> },
      { path: 'elections/new', element: <CreateElection /> },
      { path: 'elections/:electionId', element: <Dashboard /> },
      { path: 'elections/:electionId/manage', element: <CreateProposal /> },
      { path: 'elections/:electionId/register', element: <RegisterVoter /> },
      { path: 'elections/:electionId/results', element: <DetailedResults /> },
      { path: 'elections/:electionId/history', element: <TransactionHistory /> },
      { path: 'settings', element: <AccountSettings /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
