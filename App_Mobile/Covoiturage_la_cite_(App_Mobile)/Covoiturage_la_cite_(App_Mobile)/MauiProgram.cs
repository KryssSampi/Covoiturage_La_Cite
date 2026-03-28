using Microsoft.Extensions.Logging;

namespace Covoiturage_la_cite__App_Mobile_
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                    fonts.AddFont("FluentSystemIcons-Regular.ttf", "FluentRegularIcons");
                    fonts.AddFont("FluentSystemIcons-Filled.ttf", "FluentFilledIcons");
                    fonts.AddFont("FluentSystemIcons-Resizable.ttf", "FluentResizableIcons");
                    fonts.AddFont("FluentSystemIcons-Light.ttf", "FluentLightIcons");

                });

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
