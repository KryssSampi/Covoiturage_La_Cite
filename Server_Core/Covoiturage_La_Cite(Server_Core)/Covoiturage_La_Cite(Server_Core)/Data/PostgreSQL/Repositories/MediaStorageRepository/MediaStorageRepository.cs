
using global::Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using global::Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.MediaStorageRepository
{
    public class MediaStorageRepository : IMediaStorageRepository
    {
        private readonly AppDbContext _context;

        public MediaStorageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MediaStorage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _context.MediaStorages
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        }

        public async Task<List<MediaStorage>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.MediaStorages
                .AsNoTracking()
                .OrderByDescending(m => m.UploadedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<MediaStorage>> QueryAsync(
            string? sector = null,
            string? mediaType = null,
            string? ownerId = null,
            string? ownerType = null,
            string? archiveStatus = null,
            string? uploadedBy = null,
            DateTimeOffset? dateFrom = null,
            DateTimeOffset? dateTo = null,
            string? search = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.MediaStorages.AsQueryable();

            if (!string.IsNullOrWhiteSpace(sector))
                query = query.Where(m => m.Sector == sector);

            if (!string.IsNullOrWhiteSpace(mediaType))
                query = query.Where(m => m.MediaType == mediaType);

            if (!string.IsNullOrWhiteSpace(ownerId))
                query = query.Where(m => m.OwnerId == ownerId);

            if (!string.IsNullOrWhiteSpace(ownerType))
                query = query.Where(m => m.OwnerType == ownerType);

            if (!string.IsNullOrWhiteSpace(archiveStatus))
                query = query.Where(m => m.ArchiveStatus == archiveStatus);

            if (!string.IsNullOrWhiteSpace(uploadedBy))
                query = query.Where(m => m.UploadedBy == uploadedBy);

            if (dateFrom.HasValue)
                query = query.Where(m => m.UploadedAt >= dateFrom.Value);

            if (dateTo.HasValue)
                query = query.Where(m => m.UploadedAt <= dateTo.Value);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(m => m.OriginalFileName.Contains(search));

            return await query
                .AsNoTracking()
                .OrderByDescending(m => m.UploadedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<MediaStorage> AddAsync(MediaStorage media, CancellationToken cancellationToken = default)
        {
            media.CreatedAt = DateTimeOffset.UtcNow;
            media.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.MediaStorages.AddAsync(media, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return media;
        }

        public async Task<MediaStorage> UpdateAsync(MediaStorage media, CancellationToken cancellationToken = default)
        {
            media.UpdatedAt = DateTimeOffset.UtcNow;

            _context.MediaStorages.Update(media);
            await _context.SaveChangesAsync(cancellationToken);

            return media;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var media = await GetByIdAsync(id, cancellationToken);
            if (media == null)
                return false;

            _context.MediaStorages.Remove(media);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            return await _context.MediaStorages.CountAsync(cancellationToken);
        }

        public async Task<int> ArchiveOldMediaAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default)
        {
            var mediaToArchive = await _context.MediaStorages
                .Where(m => m.ArchiveStatus == "Active" && m.UploadedAt < olderThan)
                .ToListAsync(cancellationToken);

            foreach (var media in mediaToArchive)
            {
                media.ArchiveStatus = "Archived";
                media.ArchivedAt = DateTimeOffset.UtcNow;
                media.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return mediaToArchive.Count;
        }

        public async Task<int> DeletePermanentlyAsync(DateTimeOffset olderThan, CancellationToken cancellationToken = default)
        {
            var mediaToDelete = await _context.MediaStorages
                .Where(m => m.ArchiveStatus == "Deleted" && m.UpdatedAt < olderThan)
                .ToListAsync(cancellationToken);

            _context.MediaStorages.RemoveRange(mediaToDelete);
            await _context.SaveChangesAsync(cancellationToken);

            return mediaToDelete.Count;
        }
    }
}
