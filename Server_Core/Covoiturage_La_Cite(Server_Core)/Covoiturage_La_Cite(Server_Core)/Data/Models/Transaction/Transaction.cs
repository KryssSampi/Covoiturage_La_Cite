using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

/// <summary>
/// Transactions financières entre passagers et conducteurs
/// </summary>
[Table("transactions")]
[Index("TransactionCode", Name = "idx_transactions_code")]
[Index("ConducteurId", Name = "idx_transactions_conducteur")]
[Index("CreatedAt", Name = "idx_transactions_created")]
[Index("PassagerId", Name = "idx_transactions_passager")]
[Index("ReservationId", Name = "idx_transactions_reservation")]
[Index("Statut", Name = "idx_transactions_statut")]
[Index("TrajetId", Name = "idx_transactions_trajet")]
[Index("TransactionCode", Name = "transactions_transaction_code_key", IsUnique = true)]
public partial class Transaction
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("reservation_id")]
    public Guid ReservationId { get; set; }

    [Column("conducteur_id")]
    public Guid ConducteurId { get; set; }

    [Column("passager_id")]
    public Guid PassagerId { get; set; }

    [Column("transaction_code")]
    [StringLength(50)]
    public string TransactionCode { get; set; } = null!;

    [Column("prix_total")]
    [Precision(10, 2)]
    public decimal PrixTotal { get; set; }

    [Column("revenus_conducteur_bruts")]
    [Precision(10, 2)]
    public decimal RevenusConducteurBruts { get; set; }

    [Column("penalite_prelevee")]
    [Precision(10, 2)]
    public decimal PenalitePrelevee { get; set; }

    [Column("revenus_conducteur_nets")]
    [Precision(10, 2)]
    public decimal RevenusConducteurNets { get; set; }

    [Column("commission_app_base")]
    [Precision(10, 2)]
    public decimal CommissionAppBase { get; set; }

    [Column("commission_app_totale")]
    [Precision(10, 2)]
    public decimal CommissionAppTotale { get; set; }

    [Column("statut")]
    [StringLength(20)]
    public string Statut { get; set; } = null!;

    [Column("balance_penalite_avant")]
    [Precision(10, 2)]
    public decimal? BalancePenaliteAvant { get; set; }

    [Column("balance_penalite_apres")]
    [Precision(10, 2)]
    public decimal? BalancePenaliteApres { get; set; }

    [Column("date_pre_autorisation", TypeName = "timestamp without time zone")]
    public DateTime? DatePreAutorisation { get; set; }

    [Column("date_capture", TypeName = "timestamp without time zone")]
    public DateTime? DateCapture { get; set; }

    [Column("date_remboursement", TypeName = "timestamp without time zone")]
    public DateTime? DateRemboursement { get; set; }

    [Column("gateway_transaction_id")]
    [StringLength(255)]
    public string? GatewayTransactionId { get; set; }

    [Column("failure_reason")]
    public string? FailureReason { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ConducteurId")]
    [InverseProperty("TransactionConducteurs")]
    public virtual User Conducteur { get; set; } = null!;

    [ForeignKey("PassagerId")]
    [InverseProperty("TransactionPassagers")]
    public virtual User Passager { get; set; } = null!;

    [InverseProperty("Transaction")]
    public virtual ICollection<RemboursementsPenalite> RemboursementsPenalites { get; set; } = new List<RemboursementsPenalite>();

    [InverseProperty("Transaction")]
    public virtual ICollection<RemboursementsTransaction> RemboursementsTransactions { get; set; } = new List<RemboursementsTransaction>();

    [ForeignKey("ReservationId")]
    [InverseProperty("Transactions")]
    public virtual Reservation Reservation { get; set; } = null!;

    [ForeignKey("TrajetId")]
    [InverseProperty("Transactions")]
    public virtual Trajet Trajet { get; set; } = null!;
}
