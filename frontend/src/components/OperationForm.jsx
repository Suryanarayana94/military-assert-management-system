import { useEffect, useState } from 'react';

const labels = { purchase: 'Log purchase', transfer: 'Initiate transfer', assignment: 'Record assignment', expenditure: 'Record expenditure' };

export default function OperationForm({ type, reference, user, onSubmit }) {
  const commander = user.role === 'BASE_COMMANDER';
  const [form, setForm] = useState({ baseId: user.baseId || reference.bases[0]?.id || '', sourceBaseId: user.baseId || reference.bases[0]?.id || '', destinationBaseId: reference.bases.find((base) => base.id !== user.baseId)?.id || '', equipmentTypeId: reference.equipmentTypes[0]?.id || '', quantity: '', assignee: '', reason: '' });
  useEffect(() => setForm((current) => ({
    ...current,
    baseId: user.baseId || current.baseId || reference.bases[0]?.id || '',
    sourceBaseId: user.baseId || current.sourceBaseId || reference.bases[0]?.id || '',
    destinationBaseId: current.destinationBaseId || reference.bases.find((base) => base.id !== user.baseId)?.id || '',
    equipmentTypeId: current.equipmentTypeId || reference.equipmentTypes[0]?.id || ''
  })), [user.baseId, reference.bases, reference.equipmentTypes]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); await onSubmit(form); setForm((current) => ({ ...current, quantity: '', assignee: '', reason: '' })); };
  const baseOptions = reference.bases;
  return <form className="operation-form" onSubmit={submit}>
    {type === 'transfer' ? <><label>Source base<select name="sourceBaseId" value={form.sourceBaseId} onChange={change} disabled={commander}>{baseOptions.map((base) => <option key={base.id} value={base.id}>{base.name}</option>)}</select></label><label>Destination base<select name="destinationBaseId" value={form.destinationBaseId} onChange={change}>{baseOptions.map((base) => <option key={base.id} value={base.id}>{base.name}</option>)}</select></label></> : <label>Base<select name="baseId" value={form.baseId} onChange={change} disabled={commander}>{baseOptions.map((base) => <option key={base.id} value={base.id}>{base.name}</option>)}</select></label>}
    <label>Equipment<select name="equipmentTypeId" value={form.equipmentTypeId} onChange={change}>{reference.equipmentTypes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.category}</option>)}</select></label>
    <label>Quantity<input name="quantity" type="number" min="1" required value={form.quantity} onChange={change} placeholder="0" /></label>
    {type === 'assignment' && <label className="wide-field">Assignee<input name="assignee" required value={form.assignee} onChange={change} placeholder="e.g. 3rd Brigade" /></label>}
    {type === 'expenditure' && <label className="wide-field">Reason<input name="reason" required value={form.reason} onChange={change} placeholder="e.g. Training exercise" /></label>}
    <button className="primary-button form-button" type="submit">{labels[type]}</button>
  </form>;
}
