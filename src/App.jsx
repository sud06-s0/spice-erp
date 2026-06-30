import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Procurement from './pages/Procurement'
import Receiving from './pages/Receiving'
import Quality from './pages/Quality'
import Inventory from './pages/Inventory'
import Production from './pages/Production'
import Warehouse from './pages/Warehouse'
import Export from './pages/Export'
import Sales from './pages/Sales'
import Finance from './pages/Finance'
import HR from './pages/HR'
import Maintenance from './pages/Maintenance'
import Compliance from './pages/Compliance'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink-muted text-sm">Loading…</div>
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="procurement" element={<Procurement />} />
        <Route path="receiving" element={<Receiving />} />
        <Route path="quality" element={<Quality />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="production" element={<Production />} />
        <Route path="warehouse" element={<Warehouse />} />
        <Route path="export" element={<Export />} />
        <Route path="sales" element={<Sales />} />
        <Route path="finance" element={<Finance />} />
        <Route path="hr" element={<HR />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="compliance" element={<Compliance />} />
      </Route>
    </Routes>
  )
}