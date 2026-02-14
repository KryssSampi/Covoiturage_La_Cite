using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("comptes_virtuels")]
[Index("UserId", Name = "comptes_virtuels_user_id_key", IsUnique = true)]
[Index("UserId", Name = "idx_comptes_user")]
public partial class ComptesVirtuel
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("balance_disponible")]
    [Precision(10, 2)]
    public decimal BalanceDisponible { get; set; }

    [Column("balance_pending")]
    [Precision(10, 2)]
    public decimal BalancePending { get; set; }

    [Column("balance_penalite")]
    [Precision(10, 2)]
    public decimal BalancePenalite { get; set; }

    [Column("taux_prelevement_actuel")]
    [Precision(5, 4)]
    public decimal TauxPrelevementActuel { get; set; }

    [Column("iban")]
    [StringLength(34)]
    public string? Iban { get; set; }

    [Column("nom_banque")]
    [StringLength(100)]
    public string? NomBanque { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ComptesVirtuel")]
    public virtual User User { get; set; } = null!;
}
