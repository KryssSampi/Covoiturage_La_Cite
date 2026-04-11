export default function ConfirmDialog({ message, onConfirm }) {
  return (
    <div>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirmer</button>
    </div>
  );
}