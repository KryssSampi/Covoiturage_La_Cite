using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.view;

public partial class LoginPage : ContentPage
{
    public LoginPage(LoginPageDisplayControler controller)
    {
        InitializeComponent();
        BindingContext = controller;
    }
}
