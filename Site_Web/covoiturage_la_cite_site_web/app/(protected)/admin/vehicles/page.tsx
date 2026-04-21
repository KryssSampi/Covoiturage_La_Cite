"use client";

import { useEffect, useState } from "react";
import {
  getVehiclesAction,
  approveVehicleAction,
  rejectVehicleAction,
  getVehicleDocumentsAction,
  Vehicle,
} from "@/features/admin/services/admin.vehicles.actions";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [filter]);

  const loadVehicles = async () => {
    try {
      const data = await getVehiclesAction();
      const filtered = 
        filter === "all" ? data :
        filter === "pending" ? data.filter((v) => !v.isApproved) :
        data.filter((v) => v.isApproved);
      setVehicles(filtered);
    } catch (error) {
      console.error("Erreur chargement véhicules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vehicleId: string) => {
    try {
      await approveVehicleAction(vehicleId);
      await loadVehicles();
      alert("Véhicule approuvé!");
    } catch (error) {
      console.error("Erreur approbation:", error);
    }
  };

  const handleReject = async (vehicleId: string) => {
    const reason = prompt("Raison du rejet:");
    if (reason) {
      try {
        await rejectVehicleAction(vehicleId, reason);
        await loadVehicles();
        alert("Véhicule rejeté!");
      } catch (error) {
        console.error("Erreur rejet:", error);
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <h1>Gestion des Véhicules</h1>

      <div className="filter-controls">
        <label>Filtrer:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="pending">En attente d'approbation</option>
          <option value="approved">Approuvés</option>
          <option value="all">Tous</option>
        </select>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Immatriculation</th>
            <th>Marque/Modèle</th>
            <th>Année</th>
            <th>Couleur</th>
            <th>Places</th>
            <th>Documents</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.licensePlate}</td>
              <td>{vehicle.make} {vehicle.model}</td>
              <td>{vehicle.year}</td>
              <td>{vehicle.color}</td>
              <td>{vehicle.seats}</td>
              <td>
                <ul className="doc-list">
                  <li>
                    {vehicle.documents.insurance ? "✓" : "✗"} Assurance
                  </li>
                  <li>
                    {vehicle.documents.registration ? "✓" : "✗"} Immatriculation
                  </li>
                  <li>
                    {vehicle.documents.inspection ? "✓" : "✗"} Inspection
                  </li>
                </ul>
              </td>
              <td>
                <span className={`status-badge ${vehicle.isApproved ? "approved" : "pending"}`}>
                  {vehicle.isApproved ? "Approuvé" : "En attente"}
                </span>
              </td>
              <td>
                {!vehicle.isApproved && (
                  <>
                    <button
                      onClick={() => handleApprove(vehicle.id)}
                      className="btn-success"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(vehicle.id)}
                      className="btn-danger"
                    >
                      Rejeter
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {vehicles.length === 0 && <p>Aucun véhicule à afficher.</p>}
    </>
  );
}
