using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;
using Covoiturage_la_cite__App_Mobile_.Services.Auth;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.DisplayController
{
    public class OtpPageDisplayController : INotifyPropertyChanged
    {
        private readonly IAuthService _auth;
        private readonly UserViewModel _userVm;

        private string _phoneNumber = "";
        private string _otpCode = "";
        private string _errorMessage = "";
        private bool _isLoading;

        public string PhoneNumber
        {
            get => _phoneNumber;
            set { _phoneNumber = value; OnPropertyChanged(); OnPropertyChanged(nameof(SubtitleText)); }
        }

        public string OtpCode
        {
            get => _otpCode;
            set
            {
                _otpCode = value;
                OnPropertyChanged();
                // Auto-verify when 6 digits entered
                if (value.Length == 6) _ = VerifyOtpAsync();
            }
        }

        public string SubtitleText =>
            string.IsNullOrEmpty(PhoneNumber)
                ? "Saisissez le code reçu par SMS."
                : $"Code envoyé au {PhoneNumber}. Saisissez-le ci-dessous.";

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

        public ICommand VerifyOtpCommand { get; }
        public ICommand ResendOtpCommand { get; }
        public ICommand GoBackCommand { get; }

        public OtpPageDisplayController(IAuthService auth, UserViewModel userVm)
        {
            _auth = auth;
            _userVm = userVm;
            VerifyOtpCommand = new Command(async () => await VerifyOtpAsync(), () => !IsLoading);
            ResendOtpCommand = new Command(async () => await ResendOtpAsync());
            GoBackCommand = new Command(async () => await Shell.Current.GoToAsync(".."));
        }

        private async Task VerifyOtpAsync()
        {
            if (OtpCode.Length != 6)
            {
                ErrorMessage = "Le code doit contenir 6 chiffres.";
                return;
            }

            IsLoading = true;
            ErrorMessage = "";

            try
            {
                var result = await _auth.VerifyOtpAsync(PhoneNumber, OtpCode);
                if (result.Success)
                {
                    // Load user profile
                    await _userVm.LoadFromServerAsync(result.UserId!);
                    // Navigate to main app
                    await Shell.Current.GoToAsync("//mainpage");
                }
                else
                {
                    ErrorMessage = result.Error ?? "Code incorrect. Réessayez.";
                    OtpCode = "";
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

        private async Task ResendOtpAsync()
        {
            if (string.IsNullOrEmpty(PhoneNumber)) return;
            var sent = await _auth.SendOtpAsync(PhoneNumber);
            ErrorMessage = sent ? "" : "Impossible de renvoyer le code.";
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
