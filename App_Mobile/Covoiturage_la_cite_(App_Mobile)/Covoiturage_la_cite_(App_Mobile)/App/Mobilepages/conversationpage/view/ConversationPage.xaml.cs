// ============================================================
//  App/Mobilepages/conversationpage/view/ConversationPage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.conversationpage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.conversationpage.view
{
    public partial class ConversationPage : ContentPage
    {
        private readonly ConversationPageDisplayController _controller;

        public ConversationPage(ConversationPageDisplayController controller)
        {
            InitializeComponent();
            _controller = controller;
            BindingContext = controller.PageModel;

            // Scroll en bas quand les messages se chargent
            controller.PageModel.PropertyChanged += async (_, e) =>
            {
                if (e.PropertyName == nameof(controller.PageModel.Messages))
                    await ScrollToBottomAsync();
            };
        }

        private void OnSendTapped(object sender, TappedEventArgs e) =>
            SendDraft();

        private void OnDraftEntryCompleted(object sender, EventArgs e) =>
            SendDraft();

        private void SendDraft()
        {
            if (_controller.SendCommand.CanExecute(null))
                _controller.SendCommand.Execute(null);
        }

        private async Task ScrollToBottomAsync()
        {
            await Task.Delay(100); // laisser le layout se mettre à jour
            await BubblesScroll.ScrollToAsync(BubblesStack, ScrollToPosition.End, animated: true);
        }
    }
}
