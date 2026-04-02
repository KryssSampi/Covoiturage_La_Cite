using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Finance;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Finance;

public class FinanceService : IFinanceService
{
    private readonly ITransactionRepository _txRepo;
    private readonly IPenaltyRepository _penaltyRepo;
    private readonly IWithdrawalRepository _withdrawalRepo;
    private readonly IUserRepository _userRepo;
    private readonly ILogger<FinanceService> _logger;

    private const decimal COMMISSION = 0.15m;
    private const decimal DRIVER_SHARE = 0.85m;
    private const decimal RETRAIT_MIN = 20.00m;

    public FinanceService(
        ITransactionRepository txRepo,
        IPenaltyRepository penaltyRepo,
        IWithdrawalRepository withdrawalRepo,
        IUserRepository userRepo,
        ILogger<FinanceService> logger)
    {
        _txRepo = txRepo;
        _penaltyRepo = penaltyRepo;
        _withdrawalRepo = withdrawalRepo;
        _userRepo = userRepo;
        _logger = logger;
    }

    // ── Résumés ──────────────────────────────────────────────────────────────

    public async Task<DriverFinanceSummaryDto> GetDriverSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        var profile = user.DriverProfile
            ?? throw new InvalidOperationException("Pas de profil conducteur");

        var startOfWeek = GetStartOfWeek();
        var startOfMonth = new DateTimeOffset(DateTimeOffset.UtcNow.Year, DateTimeOffset.UtcNow.Month, 1, 0, 0, 0, TimeSpan.Zero);

        var gainSemaine = await _txRepo.GetDriverTotalEarningsAsync(userId, startOfWeek, ct);
        var gainMois = await _txRepo.GetDriverTotalEarningsAsync(userId, startOfMonth, ct);
        var activePenalties = await _penaltyRepo.GetActiveByUserIdAsync(userId, ct);

        // Transactions capturées ce mois pour compter les trajets payants
        var txMois = await _txRepo.GetByDriverIdAsync(userId, startOfMonth, null, ct);
        var nbTrajetsPayants = txMois.Count(t => t.Status == PaymentStatus.Captured);

