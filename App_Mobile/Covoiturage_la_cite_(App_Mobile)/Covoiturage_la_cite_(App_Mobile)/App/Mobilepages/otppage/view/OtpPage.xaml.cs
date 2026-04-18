using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.view;

[QueryProperty(nameof(EmailParam), "email")]
public partial class OtpPage : ContentPage
{
    private readonly OtpPageDisplayControler _controller;

    public string EmailParam
    {
        set => _controller.SetEmail(Uri.UnescapeDataString(value ?? ""));
    }

    public OtpPage(OtpPageDisplayControler controller)
    {
        InitializeComponent();
        _controller = controller;
        BindingContext = _controller;
    }
}
