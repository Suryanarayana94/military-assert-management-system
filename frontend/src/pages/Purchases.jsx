import { useEffect, useState } from 'react';
import { PackagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import useReferenceData from '../hooks/useReferenceData.js';
import OperationForm from '../components/OperationForm.jsx';
import DataTable, { formatDate } from '../components/DataTable.jsx';

export default function Purchases() {
  const { user } = useAuth(); const { reference, error: refError } = useReferenceData(); const [purchases, setPurchases] = useState([]); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const load = () => api.purchases(user).then((result) => setPurchases(result.purchases)).catch((failure) => setError(failure.message));
  useEffect(load, [user]);
  const submit = async (data) => { setError(''); try { await api.createPurchase(user, data); setMessage('Purchase logged and stock balance updated.'); load(); } catch (failure) { setError(failure.message); } };
  return <><header className="page-header"><div><p className="eyebrow">INBOUND ASSETS</p><h1>Purchases</h1><span>Record received stock and update the available balance atomically.</span></div><PackagePlus size={28} /></header><section className="panel"><div className="panel-heading"><div><h2>Log incoming assets</h2><p>Every purchase is written to the central audit trail.</p></div></div>{reference.bases.length ? <OperationForm type="purchase" reference={reference} user={user} onSubmit={submit} /> : <div className="loading-card">Loading form…</div>}{message && <p className="success-message">{message}</p>}{(error || refError) && <p className="form-error">{error || refError}</p>}</section><section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">PURCHASE REGISTER</p><h2>Recent receipts</h2></div></div><DataTable rows={purchases} columns={[{ label: 'Date', render: (row) => formatDate(row.createdAt) }, { label: 'Base', render: (row) => row.base.name }, { label: 'Equipment', render: (row) => row.equipmentType.name }, { label: 'Quantity', render: (row) => <b>+{row.quantity.toLocaleString()}</b> }, { label: 'Recorded by', render: (row) => row.createdBy.username }]} /></section></>;
}
