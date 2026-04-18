using Covoiturage_la_cite__App_Mobile_.Features.profile.DisplayModels;
using Microsoft.Maui.Controls;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Views.PublicProfile;

public partial class ProfileStatsSectionView : ContentView
{
    public ProfileStatsSectionView()
    {
        Content = new Label { Text = "Statistiques — à implémenter", TextColor = Color.FromArgb("#7A879A"), Margin = new Thickness(16) };
    }
}

public partial class ProfileReviewsSectionView : ContentView
{
    public ProfileReviewsSectionView()
    {
        Content = new Label { Text = "Avis — à implémenter", TextColor = Color.FromArgb("#7A879A"), Margin = new Thickness(16) };
    }
}

public partial class ProfilePublishedTripsSectionView : ContentView
{
    public ProfilePublishedTripsSectionView()
    {
        Content = new Label { Text = "Trajets publiés — à implémenter", TextColor = Color.FromArgb("#7A879A"), Margin = new Thickness(16) };
    }
}

public partial class ProfileRecurringTripsSectionView : ContentView
{
    public ProfileRecurringTripsSectionView()
    {
        Content = new Label { Text = "Trajets habituels — à implémenter", TextColor = Color.FromArgb("#7A879A"), Margin = new Thickness(16) };
    }
}
