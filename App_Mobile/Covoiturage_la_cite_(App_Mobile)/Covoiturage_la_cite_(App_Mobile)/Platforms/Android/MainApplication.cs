using Android.App;
using Android.Runtime;

namespace Covoiturage_la_cite__App_Mobile_.Platforms.Android
{
    [Application]
    public class MainApplication(IntPtr handle, JniHandleOwnership ownership) : MauiApplication(handle, ownership)
    {
        protected override MauiApp CreateMauiApp() => Covoiturage_la_cite__App_Mobile_.App.MauiProgram.CreateMauiApp();
    }
}
