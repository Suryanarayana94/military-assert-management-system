const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function DataTable({ columns, rows, empty = 'No records match this scope.' }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.label}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>) : <tr><td className="empty-cell" colSpan={columns.length}>{empty}</td></tr>}</tbody></table></div>;
}

export { formatDate };
