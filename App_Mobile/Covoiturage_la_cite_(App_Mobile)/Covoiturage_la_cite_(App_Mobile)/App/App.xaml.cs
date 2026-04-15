namespace Covoiturage_la_cite__App_Mobile_.App;

public partial class App : Application
{
    private readonly AppShell _shell;

    public App(AppShell shell)
    {
        InitializeComponent();
        _shell = shell;
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        return new Window(_shell);
    }

    protected override void OnStart()
    {
        base.OnStart();
        // Auth désactivée temporairement — test fluidité
        // await _shell.CheckAuthAndRedirectAsync();
    }
}
