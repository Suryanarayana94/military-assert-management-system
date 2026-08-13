import { X } from 'lucide-react';

export default function NetMoveModal({ metrics, onClose }) {
  return <div className="overlay" role="dialog" aria-modal="true"><section className="modal-card">
    <button className="icon-button close-modal" aria-label="Close" onClick={onClose}><X size={18} /></button>
    <p className="eyebrow">NET MOVEMENT DETAIL</p><h2>Movement breakdown</h2><p className="muted">Purchases and completed inter-base transfers for this reporting period.</p>
    <div className="breakdown">
      <span>Purchases <b>+{metrics.purchases.toLocaleString()}</b></span>
      <span>Transfers in <b>+{metrics.transfersIn.toLocaleString()}</b></span>
      <span>Transfers out <b className="danger">−{metrics.transfersOut.toLocaleString()}</b></span>
    </div>
    <div className="total"><span>Net movement</span><b>+{metrics.netMovement.toLocaleString()}</b></div>
    <button className="primary-button full" onClick={onClose}>Close detail</button>
  </section></div>;
}
