export default function DataTable({ columns, data }) {
  return (
    <table>
      <thead>
        <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {Object.values(row).map((v, j) => <td key={j}>{v}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
``