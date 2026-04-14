namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Media;

using Covoiturage_La_Cite_Server_Core_.Application.DTOs.Media;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Media
{
    public class MediaStorageService : IMediaStorageService
    {
        private readonly IMediaStorageRepository _mediaRepository;
        private readonly IMediaLogRepository _logRepository;
        private readonly ILogger<MediaStorageService> _logger;

        public MediaStorageService(
            IMediaStorageRepository mediaRepository,
            IMediaLogRepository logRepository,
            ILogger<MediaStorageService> logger)
        {
            _mediaRepository = mediaRepository;
            _logRepository = logRepository;
            _logger = logger;
        }

        // Parent full implementation archived for safekeeping
    }
}
