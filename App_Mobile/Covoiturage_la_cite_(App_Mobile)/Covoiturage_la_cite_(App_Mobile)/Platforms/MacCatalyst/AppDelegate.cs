using Foundation;
using Covoiturage_la_cite__App_Mobile_.App;

namespace Covoiturage_la_cite__App_Mobile_.Platforms.MacCatalyst
{
    [Register("AppDelegate")]
    public class AppDelegate : MauiUIApplicationDelegate
    {
        protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
    }
}
