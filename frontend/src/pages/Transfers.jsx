import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import useReferenceData from '../hooks/useReferenceData.js';
import OperationForm from '../components/OperationForm.jsx';
import DataTable, { formatDate } from '../components/DataTable.jsx';

export default function Transfers() {
  const { user } = useAuth(); const { reference, error: refError } = useReferenceData(); const [transfers, setTransfers] = useState([]); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const load = () => api.transfers(user).then((result) => setTransfers(result.transfers)).catch((failure) => setError(failure.message));
  useEffect(load, [user]);
  const submit = async (data) => { setError(''); try { await api.createTransfer(user, data); setMessage('Transfer completed: source and destination balances were updated in one transaction.'); load(); } catch (failure) { setError(failure.message); } };
  return <><header className="page-header"><div><p className="eyebrow">CROSS-BASE MOVEMENTS</p><h1>Transfers</h1><span>Logistics officers and administrators can move stock between commands.</span></div><Truck size={28} /></header><section className="panel"><div className="panel-heading"><div><h2>Initiate a transfer</h2><p>Stock is checked before the transfer and an audit record is created on completion.</p></div></div>{reference.bases.length ? <OperationForm type="transfer" reference={reference} user={user} onSubmit={submit} /> : <div className="loading-card">Loading form…</div>}{message && <p className="success-message">{message}</p>}{(error || refError) && <p className="form-error">{error || refError}</p>}</section><section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">MOVEMENT REGISTER</p><h2>Transfer history</h2></div></div><DataTable rows={transfers} columns={[{ label: 'Date', render: (row) => formatDate(row.createdAt) }, { label: 'From', render: (row) => row.sourceBase.name }, { label: 'To', render: (row) => row.destinationBase.name }, { label: 'Equipment', render: (row) => row.equipmentType.name }, { label: 'Quantity', render: (row) => row.quantity.toLocaleString() }, { label: 'Status', render: (row) => <span className="tag success">{row.status}</span> }]} /></section></>;
}
