"use client";

import { useEffect, useState } from "react";
import { getPendingDriversAction, approveDriverAction, rejectDriverAction, PendingDriver } from "@/features/admin/services/admin.drivers.actions";
import AdminModal from "@/features/admin/components/AdminModal";
import { useAdminToast, AdminToastContainer } from "@/features/admin/components/AdminToast";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<PendingDriver | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const { toasts, removeToast, success, error } = useAdminToast();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await getPendingDriversAction();
      setDrivers(data);
    } catch (err) {
      console.error("Erreur chargement conducteurs:", err);
      error("Erreur lors du chargement des conducteurs");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (driver: PendingDriver) => {
    setSelectedDriver(driver);
    setActionType("approve");
    setModalOpen(true);
  };

  const handleRejectClick = (driver: PendingDriver) => {
    setSelectedDriver(driver);
    setActionType("reject");
    setRejectionReason("");
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedDriver) return;

    if (actionType === "reject" && !rejectionReason.trim()) {
      error("Veuillez entrer une raison de rejet");
      return;
    }

    setActionLoading(true);
    try {
      if (actionType === "approve") {
        await approveDriverAction(selectedDriver.id);
        success(`${selectedDriver.email} a été approuvé`);
      } else {
        await rejectDriverAction(selectedDriver.id, rejectionReason || "Documents invalides");
        success(`${selectedDriver.email} a été rejeté`);
      }
      setModalOpen(false);
      await loadDrivers();
    } catch (err) {
      console.error("Erreur traitement conducteur:", err);
      error("Erreur lors du traitement du conducteur");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Conducteurs en Attente de Validation</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Chargement des conducteurs...
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Conducteurs en Attente de Validation</h1>

      {drivers.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>ID</th>
              <th>Créé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td data-label="Email">{driver.email}</td>
                <td data-label="ID">{driver.id.substring(0, 12)}...</td>
                <td data-label="Créé">
                  {new Date(driver.createdAt || "").toLocaleDateString()}
                </td>
                <td data-label="Actions">
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleApproveClick(driver)}
                      className="btn-success"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleRejectClick(driver)}
                      className="btn-danger"
                    >
                      Refuser
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Aucun conducteur en attente de validation.
        </div>
      )}

      <AdminModal
        isOpen={modalOpen}
        title={
          actionType === "approve"
            ? `Approuver ${selectedDriver?.email}`
            : `Refuser ${selectedDriver?.email}`
        }
        message={
          actionType === "approve"
            ? "Êtes-vous sûr de vouloir approuver ce conducteur?"
            : "Entrez une raison pour le rejet de ce conducteur."
        }
        hasInput={actionType === "reject"}
        inputRows={3}
        inputPlaceholder="Ex: Documents invalides, Photos manquantes"
        inputValue={rejectionReason}
        onInputChange={setRejectionReason}
        confirmText={actionType === "approve" ? "Approuver" : "Refuser"}
        cancelText="Annuler"
        isDangerous={actionType === "reject"}
        isLoading={actionLoading}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />

      <AdminToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
