// App/Mobilepages/searchpage/view/SearchPage.xaml.cs
// ════════════════════════════════════════════════════════════════════════
// Code-behind de la SearchPage.
// Reçoit toText + useCurrentLocation depuis la HomePage via query params.
// ════════════════════════════════════════════════════════════════════════

using System.Text.Json;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayController;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.Views.Components;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.searchpage.view;

public partial class SearchPage : ContentPage, IQueryAttributable
{
    private readonly SearchDisplayController _ctrl;
    private bool _isFirstAppear = true;

    // URL cross-platform du bundle Leaflet (Resources/Raw/web/map/)
    private static string MapBundleUrl =>
#if WINDOWS
        "ms-appx-web:///web/map/index.html?dev=false";
#elif ANDROID
        "file:///android_asset/web/map/index.html?dev=false";
#else
        "web/map/index.html?dev=false";
#endif

    public SearchPage(SearchDisplayController controller)
    {
        InitializeComponent();
        _ctrl          = controller;
        BindingContext = controller;

        // DataTemplateSelector
        SearchResultTemplateSelector.OnCircuitSelected = OnCircuitSelected;
        ResultsList.ItemTemplate = new SearchResultTemplateSelector();

        WireEntries();

        _ctrl.PropertyChanged += OnControllerPropertyChanged;

        MapWebView.Source = MapBundleUrl;
    }

    // ══════════════════════════════════════════════════════════════════
    // IQueryAttributable — depuis HomePage (loupe ou chip)
    // ══════════════════════════════════════════════════════════════════

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("toText", out var toVal) && toVal is string toStr
            && !string.IsNullOrWhiteSpace(toStr))
        {
            _ctrl.SetToText(Uri.UnescapeDataString(toStr));
        }

        if (query.TryGetValue("useCurrentLocation", out var locVal))
        {
            bool use = locVal switch
            {
                bool b   => b,
                string s => bool.TryParse(s, out var p) && p,
                _        => false,
            };
            if (use) _ctrl.SetCurrentLocation(true);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Cycle de vie
    // ══════════════════════════════════════════════════════════════════

    protected override void OnAppearing()
    {
        base.OnAppearing();

        // TODO : remplacer par SessionService.GetCurrentRole()
        _ctrl.SetRole(UserRole.Passenger);

        if (_isFirstAppear)
        {
            _isFirstAppear = false;
            _ctrl.InitPageCommand.Execute(null);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // Wiring Entry
    // ══════════════════════════════════════════════════════════════════

    private void WireEntries()
    {
        FromEntry.Focused   += (s, e) => _ctrl.FocusFromCommand.Execute(null);
        FromEntry.Unfocused += (s, e) =>
            Dispatcher.DispatchDelayed(TimeSpan.FromMilliseconds(150), () =>
            {
                if (_ctrl.ActiveField == ActiveField.From)
                    _ctrl.ClearFocusCommand.Execute(null);
            });
        FromEntry.Completed += (s, e) => _ctrl.ConfirmInputCommand.Execute(null);
        FromEntry.TextChanged   += (s, e) => _ctrl.FromText = e.NewTextValue;

        ToEntry.Focused   += (s, e) => _ctrl.FocusToCommand.Execute(null);
        ToEntry.Unfocused += (s, e) =>
            Dispatcher.DispatchDelayed(TimeSpan.FromMilliseconds(150), () =>
            {
                if (_ctrl.ActiveField == ActiveField.To)
                    _ctrl.ClearFocusCommand.Execute(null);
            });
        ToEntry.Completed += (s, e) => _ctrl.ConfirmInputCommand.Execute(null);
        ToEntry.TextChanged   += (s, e) => _ctrl.ToText = e.NewTextValue;
    }

    // ══════════════════════════════════════════════════════════════════
    // Observer controller
    // ══════════════════════════════════════════════════════════════════

    private void OnControllerPropertyChanged(object? sender,
        System.ComponentModel.PropertyChangedEventArgs e)
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            switch (e.PropertyName)
            {
                case nameof(SearchDisplayController.ShowFromEntry):
                    AnimateFrame(FromFrame, _ctrl.ShowFromEntry);
                    break;
                case nameof(SearchDisplayController.ShowToEntry):
                    AnimateFrame(ToFrame, _ctrl.ShowToEntry);
                    break;
                case nameof(SearchDisplayController.IsFromFocused):
                    if (_ctrl.IsFromFocused) FromEntry.Focus();
                    break;
                case nameof(SearchDisplayController.IsToFocused):
                    if (_ctrl.IsToFocused) ToEntry.Focus();
                    break;
                case nameof(SearchDisplayController.IsFocused):
                    if (!_ctrl.IsFocused) { FromEntry.Unfocus(); ToEntry.Unfocus(); }
                    break;
                case nameof(SearchDisplayController.ShowMapWebView):
                    if (_ctrl.ShowMapWebView) _ = SendCircuitsToMapAsync();
                    break;
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // Animation frame
    // ══════════════════════════════════════════════════════════════════

    private static async void AnimateFrame(Frame frame, bool visible)
    {
        if (visible)
        {
            frame.IsVisible    = true;
            frame.Opacity      = 0;
            frame.TranslationY = -8;
            await Task.WhenAll(
                frame.FadeTo(1, 200),
                frame.TranslateTo(0, 0, 200, Easing.CubicOut));
        }
        else
        {
            await Task.WhenAll(
                frame.FadeTo(0, 150),
                frame.TranslateTo(0, -6, 150, Easing.CubicIn));
            frame.IsVisible = false;
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // WebView Leaflet — envoi JSON circuits
    // ══════════════════════════════════════════════════════════════════

    private async Task SendCircuitsToMapAsync()
    {
        await Task.Delay(600); // laisse la WebView charger

        var circuits = _ctrl.Results
            .OfType<MapCircuitResultItem>()
            .Select((r, i) => new
            {
                routeIndex     = i,
                latLngs        = Array.Empty<double[]>(),
                waypointCoords = Array.Empty<double[]>(),
                summary        = r.Card.Label,
                distance       = (long)(r.Card.DistanceKm * 1000),
                duration       = r.Card.DurationMinutes * 60,
                departureLabel = r.Card.FromAddress,
                arrivalLabel   = r.Card.ToAddress,
            })
            .ToList();

        var msg = JsonSerializer.Serialize(new
        {
            type        = "SET_CIRCUITS",
            circuits,
            activeIndex = 0,
        });

        await MapWebView.EvaluateJavaScriptAsync(
            $"window.mapBridge && window.mapBridge.send({msg})");
    }

    private async void OnCircuitSelected(MapCircuitCardDisplayModel? model)
    {
        if (model == null) return;
        var list = _ctrl.Results.OfType<MapCircuitResultItem>().ToList();
        int idx  = list.FindIndex(r => r.Card.CircuitId == model.CircuitId);
        if (idx < 0) return;

        var msg = JsonSerializer.Serialize(new { type = "SELECT_CIRCUIT", index = idx });
        await MapWebView.EvaluateJavaScriptAsync(
            $"window.mapBridge && window.mapBridge.send({msg})");
    }
}
