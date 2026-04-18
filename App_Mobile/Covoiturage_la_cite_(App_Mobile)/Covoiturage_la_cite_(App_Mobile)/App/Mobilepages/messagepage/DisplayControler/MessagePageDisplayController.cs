using Covoiturage_la_cite__App_Mobile_.Core.Interfaces;
using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.messagepage.DisplayControler
{
    public class MessagePageDisplayController : ICoreListPageNeeds
    {
        public UserViewModel UserViewModel { get; }

        public ItemListController<ConversationCardDisplayModel> ListController { get; }

public MessagePageDisplayController(UserViewModel userViewModel)
        {
            UserViewModel = userViewModel;

            bool canBeDriver = userViewModel.Role == UserRole.Driver;
            _listCtrl = new MessagingListDisplayController(canBeDriver);
            _listCtrl.OnCardTap = card => NavigateToConversation(card);
            ListController = _listCtrl.ListController;
        }

        private readonly MessagingListDisplayController _listCtrl;

        private async void NavigateToConversation(ConversationCardDisplayModel card)
        {
            var convId = Uri.EscapeDataString(card.Id); // fallback to Id
            await Shell.Current.GoToAsync($"conversation?conversationId={convId}");
        }

        public void HandleCardTap(ConversationCardDisplayModel card) => _listCtrl.HandleCardTap(card);
    }
}

