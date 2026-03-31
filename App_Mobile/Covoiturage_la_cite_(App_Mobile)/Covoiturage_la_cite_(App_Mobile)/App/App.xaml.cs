namespace Covoiturage_la_cite__App_Mobile_.App;

public partial class App : Application
{
    private AppShell _shell;
    public App(AppShell shell)
    {
        InitializeComponent();
        _shell = shell;

    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        // Utilisation directe du wrapper pour éviter l'obsolescence et le risque de null
        return new Window(_shell);
    }
}