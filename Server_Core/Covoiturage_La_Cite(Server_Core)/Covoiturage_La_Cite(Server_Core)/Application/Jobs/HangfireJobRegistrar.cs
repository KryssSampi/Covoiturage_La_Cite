using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Application.Jobs;

/// <summary>
/// Interface marker pour l'enregistrement des jobs récurrents.
/// </summary>
public interface IHangfireJobRegistrar
{
    void RegisterAll();
}

/// <summary>
/// Enregistre tous les jobs Hangfire récurrents au démarrage.
/// </summary>
public class HangfireJobRegistrar : IHangfireJobRegistrar
{
    public void RegisterAll()
    {
        // ── Chaque minute ────────────────────────────────────────────────
        RecurringJob.AddOrUpdate<TripAutoStartJob>("trip-auto-start", j => j.ExecuteAsync(), Cron.Minutely);
        RecurringJob.AddOrUpdate<ReservationExpiryJob>("reservation-expiry", j => j.ExecuteAsync(), Cron.Minutely);

        // ── Toutes les 5 minutes ─────────────────────────────────────────
        RecurringJob.AddOrUpdate<EtaRecalculationJob>("eta-recalculation", j => j.ExecuteAsync(), "*/5 * * * *");
        RecurringJob.AddOrUpdate<SosEscalationJob>("sos-escalation", j => j.ExecuteAsync(), "*/5 * * * *");

        // ── Toutes les 15 minutes ────────────────────────────────────────
        RecurringJob.AddOrUpdate<GpsCleanupJob>("gps-cleanup", j => j.ExecuteAsync(), "*/15 * * * *");
        RecurringJob.AddOrUpdate<TripAutoCompleteJob>("trip-auto-complete", j => j.ExecuteAsync(), "*/15 * * * *");

        // ── Toutes les heures ────────────────────────────────────────────
        RecurringJob.AddOrUpdate<PenaltyExpiryJob>("penalty-expiry", j => j.ExecuteAsync(), Cron.Hourly);
        RecurringJob.AddOrUpdate<PlatformStatsJob>("platform-stats", j => j.ExecuteAsync(), Cron.Hourly);
        RecurringJob.AddOrUpdate<AnomalyDetectionJob>("anomaly-detection", j => j.ExecuteAsync(), Cron.Hourly);

        // ── Quotidien (2h du matin) ──────────────────────────────────────
        RecurringJob.AddOrUpdate<GoScoreRecalcJob>("goscore-recalc", j => j.ExecuteAsync(), "0 2 * * *");
        RecurringJob.AddOrUpdate<InactiveUserReminderJob>("inactive-user-reminder", j => j.ExecuteAsync(), "0 3 * * *");
        RecurringJob.AddOrUpdate<AccountLifecycleJob>("account-lifecycle", j => j.ExecuteAsync(), "0 4 * * *");
        RecurringJob.AddOrUpdate<ChallengeProgressCheckJob>("challenge-progress-check", j => j.ExecuteAsync(), "0 4 * * *");
        RecurringJob.AddOrUpdate<WithdrawalProcessingJob>("withdrawal-processing", j => j.ExecuteAsync(), "0 6 * * *");

        // ── Hebdomadaire (lundi 1h) ──────────────────────────────────────
        RecurringJob.AddOrUpdate<WeeklyReportJob>("weekly-report", j => j.ExecuteAsync(), "0 1 * * 1");
        RecurringJob.AddOrUpdate<BadgeAwardCheckJob>("badge-award-check", j => j.ExecuteAsync(), "0 5 * * 1");
    }
}
