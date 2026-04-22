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

export default function AdminModerationsPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"queue" | "messages">("queue");

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      if (tab === "queue") {
        const queueData = await getModerationQueueAction();
        setItems(queueData);
      } else {
        const messagesData = await getReportedMessagesAction();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error("Erreur chargement moderations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const notes = prompt("Notes (optionnel):");
    try {
      await approveModerationAction(id, notes || undefined);
      await loadData();
      alert("Contenu approuvé!");
    } catch (error) {
      console.error("Erreur approbation:", error);
    }
  };

  const handleRemove = async (id: string) => {
    const reason = prompt("Raison du retrait:");
    if (reason) {
      try {
        await removeModerationContentAction(id, reason);
        await loadData();
        alert("Contenu retiré!");
      } catch (error) {
        console.error("Erreur retrait:", error);
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

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
                <td>
                  <span className="type-badge">{item.type}</span>
                </td>
                <td>{item.reportedBy.substring(0, 8)}</td>
                <td>
                  <div className="content-preview">
                    {item.content.substring(0, 100)}...
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="btn-success"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn-danger"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "messages" && (
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
                <td>{msg.senderEmail.substring(0, 20)}</td>
                <td>
                  <div className="content-preview">{msg.message.substring(0, 100)}</div>
                </td>
                <td>{msg.tripId.substring(0, 8)}</td>
                <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() =>
                      handleRemove(msg.id)
                    }
                    className="btn-danger"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(tab === "queue" && items.length === 0) ||
        (tab === "messages" && messages.length === 0) ? (
        <p>Aucun contenu à modérer.</p>
      ) : null}
    </>
  );
}
