using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Covoiturage_la_cite__App_Mobile_.Services.Auth;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.otppage.DisplayControler;

public partial class OtpPageDisplayControler : ObservableObject
{
    private readonly IAuthService _authService;
    private System.Timers.Timer? _timer;
    private int _remainingSeconds = 300; // 5 minutes

    [ObservableProperty] private string email = string.Empty;
    [ObservableProperty] private string otpCode = string.Empty;
    [ObservableProperty] private string timerText = "05:00";
    [ObservableProperty] private string errorMessage = string.Empty;
    [ObservableProperty] private bool hasError;
    [ObservableProperty] private bool isLoading;
    [ObservableProperty] private bool canResend = false;

    public OtpPageDisplayControler(IAuthService authService)
    {
        _authService = authService;
        StartTimer();
    }

    [RelayCommand]
    private async Task VerifyOtpAsync()
    {
        if (OtpCode.Length != 5)
        {
            ErrorMessage = "Le code doit faire 5 chiffres";
            HasError = true;
            return;
        }

        try
        {
            ErrorMessage = string.Empty;
            HasError = false;
            IsLoading = true;

            var result = await _authService.VerifyOtpAsync(Email, OtpCode);

            if (!result.Success)
            {
                ErrorMessage = result.Error ?? "Code invalide. Réessayez.";
                HasError = true;
                return;
            }

            await Shell.Current.GoToAsync("//Main");
        }
        catch (Exception)
        {
            ErrorMessage = "Code invalide. Réessayez.";
            HasError = true;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task ResendOtpAsync()
    {
        try
        {
            IsLoading = true;
            await _authService.SendOtpAsync(Email);
            StartTimer();
            ErrorMessage = string.Empty;
            HasError = false;
            OtpCode = string.Empty;
        }
        catch (Exception)
        {
            ErrorMessage = "Erreur lors du renvoi. Réessayez.";
            HasError = true;
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void StartTimer()
    {
        _remainingSeconds = 300;
        UpdateTimerText();
        _timer?.Stop();
        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += (s, e) =>
        {
            _remainingSeconds--;
            MainThread.BeginInvokeOnMainThread(() =>
            {
                UpdateTimerText();
                if (_remainingSeconds <= 0)
                {
                    CanResend = true;
                    _timer?.Stop();
                }
            });
        };
        _timer.Start();
    }

    private void UpdateTimerText()
    {
        var minutes = _remainingSeconds / 60;
        var seconds = _remainingSeconds % 60;
        TimerText = $"{minutes:00}:{seconds:00}";
    }

    public void SetEmail(string email)
    {
        Email = email;
    }
}
