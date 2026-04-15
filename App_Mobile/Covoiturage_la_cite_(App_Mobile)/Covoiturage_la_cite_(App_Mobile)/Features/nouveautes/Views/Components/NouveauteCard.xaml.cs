// ============================================================
//  Features/nouveautes/Views/Components/NouveauteCard.xaml.cs
//  Charge la vidéo YouTube en boucle via WebView iframe.
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.nouveautes.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.nouveautes.Views.Components
{
    public partial class NouveauteCard : ContentView
    {
        public NouveauteCard()
        {
            InitializeComponent();
            BindingContextChanged += OnBindingContextChanged;
        }

        private void OnBindingContextChanged(object? sender, EventArgs e)
        {
            if (BindingContext is not NouveauteCardDisplayModel model) return;

            // Embed YouTube avec autoplay + loop + mute (requis pour autoplay mobile)
            var html = $@"
<!DOCTYPE html><html>
<head>
<meta name=""viewport"" content=""width=device-width,initial-scale=1"">
<style>
  html,body{{margin:0;padding:0;background:#000;overflow:hidden;height:100%;}}
  iframe{{width:100%;height:100%;border:none;display:block;}}
</style>
</head>
<body>
  <iframe
    src=""https://www.youtube.com/embed/{model.YoutubeVideoId}?autoplay=1&mute=1&loop=1&playlist={model.YoutubeVideoId}&controls=0&modestbranding=1&playsinline=1""
    allow=""autoplay; encrypted-media"" allowfullscreen>
  </iframe>
</body></html>";

            VideoView.Source = new HtmlWebViewSource { Html = html };
        }
    }
}
