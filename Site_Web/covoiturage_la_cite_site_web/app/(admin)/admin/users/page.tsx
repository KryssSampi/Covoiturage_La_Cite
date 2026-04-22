"use client";

import { useEffect, useState } from "react";
import { getUsersAction, suspendUserAction, AdminUser } from "@/features/admin/services/admin.users.actions";
import AdminModal from "@/features/admin/components/AdminModal";
import { useAdminToast, AdminToastContainer } from "@/features/admin/components/AdminToast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended">("All");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, removeToast, success, error } = useAdminToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersAction();
      setUsers(data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendClick = (user: AdminUser) => {
    setSelectedUser(user);
    setSuspendReason("");
    setModalOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) {
      error("Veuillez entrer une raison");
      return;
    }

    setActionLoading(true);
    try {
      await suspendUserAction(selectedUser.id, suspendReason);
      success("Utilisateur suspendu avec succès");
      setModalOpen(false);
      await loadUsers();
    } catch (err) {
      console.error("Erreur suspension:", err);
      error("Erreur lors de la suspension de l'utilisateur");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Gestion des Utilisateurs</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Chargement des utilisateurs...
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Gestion des Utilisateurs</h1>

      <div className="filter-controls">
        <input
          type="text"
          placeholder="Rechercher par email ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="All">Tous les statuts</option>
          <option value="Active">Actifs</option>
          <option value="Suspended">Suspendus</option>
        </select>
      </div>

      {filteredUsers.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>ID</th>
              <th>Statut</th>
              <th>Créé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td data-label="Email">{user.email}</td>
                <td data-label="ID">{user.id.substring(0, 12)}...</td>
                <td data-label="Statut">
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status === "Active" ? "Actif" : "Suspendu"}
                  </span>
                </td>
                <td data-label="Créé">
                  {new Date(user.createdAt || "").toLocaleDateString()}
                </td>
                <td data-label="Actions">
                  {user.status === "Active" && (
                    <button
                      onClick={() => handleSuspendClick(user)}
                      className="btn-danger"
                    >
                      Suspendre
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          {searchTerm || statusFilter !== "All"
            ? "Aucun utilisateur ne correspond aux critères de recherche."
            : "Aucun utilisateur à afficher."}
        </div>
      )}

      <AdminModal
        isOpen={modalOpen}
        title={`Suspendre ${selectedUser?.email}`}
        message="Entrez une raison pour la suspension de cet utilisateur."
        hasInput
        inputRows={3}
        inputPlaceholder="Ex: Violation des règles de communauté"
        inputValue={suspendReason}
        onInputChange={setSuspendReason}
        confirmText="Suspendre"
        cancelText="Annuler"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleConfirmSuspend}
        onClose={() => setModalOpen(false)}
      />

      <AdminToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
