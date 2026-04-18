
using Covoiturage_la_cite__App_Mobile_.Features.customshell.views.components;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.profilpage.view
{
public partial class ProfilPage : ContentView, IPageLifecycle
{
    public ProfilPage() => InitializeComponent();

    public void OnNavigatedTo()
        => MainThread.BeginInvokeOnMainThread(async () =>
            await Shell.Current.GoToAsync("profileSettings"));

    public void OnNavigatedFrom() { }
}
}
