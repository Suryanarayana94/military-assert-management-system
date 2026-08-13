import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Shell from './components/Shell.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Purchases from './pages/Purchases.jsx';
import Transfers from './pages/Transfers.jsx';
import Assignments from './pages/Assignments.jsx';
import AuditTrail from './pages/AuditTrail.jsx';

function Protected({ children, roles }) {
  const { user } = useAuth(); const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return <Routes><Route path="/login" element={<Login />} /><Route element={<Protected><Shell /></Protected>}><Route index element={<Dashboard />} /><Route path="purchases" element={<Purchases />} /><Route path="transfers" element={<Protected roles={['ADMIN', 'LOGISTICS_OFFICER']}><Transfers /></Protected>} /><Route path="operations" element={<Protected roles={['ADMIN', 'BASE_COMMANDER']}><Assignments /></Protected>} /><Route path="audit" element={<Protected roles={['ADMIN']}><AuditTrail /></Protected>} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
