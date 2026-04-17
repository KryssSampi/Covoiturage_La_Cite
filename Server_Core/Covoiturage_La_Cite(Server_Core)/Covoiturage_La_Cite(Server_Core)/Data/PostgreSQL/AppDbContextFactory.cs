using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=design_time_dummy;Username=postgres;Password=postgres",
                o => o.UseNetTopologySuite())
            .Options;
        return new AppDbContext(options);
    }
}
