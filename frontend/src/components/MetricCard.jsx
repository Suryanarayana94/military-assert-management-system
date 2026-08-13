export default function MetricCard({ label, value, caption, tone = 'blue', onClick }) {
  const content = <><span className={`metric-swatch ${tone}`} /><div><p>{label}</p><strong>{Number(value || 0).toLocaleString()}</strong><small>{caption}</small></div></>;
  return onClick ? <button className="metric-card" onClick={onClick}>{content}</button> : <div className="metric-card">{content}</div>;
}
