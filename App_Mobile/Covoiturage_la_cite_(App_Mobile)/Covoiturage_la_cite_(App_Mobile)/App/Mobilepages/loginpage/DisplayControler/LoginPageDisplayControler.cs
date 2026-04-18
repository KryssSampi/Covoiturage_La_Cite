using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Covoiturage_la_cite__App_Mobile_.Services.Auth;
using Microsoft.Maui.Controls;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.loginpage.DisplayControler;

public partial class LoginPageDisplayControler : ObservableObject
{
    private readonly IAuthService _authService;

    [ObservableProperty] private string email = string.Empty;
    [ObservableProperty] private string errorMessage = string.Empty;
    [ObservableProperty] private bool hasError;
    [ObservableProperty] private bool isLoading;

    public LoginPageDisplayControler(IAuthService authService)
    {
        _authService = authService;
    }

    [RelayCommand]
    private async Task SendOtpAsync()
    {
        try
        {
            ErrorMessage = string.Empty;
            HasError = false;
            IsLoading = true;

            if (string.IsNullOrWhiteSpace(Email) || !IsValidEmail(Email))
            {
                ErrorMessage = "Veuillez entrer une adresse email valide (@collegelacite.ca ou @lacitec.on.ca)";
                HasError = true;
                return;
            }

            await _authService.SendOtpAsync(Email);

            await Shell.Current.GoToAsync($"otp?email={Uri.EscapeDataString(Email)}");
        }
        catch (Exception ex)
        {
            ErrorMessage = "Erreur lors de l'envoi du code. Réessayez.";
            HasError = true;
        }
        finally
        {
            IsLoading = false;
        }
    }

    private static bool IsValidEmail(string email)
    {
        return System.Text.RegularExpressions.Regex.IsMatch(email, @"@(?:collegelacite\.ca|lacitec\.on\.ca)$", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }
}
