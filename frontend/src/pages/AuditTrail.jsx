import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import DataTable, { formatDate } from '../components/DataTable.jsx';

export default function AuditTrail() {
  const { user } = useAuth(); const [logs, setLogs] = useState([]); const [error, setError] = useState('');
  useEffect(() => { api.audit(user).then((result) => setLogs(result.auditLogs)).catch((failure) => setError(failure.message)); }, [user]);
  return <><header className="page-header"><div><p className="eyebrow">SYSTEM ACCOUNTABILITY</p><h1>Audit trail</h1><span>Central, append-only record of all inventory-changing operations.</span></div><ScrollText size={28} /></header>{error && <p className="form-error">{error}</p>}<section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">ADMINISTRATOR VIEW</p><h2>Mutation history</h2></div></div><DataTable rows={logs} columns={[{ label: 'Timestamp', render: (row) => formatDate(row.createdAt) }, { label: 'Action', render: (row) => <span className={`tag ${row.action === 'TRANSFER' ? 'blue-tag' : row.action === 'EXPENDITURE' ? 'red-tag' : 'success'}`}>{row.action}</span> }, { label: 'Details', key: 'details' }, { label: 'Operator', render: (row) => row.user.username }]} /></section></>;
}
