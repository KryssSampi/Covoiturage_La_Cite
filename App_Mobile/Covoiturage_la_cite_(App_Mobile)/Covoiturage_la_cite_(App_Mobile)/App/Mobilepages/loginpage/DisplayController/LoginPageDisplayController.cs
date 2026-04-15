using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Services.Auth;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.DisplayController
{
    public class LoginPageDisplayController : INotifyPropertyChanged
    {
        private readonly IAuthService _auth;

        private string _phoneNumber = "";
        private string _errorMessage = "";
        private bool _isLoading;

        public string PhoneNumber
        {
            get => _phoneNumber;
            set { _phoneNumber = value; OnPropertyChanged(); OnPropertyChanged(nameof(IsNotLoading)); }
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set { _errorMessage = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasError)); }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); OnPropertyChanged(nameof(IsNotLoading)); }
        }

        public bool IsNotLoading => !_isLoading;
        public bool HasError => !string.IsNullOrEmpty(_errorMessage);

        public ICommand SendOtpCommand { get; }

        public LoginPageDisplayController(IAuthService auth)
        {
            _auth = auth;
            SendOtpCommand = new Command(async () => await SendOtpAsync(),
                () => !string.IsNullOrWhiteSpace(PhoneNumber) && !IsLoading);
        }

        private async Task SendOtpAsync()
        {
            if (string.IsNullOrWhiteSpace(PhoneNumber))
            {
                ErrorMessage = "Veuillez saisir votre numéro de téléphone.";
                return;
            }

            IsLoading = true;
            ErrorMessage = "";

            try
            {
                var sent = await _auth.SendOtpAsync(PhoneNumber.Trim());
                if (sent)
                {
                    await Shell.Current.GoToAsync($"otp?phone={Uri.EscapeDataString(PhoneNumber.Trim())}");
                }
                else
                {
                    ErrorMessage = "Impossible d'envoyer le code. Vérifiez votre numéro.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Erreur : {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
