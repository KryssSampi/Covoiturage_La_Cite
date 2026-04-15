// Features/finances/Services/FinancesService.cs

using Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.finances.Services
{
    public interface IFinancesService
    {
        IReadOnlyList<RevenueBarDisplayModel> NormalizeBars(
            IReadOnlyList<RevenueBarDisplayModel> bars);
    }

    public class FinancesService : IFinancesService
    {
        public IReadOnlyList<RevenueBarDisplayModel> NormalizeBars(
            IReadOnlyList<RevenueBarDisplayModel> bars)
        {
            var maxAmount = bars.Where(b => !b.IsNegative).Max(b => b.Amount);
            if (maxAmount <= 0) return bars;
            return bars.Select(b => b with
            {
                HeightRatio = b.IsNegative ? 0.15 : (double)(b.Amount / maxAmount),
            }).ToList();
        }
    }
}
