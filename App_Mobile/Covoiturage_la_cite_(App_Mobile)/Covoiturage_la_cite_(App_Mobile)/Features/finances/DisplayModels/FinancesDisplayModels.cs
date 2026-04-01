// Features/finances/DisplayModels/FinancesDisplayModels.cs

namespace Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayModels
{
    public record BalanceHeroDisplayModel(
        decimal AvailableBalance,
        decimal PendingBalance,
        decimal PenaltyBalance,
        string  IbanMasked,
        bool    CanWithdraw
    );

    public enum FinancePeriod { SevenDays, CurrentMonth, ThreeMonths, All }

    public record FinanceResumeDisplayModel(
        decimal MonthlyGain,
        decimal WeeklyGain,
        string  WeekLabel,
        decimal Commission,
        decimal CommissionPct,
        int     PaidTrips,
        int     TotalTrips,
        decimal GrossRevenue,
        decimal NetRevenue,
        decimal MonthlyGoal,
        double  GrossPercent,
        double  NetPercent,
        double  GoalPercent,
        string  InsightText
    );

    public record RevenueBarDisplayModel(
        string  PeriodLabel,
        decimal Amount,
        double  HeightRatio,
        bool    IsNegative
    );

    public record RevenueChartDisplayModel(
        IReadOnlyList<RevenueBarDisplayModel> Bars,
        string                                InsightText
    );

    public enum TransactionType { Credit, Debit, Penalty }

    public record TransactionDisplayModel(
        string          Label,
        string          DateLabel,
        decimal         Amount,
        TransactionType Type
    );

    public record TransactionListDisplayModel(
        IReadOnlyList<TransactionDisplayModel> Transactions
    );
}