        return new DriverFinanceSummaryDto
        {
            SoldeDisponible = profile.BalanceAvailable,
            SoldeEnTransit = profile.BalancePending,
            SoldePenalites = profile.BalancePenalties,
            TauxPrelevement = profile.WithholdingRate,
            GainSemaine = gainSemaine,
            GainMois = gainMois,
            CommissionTotale = gainMois * COMMISSION / DRIVER_SHARE,
            NbTrajetsPayants = nbTrajetsPayants,
            NbPenalitesActives = activePenalties.Count()
        };
    }

    public async Task<PassengerFinanceSummaryDto> GetPassengerSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var totalDepense = await _txRepo.GetPassengerTotalSpentAsync(userId, null, ct);

        // Transactions de ce passager
        var allTx = await _txRepo.GetByPassengerIdAsync(userId, null, null, ct);
        var captured = allTx.Where(t => t.Status == PaymentStatus.Captured).ToList();
        var preAuth = allTx.Where(t => t.Status == PaymentStatus.PreAuthorized).ToList();

        // Économies estimées vs transport individuel (10$/trajet en solo estimé)
        var economiesEstimees = captured.Count * 10m - totalDepense;
        if (economiesEstimees < 0) economiesEstimees = 0;

        return new PassengerFinanceSummaryDto
        {
            EconomiesEstimees = economiesEstimees,
            FondsEnTransit = preAuth.Sum(t => t.Amount),
            TotalDepense = totalDepense,
            NbTrajetsCompletes = captured.Count
        };
    }

    // ── Transactions ─────────────────────────────────────────────────────────

    public async Task<IEnumerable<TransactionResponseDto>> GetTransactionsAsync(
        Guid userId, string role, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default)
    {
        var transactions = role == "driver"
            ? await _txRepo.GetByDriverIdAsync(userId, from, to, ct)
            : await _txRepo.GetByPassengerIdAsync(userId, from, to, ct);

        return transactions.Select(MapTxToResponse);
    }

    public async Task<TransactionResponseDto?> GetTransactionByIdAsync(Guid transactionId, CancellationToken ct = default)
    {
        var tx = await _txRepo.GetByIdAsync(transactionId, ct);
        return tx == null ? null : MapTxToResponse(tx);
    }

    // ── Opérations de paiement ───────────────────────────────────────────────

    public async Task<TransactionResponseDto> PreAuthorizeAsync(Guid reservationId, CancellationToken ct = default)
    {
        var tx = new Transaction
        {
            Id = Guid.NewGuid(),
            ReservationId = reservationId,
            Status = PaymentStatus.PreAuthorized,
            PreAuthorizedAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Remplir depuis la réservation — les champs manquants (Passenger/Driver/Amount)
        // seront résolus par un médiateur ou lors de la capture. Pour l'instant on crée
        // le squelette de pré-autorisation.
        await _txRepo.AddAsync(tx, ct);
        _logger.LogInformation("Pré-autorisation créée: {TxId} pour réservation {ResId}", tx.Id, reservationId);
        return MapTxToResponse(tx);
    }

    public async Task<TransactionResponseDto> CaptureAsync(Guid transactionId, CancellationToken ct = default)
    {
        var tx = await _txRepo.GetByIdAsync(transactionId, ct)
            ?? throw new KeyNotFoundException("Transaction introuvable");

        if (tx.Status != PaymentStatus.PreAuthorized)
            throw new InvalidOperationException("Seule une transaction pré-autorisée peut être capturée");

        // Calcul 85/15
        tx.DriverShare = Math.Round(tx.Amount * DRIVER_SHARE, 2);
        tx.PlatformShare = Math.Round(tx.Amount * COMMISSION, 2);

        // Prélèvement pénalités si applicable
        var totalPenalties = await _penaltyRepo.GetTotalUndeductedAsync(tx.DriverId, ct);
        if (totalPenalties > 0)
        {
            var user = await _userRepo.GetWithProfileAsync(tx.DriverId, ct);
            var rate = user?.DriverProfile?.WithholdingRate ?? 0.10m;
            var deduction = Math.Min(totalPenalties, tx.DriverShare * rate);
            tx.PenaltyDeducted = Math.Round(deduction, 2);
            tx.DriverShare -= tx.PenaltyDeducted;
        }

        tx.Status = PaymentStatus.Captured;
        tx.CapturedAt = DateTimeOffset.UtcNow;

        await _txRepo.UpdateAsync(tx, ct);

        // Mettre à jour les balances du conducteur
        await UpdateDriverBalancesOnCapture(tx, ct);

        _logger.LogInformation("Transaction capturée: {TxId}, conducteur reçoit {Share}$", tx.Id, tx.DriverShare);
        return MapTxToResponse(tx);
    }

    public async Task<TransactionResponseDto> RefundAsync(Guid transactionId, string reason, CancellationToken ct = default)
    {
        var tx = await _txRepo.GetByIdAsync(transactionId, ct)
            ?? throw new KeyNotFoundException("Transaction introuvable");

        if (tx.Status is not (PaymentStatus.PreAuthorized or PaymentStatus.Captured))
            throw new InvalidOperationException("Cette transaction ne peut pas être remboursée");

        tx.Status = tx.Amount == tx.Amount
            ? PaymentStatus.RefundedFull
            : PaymentStatus.RefundedPartial;
        tx.RefundedAt = DateTimeOffset.UtcNow;

        await _txRepo.UpdateAsync(tx, ct);
        _logger.LogInformation("Remboursement: {TxId}, raison: {Reason}", tx.Id, reason);
        return MapTxToResponse(tx);
    }

    // ── Pénalités ────────────────────────────────────────────────────────────

    public async Task<IEnumerable<PenaltyResponseDto>> GetPenaltiesAsync(Guid userId, CancellationToken ct = default)
    {
        var penalties = await _penaltyRepo.GetByUserIdAsync(userId, ct);
        return penalties.Select(MapPenaltyToResponse);
    }

    public async Task<PenaltyResponseDto> ContestPenaltyAsync(Guid penaltyId, Guid userId, string reason, CancellationToken ct = default)
    {
        var penalty = await _penaltyRepo.GetByIdAsync(penaltyId, ct)
            ?? throw new KeyNotFoundException("Pénalité introuvable");

        if (penalty.UserId != userId)
            throw new UnauthorizedAccessException("Cette pénalité ne vous concerne pas");

        if (penalty.Status != PenaltyStatus.Active)
            throw new InvalidOperationException("Seule une pénalité active peut être contestée");

        if (DateTimeOffset.UtcNow > penalty.ContestDeadline)
            throw new InvalidOperationException("Le délai de contestation est expiré");

        penalty.Status = PenaltyStatus.Contested;
        penalty.ContestReason = reason;

        await _penaltyRepo.UpdateAsync(penalty, ct);
        _logger.LogInformation("Pénalité contestée: {PenaltyId}, raison: {Reason}", penaltyId, reason);
        return MapPenaltyToResponse(penalty);
    }

    // ── Retraits ─────────────────────────────────────────────────────────────

    public async Task<WithdrawalResponseDto> RequestWithdrawalAsync(Guid userId, decimal amount, CancellationToken ct = default)
    {
        if (amount < RETRAIT_MIN)
            throw new ArgumentException($"Le montant minimum de retrait est {RETRAIT_MIN}$");

        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        var profile = user.DriverProfile
            ?? throw new InvalidOperationException("Pas de profil conducteur");

        if (profile.BalanceAvailable < amount)
            throw new InvalidOperationException("Solde insuffisant");

        // Vérifier qu'il n'y a pas de retrait en cours
        var pending = await _withdrawalRepo.GetPendingAsync(profile.Id, ct);
        if (pending != null)
            throw new InvalidOperationException("Un retrait est déjà en cours de traitement");

        var withdrawal = new Withdrawal
        {
            Id = Guid.NewGuid(),
            DriverProfileId = profile.Id,
            Amount = amount,
            Status = "Pending",
            RequestedAt = DateTimeOffset.UtcNow
        };

        // Déduire du solde disponible immédiatement
        profile.BalanceAvailable -= amount;
        // On devrait sauvegarder le user/profile ici — sera géré par le contexte EF

        await _withdrawalRepo.AddAsync(withdrawal, ct);
        _logger.LogInformation("Retrait demandé: {WId}, montant: {Amount}$, conducteur: {UserId}", withdrawal.Id, amount, userId);
        return MapWithdrawalToResponse(withdrawal);
    }

    public async Task<IEnumerable<WithdrawalResponseDto>> GetWithdrawalsAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetWithProfileAsync(userId, ct)
            ?? throw new KeyNotFoundException("Utilisateur introuvable");

        if (user.DriverProfile == null)
            return Enumerable.Empty<WithdrawalResponseDto>();

        var withdrawals = await _withdrawalRepo.GetByDriverProfileIdAsync(user.DriverProfile.Id, ct);
        return withdrawals.Select(MapWithdrawalToResponse);
    }

    // ── Helpers privés ───────────────────────────────────────────────────────

    private async Task UpdateDriverBalancesOnCapture(Transaction tx, CancellationToken ct)
    {
        var user = await _userRepo.GetWithProfileAsync(tx.DriverId, ct);
        if (user?.DriverProfile == null) return;

        var profile = user.DriverProfile;
        profile.BalanceAvailable += tx.DriverShare;
        profile.BalancePending = Math.Max(0, profile.BalancePending - tx.Amount);
        if (tx.PenaltyDeducted > 0)
            profile.BalancePenalties = Math.Max(0, profile.BalancePenalties - tx.PenaltyDeducted);

        // Le SaveChanges sera fait au prochain appel UpdateAsync ou par le middleware
    }

    private static DateTimeOffset GetStartOfWeek()
    {
        var now = DateTimeOffset.UtcNow;
        var diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
        return now.AddDays(-diff).Date;
    }

    private static TransactionResponseDto MapTxToResponse(Transaction tx) => new()
    {
        Id = tx.Id,
        ReservationId = tx.ReservationId,
        PassengerId = tx.PassengerId,
        DriverId = tx.DriverId,
        Amount = tx.Amount,
        DriverShare = tx.DriverShare,
        PlatformShare = tx.PlatformShare,
        PenaltyDeducted = tx.PenaltyDeducted,
        PaymentMethod = tx.PaymentMethod.ToString(),
        Status = tx.Status.ToString(),
        ExternalReference = tx.ExternalReference,
        PreAuthorizedAt = tx.PreAuthorizedAt,
        CapturedAt = tx.CapturedAt,
        RefundedAt = tx.RefundedAt,
        CreatedAt = tx.CreatedAt
    };

    private static PenaltyResponseDto MapPenaltyToResponse(Penalty p) => new()
    {
        Id = p.Id,
        UserId = p.UserId,
        TripId = p.TripId,
        ReservationId = p.ReservationId,
        Type = p.Type.ToString(),
        Amount = p.Amount,
        Status = p.Status.ToString(),
        ContestDeadline = p.ContestDeadline,
        ContestReason = p.ContestReason,
        AdminDecision = p.AdminDecision,
        GoScoreImpact = p.GoScoreImpact,
        TriggerReason = p.TriggerReason,
        CreatedAt = p.CreatedAt
    };

    private static WithdrawalResponseDto MapWithdrawalToResponse(Withdrawal w) => new()
    {
        Id = w.Id,
        DriverProfileId = w.DriverProfileId,
        Amount = w.Amount,
        Status = w.Status,
        ExternalReference = w.ExternalReference,
        RejectionReason = w.RejectionReason,
        RequestedAt = w.RequestedAt,
        ProcessedAt = w.ProcessedAt,
        CompletedAt = w.CompletedAt
    };
}
