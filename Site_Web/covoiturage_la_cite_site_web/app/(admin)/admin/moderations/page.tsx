"use client";

import { useEffect, useState } from "react";
import {
  getModerationQueueAction,
  approveModerationAction,
  removeModerationContentAction,
  getReportedMessagesAction,
  ModerationItem,
  ChatMessage,
} from "@/features/admin/services/admin.moderations.actions";
import AdminModal from "@/features/admin/components/AdminModal";
import { useAdminToast, AdminToastContainer } from "@/features/admin/components/AdminToast";

export default function AdminModerationsPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"queue" | "messages">("queue");
  const [selectedItem, setSelectedItem] = useState<ModerationItem | ChatMessage | null>(null);
  const [notes, setNotes] = useState("");
  const [removalReason, setRemovalReason] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"approve" | "remove" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, removeToast, success, error } = useAdminToast();

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tab === "queue") {
        const queueData = await getModerationQueueAction();
        setItems(queueData);
      } else {
        const messagesData = await getReportedMessagesAction();
        setMessages(messagesData);
      }
    } catch (err) {
      console.error("Erreur chargement modérations:", err);
      error("Erreur lors du chargement des modérations");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (item: ModerationItem | ChatMessage) => {
    setSelectedItem(item);
    setNotes("");
    setModalType("approve");
    setModalOpen(true);
  };

  const handleRemoveClick = (item: ModerationItem | ChatMessage) => {
    setSelectedItem(item);
    setRemovalReason("");
    setModalType("remove");
    setModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedItem) return;

    setActionLoading(true);
    try {
      const itemId = "id" in selectedItem ? selectedItem.id : "";
      await approveModerationAction(itemId, notes || undefined);
      success("Contenu approuvé!");
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Erreur approbation:", err);
      error("Erreur lors de l'approbation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!selectedItem || !removalReason.trim()) {
      error("Veuillez entrer une raison");
      return;
    }

    setActionLoading(true);
    try {
      const itemId = "id" in selectedItem ? selectedItem.id : "";
      await removeModerationContentAction(itemId, removalReason);
      success("Contenu retiré!");
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Erreur retrait:", err);
      error("Erreur lors du retrait du contenu");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Modération Contenu</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Chargement des modérations...
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Modération Contenu</h1>

      <div className="tab-controls">
        <button
          className={tab === "queue" ? "active" : ""}
          onClick={() => setTab("queue")}
        >
          File de Modération ({items.length})
        </button>
        <button
          className={tab === "messages" ? "active" : ""}
          onClick={() => setTab("messages")}
        >
          Messages Signalés ({messages.length})
        </button>
      </div>

      {tab === "queue" && (
        <>
          {items.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Signalé par</th>
                  <th>Contenu</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Type">
                      <span className="type-badge">{item.type}</span>
                    </td>
                    <td data-label="Signalé par">{item.reportedBy.substring(0, 8)}</td>
                    <td data-label="Contenu">
                      <div className="content-preview">
                        {item.content.substring(0, 100)}...
                      </div>
                    </td>
                    <td data-label="Statut">
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td data-label="Date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleApproveClick(item)}
                          className="btn-success"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleRemoveClick(item)}
                          className="btn-danger"
                        >
                          Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              Aucun contenu à modérer.
            </div>
          )}
        </>
      )}

      {tab === "messages" && (
        <>
          {messages.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>De</th>
                  <th>Message</th>
                  <th>Trajet</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id}>
                    <td data-label="De">{msg.senderEmail.substring(0, 20)}</td>
                    <td data-label="Message">
                      <div className="content-preview">
                        {msg.message.substring(0, 100)}
                      </div>
                    </td>
                    <td data-label="Trajet">{msg.tripId.substring(0, 8)}</td>
                    <td data-label="Date">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="Actions">
                      <button
                        onClick={() => handleRemoveClick(msg)}
                        className="btn-danger"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              Aucun message à modérer.
            </div>
          )}
        </>
      )}

      <AdminModal
        isOpen={modalOpen && modalType === "approve"}
        title="Approuver le Contenu"
        message="Entrez des notes optionnelles pour cette approbation."
        hasInput
        inputRows={2}
        inputPlaceholder="Ex: Contenu conforme aux règles"
        inputValue={notes}
        onInputChange={setNotes}
        confirmText="Approuver"
        cancelText="Annuler"
        isLoading={actionLoading}
        onConfirm={handleConfirmApprove}
        onClose={() => setModalOpen(false)}
      />

      <AdminModal
        isOpen={modalOpen && modalType === "remove"}
        title="Retirer le Contenu"
        message="Entrez une raison pour le retrait de ce contenu."
        hasInput
        inputRows={3}
        inputPlaceholder="Ex: Langage abusif, contenu offensant"
        inputValue={removalReason}
        onInputChange={setRemovalReason}
        confirmText="Retirer"
        cancelText="Annuler"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleConfirmRemove}
        onClose={() => setModalOpen(false)}
      />

      <AdminToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
