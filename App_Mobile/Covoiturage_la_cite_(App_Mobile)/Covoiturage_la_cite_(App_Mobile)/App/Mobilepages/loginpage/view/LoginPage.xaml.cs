using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.DisplayController;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.view
{
    public partial class LoginPage : ContentPage
    {
        public LoginPage(LoginPageDisplayController controller)
        {
            InitializeComponent();
            BindingContext = controller;
        }
    }
}
