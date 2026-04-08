using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.MediaLogRepository
{
    public class MediaLogRepository : IMediaLogRepository
    {
        private readonly AppDbContext _context;

        public MediaLogRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MediaLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.MediaLogs
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
        }

        public async Task<List<MediaLog>> GetByMediaIdAsync(Guid mediaId, CancellationToken cancellationToken = default)
        {
            return await _context.MediaLogs
                .AsNoTracking()
                .Where(l => l.MediaId == mediaId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<MediaLog>> GetBySectorAsync(string sector, int limit = 100, CancellationToken cancellationToken = default)
        {
            return await _context.MediaLogs
                .AsNoTracking()
                .Where(l => l.Sector == sector)
                .OrderByDescending(l => l.CreatedAt)
                .Take(limit)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<MediaLog>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.MediaLogs
                .AsNoTracking()
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<MediaLog> AddAsync(MediaLog log, CancellationToken cancellationToken = default)
        {
            log.CreatedAt = DateTimeOffset.UtcNow;

            await _context.MediaLogs.AddAsync(log, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return log;
        }

        public async Task<int> AddRangeAsync(IEnumerable<MediaLog> logs, CancellationToken cancellationToken = default)
        {
            foreach (var log in logs)
            {
                log.CreatedAt = DateTimeOffset.UtcNow;
            }

            await _context.MediaLogs.AddRangeAsync(logs, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return logs.Count();
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var log = await GetByIdAsync(id, cancellationToken);
            if (log == null)
                return false;

            _context.MediaLogs.Remove(log);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<int> DeleteByMediaIdAsync(Guid mediaId, CancellationToken cancellationToken = default)
        {
            var logs = await _context.MediaLogs
                .Where(l => l.MediaId == mediaId)
                .ToListAsync(cancellationToken);

            _context.MediaLogs.RemoveRange(logs);
            await _context.SaveChangesAsync(cancellationToken);

            return logs.Count;
        }

        public async Task<int> DeleteOlderThanAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default)
        {
            var oldLogs = await _context.MediaLogs
                .Where(l => l.CreatedAt < olderThan)
                .ToListAsync(cancellationToken);

            _context.MediaLogs.RemoveRange(oldLogs);
            await _context.SaveChangesAsync(cancellationToken);

            return oldLogs.Count;
        }

        public async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.MediaLogs.CountAsync(cancellationToken);
        }
    }
}
