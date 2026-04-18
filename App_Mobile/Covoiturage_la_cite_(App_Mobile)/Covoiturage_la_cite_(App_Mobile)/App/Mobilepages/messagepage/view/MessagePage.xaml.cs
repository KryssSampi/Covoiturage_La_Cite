// ============================================================
//  App/Mobilepages/messagepage/view/MessagePage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.messagepage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Features.messaging.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.messagepage.view
{
public partial class MessagePage : ContentView
{
    private readonly MessagePageDisplayController _controller;

    public MessagePage(MessagePageDisplayController controller)
    {
        InitializeComponent();
        _controller = controller;
        BindingContext = _controller;
        MsgList.SetController(_controller.ListController);
    }

    private async void OnConversationCardTapped(object sender, TappedEventArgs e)
    {
        if (sender is VisualElement ve && ve.BindingContext is ConversationCardDisplayModel card)
        {
            _controller.HandleCardTap(card);
        }
    }
}
}

