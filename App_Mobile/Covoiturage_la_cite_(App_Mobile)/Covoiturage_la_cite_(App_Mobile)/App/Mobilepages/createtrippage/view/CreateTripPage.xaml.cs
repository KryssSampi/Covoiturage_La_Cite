// ============================================================
//  App/Mobilepages/createtrippage/view/CreateTripPage.xaml.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.createtrippage.view
{
    public partial class CreateTripPage : ContentPage
    {
        public CreateTripPage(CreateTripPageDisplayController controller)
        {
            InitializeComponent();
            BindingContext = controller.PageModel;
        }

        private void OnTripTypeUniqueChanged(object sender, CheckedChangedEventArgs e)
        {
            if (e.Value && BindingContext is CreateTripPageDisplayModel m)
                m.SetTripTypeUniqueCommand?.Execute(null);
        }

        private void OnTripTypeRecurrentChanged(object sender, CheckedChangedEventArgs e)
        {
            if (e.Value && BindingContext is CreateTripPageDisplayModel m)
                m.SetTripTypeRecurrentCommand?.Execute(null);
        }
    }
}
