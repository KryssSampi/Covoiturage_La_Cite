import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ padding: "30px 40px", width: "100%", background: "#f1f5f9", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}