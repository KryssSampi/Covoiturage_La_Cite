using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("remboursements_transactions")]
[Index("Statut", Name = "idx_remb_trans_statut")]
[Index("TransactionId", Name = "idx_remb_trans_transaction")]
public partial class RemboursementsTransaction
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("transaction_id")]
    public Guid TransactionId { get; set; }

    [Column("montant")]
    [Precision(10, 2)]
    public decimal Montant { get; set; }

    [Column("raison")]
    [StringLength(100)]
    public string Raison { get; set; } = null!;

    [Column("statut")]
    [StringLength(20)]
    public string Statut { get; set; } = null!;

    [Column("date_demande", TypeName = "timestamp without time zone")]
    public DateTime DateDemande { get; set; }

    [Column("date_traitement", TypeName = "timestamp without time zone")]
    public DateTime? DateTraitement { get; set; }

    [Column("gateway_refund_id")]
    [StringLength(255)]
    public string? GatewayRefundId { get; set; }

    [ForeignKey("TransactionId")]
    [InverseProperty("RemboursementsTransactions")]
    public virtual Transaction Transaction { get; set; } = null!;
}
