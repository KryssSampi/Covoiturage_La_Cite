using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("remboursements_penalites")]
[Index("PenaliteId", Name = "idx_remb_penalite")]
[Index("TransactionId", Name = "idx_remb_transaction")]
public partial class RemboursementsPenalite
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("penalite_id")]
    public Guid PenaliteId { get; set; }

    [Column("transaction_id")]
    public Guid? TransactionId { get; set; }

    [Column("montant_rembourse")]
    [Precision(10, 2)]
    public decimal MontantRembourse { get; set; }

    [Column("balance_restante")]
    [Precision(10, 2)]
    public decimal BalanceRestante { get; set; }

    [Column("raison_remboursement")]
    public string RaisonRemboursement { get; set; } = null!;

    [Column("approuve_par")]
    public Guid ApprouvePar { get; set; }

    [Column("date_remboursement", TypeName = "timestamp without time zone")]
    public DateTime DateRemboursement { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ApprouvePar")]
    [InverseProperty("RemboursementsPenalites")]
    public virtual User ApprouveParNavigation { get; set; } = null!;

    [ForeignKey("PenaliteId")]
    [InverseProperty("RemboursementsPenalites")]
    public virtual Penalite Penalite { get; set; } = null!;

    [ForeignKey("TransactionId")]
    [InverseProperty("RemboursementsPenalites")]
    public virtual Transaction? Transaction { get; set; }
}
