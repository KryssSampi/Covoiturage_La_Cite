export default function TestPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>TEST PAGE</h1>
      <p>Si vous voyez ce texte, le rendering fonct ionne.</p>
      <button onClick={() => alert("Button works!")}>Cliquer</button>
    </div>
  );
}
