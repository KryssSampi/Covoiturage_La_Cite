// ============================================================
//  App/Mobilepages/messagepage/view/MessagePage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.messagepage.view
{
    public partial class MessagePage : ContentView
    {
        private readonly UserViewModel _userViewModel;
        private MessagingListDisplayController? _listController;
        private bool _isLoaded;

        public MessagePage(UserViewModel userViewModel)
        {
            InitializeComponent();
            _userViewModel = userViewModel;
            Loaded += OnLoaded;
        }

        // ─────────────────────────────────────────────────────────────
        //  Chargement différé — libère le UI thread au démarrage
        // ─────────────────────────────────────────────────────────────
        private void OnLoaded(object? sender, EventArgs e)
        {
            if (_isLoaded) return;
            _isLoaded = true;

            var canBeDriver = _userViewModel.Role == UserRole.Driver;
            _listController = new MessagingListDisplayController(canBeDriver);

            // Navigation : tap sur une carte → conversation detail
            _listController.OnCardTap = async card =>
            {
                var id = Uri.EscapeDataString(card.Id);
                await Shell.Current.GoToAsync($"conversation?conversationId={id}");
            };

            MsgList.SetController(_listController.ListController);
        }

        private void OnConversationCardTapped(object sender, TappedEventArgs e)
        {
            if (_listController is null) return;
            if (sender is VisualElement ve && ve.BindingContext is ConversationCardDisplayModel card)
                _listController.HandleCardTap(card);
        }
    }
}
