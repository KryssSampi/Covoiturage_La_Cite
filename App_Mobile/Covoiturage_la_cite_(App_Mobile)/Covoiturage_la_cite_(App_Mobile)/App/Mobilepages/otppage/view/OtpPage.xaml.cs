using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.DisplayController;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.view
{
    [QueryProperty(nameof(Phone), "phone")]
    public partial class OtpPage : ContentPage
    {
        private readonly OtpPageDisplayController _controller;

        public string Phone
        {
            set => _controller.PhoneNumber = Uri.UnescapeDataString(value ?? "");
        }

        public OtpPage(OtpPageDisplayController controller)
        {
            InitializeComponent();
            _controller = controller;
            BindingContext = controller;
        }
    }
}
