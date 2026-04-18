// ============================================================
//  App/Mobilepages/conversationpage/DisplayControler/
//  ConversationPageDisplayController.cs
//
//  Orchestre ConversationPage :
//   - Reçoit conversationId ou tripId via QueryProperty
//   - Charge la ConversationModel depuis les fixtures (→ TODO API)
//   - Convertit en ConversationDetailDisplayModel
// ============================================================

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayConverters;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Services.Api;
using Covoiturage_la_cite__App_Mobile_.Test.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.conversationpage.DisplayControler
{
    [QueryProperty(nameof(ConversationId), "conversationId")]
    [QueryProperty(nameof(TripId),         "tripId")]
    public class ConversationPageDisplayController : INotifyPropertyChanged
    {
        private readonly ConversationDetailDisplayModel _pageModel = new();
        private readonly IApiService _apiService;

        public ConversationDetailDisplayModel PageModel => _pageModel;

        public ICommand GoBackCommand { get; } =
            new Command(async () => await Shell.Current.GoToAsync(".."));

        public ICommand SendCommand { get; }

        public ConversationPageDisplayController(IApiService apiService)
        {
            _apiService = apiService;
            SendCommand = new Command(
                execute: async () =>
                {
                    if (!_pageModel.IsChatAvailable)
                    {
                        await Shell.Current.DisplayAlert("Information", "Le chat sera disponible 2h avant le départ.", "OK");
                        return;
                    }

                    // TODO : POST /api/messages { conversationId, content: DraftText }
                    _pageModel.DraftText = "";
                },
                canExecute: () => _pageModel.CanSend);

            _pageModel.PropertyChanged += (_, e) =>
            {
                if (e.PropertyName == nameof(ConversationDetailDisplayModel.CanSend))
                    (SendCommand as Command)?.ChangeCanExecute();
            };
        }

        private string? _conversationId;
        private string? _tripId;

        public string? ConversationId
        {
            get => _conversationId;
            set { _conversationId = Uri.UnescapeDataString(value ?? ""); TryLoad(); }
        }

        public string? TripId
        {
            get => _tripId;
            set { _tripId = Uri.UnescapeDataString(value ?? ""); TryLoad(); }
        }

        private bool _loadScheduled;
        private void TryLoad()
        {
            if (_loadScheduled) return;
            if (string.IsNullOrWhiteSpace(_conversationId) && string.IsNullOrWhiteSpace(_tripId)) return;
            _loadScheduled = true;
            _ = Task.Run(async () =>
            {
                await Task.Delay(50);
                await LoadAsync();
            });
        }

        private async Task LoadAsync()
        {
            _pageModel.IsLoading = true;
            try
            {
                // ── TODO : GET /api/conversations/{id} ──
                var conv = await Task.Run(() =>
                {
                    if (!string.IsNullOrWhiteSpace(_conversationId))
                        return ConversationFixtures.FindById(_conversationId);
                    if (!string.IsNullOrWhiteSpace(_tripId))
                        return ConversationFixtures.FindByTripId(_tripId);
                    return ConversationFixtures.All.FirstOrDefault();
                });

                if (conv is null) return;

                var tripAvailability = await ResolveChatAvailabilityAsync(conv);
                _pageModel.IsChatAvailable = tripAvailability;

                var detail = MessagingDisplayConverter.ToDetail(conv);
                _pageModel.TripRoute       = detail.TripRoute;
                _pageModel.TripDateStr     = detail.TripDateStr;
                _pageModel.OtherPersonName = detail.OtherPersonName;
                _pageModel.OtherPersonRole = detail.OtherPersonRole;
                _pageModel.Messages        = detail.Messages;
            }
            finally
            {
                _pageModel.IsLoading = false;
            }
        }

        private async Task<bool> ResolveChatAvailabilityAsync(Core.Models.ConversationModel conv)
        {
            if (!string.IsNullOrWhiteSpace(conv.TripId))
            {
                var endpoint = $"api/trips/{Uri.EscapeDataString(conv.TripId)}";
                var envelope = await _apiService.GetAsync<ApiEnvelope<TripChatApiDto>>(endpoint);
                var trip = envelope?.Data;
                if (trip?.DepartureDateTime is DateTime departureDateTime)
                {
                    var departure = departureDateTime;
                    return (departure - DateTime.UtcNow).TotalHours <= 2 || trip.IsActive;
                }
            }

            // Fallback fixtures/local state
            if (DateTime.TryParse($"{conv.TripDate} {conv.TripTime}", out var parsedDeparture))
            {
                return (parsedDeparture.ToUniversalTime() - DateTime.UtcNow).TotalHours <= 2;
            }

            return false;
        }

        private sealed record ApiEnvelope<T>(bool Success, T? Data, string? Message, string[]? Errors);
        private sealed record TripChatApiDto(DateTime? DepartureDateTime, bool IsActive);

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
