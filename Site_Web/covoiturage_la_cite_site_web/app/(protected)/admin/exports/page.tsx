export default function AdminExportsPage() {
  return (
    <>
      <h1>Exports des rapports</h1>

      <ul>
        <li><a href="/api/admin/export/users">Exporter utilisateurs (CSV)</a></li>
        <li><a href="/api/admin/export/trips">Exporter trajets (CSV)</a></li>
        <li><a href="/api/admin/export/co2">Exporter CO₂ (CSV)</a></li>
        <li><a href="/api/admin/export/finance">Exporter finances (CSV)</a></li>
      </ul>
    </>
  );
}
