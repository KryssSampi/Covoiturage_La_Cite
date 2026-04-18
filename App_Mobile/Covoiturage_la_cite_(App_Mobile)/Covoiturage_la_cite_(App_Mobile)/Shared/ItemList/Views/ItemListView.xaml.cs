// Shared/ItemList/views/ItemListView.xaml.cs
// ════════════════════════════════════════════════════════════════════════
// Code-behind du composant ItemList.
// Gère : branchement du controller, chips dynamiques, clear search,
//        fermeture des menus contextuels au tap extérieur.
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Shared.Converters;

namespace Covoiturage_la_cite__App_Mobile_.Shared.ItemList.Views;

public partial class ItemListView : ContentView
{
    private IItemListController? _controller;

    // ── BindableProperty : DataTemplate pour les items ────────────────
    public static readonly BindableProperty ItemTemplateProperty =
        BindableProperty.Create(nameof(ItemTemplate), typeof(DataTemplate),
            typeof(ItemListView), propertyChanged: (b, _, n) =>
            {
                if (b is ItemListView v && n is DataTemplate t)
                    v.MainList.ItemTemplate = t;
            });

    public DataTemplate? ItemTemplate
    {
        get => (DataTemplate?)GetValue(ItemTemplateProperty);
        set => SetValue(ItemTemplateProperty, value);
    }

    // ── BindableProperty : ShowNoInternet (piloté par la feature) ─────
    public static readonly BindableProperty ShowNoInternetProperty =
        BindableProperty.Create(nameof(ShowNoInternet), typeof(bool),
            typeof(ItemListView), false, propertyChanged: (b, _, n) =>
            {
                if (b is ItemListView v && v._controller != null)
                    v.Refresh();
            });

    public bool ShowNoInternet
    {
        get => (bool)GetValue(ShowNoInternetProperty);
        set => SetValue(ShowNoInternetProperty, value);
    }

    // ── Événement Retry ───────────────────────────────────────────────
    public event EventHandler? RetryRequested;

    // ─────────────────────────────────────────────────────────────────

    public ItemListView()
    {
        InitializeComponent();

        // Clear search
        SearchEntry.TextChanged += (s, e) =>
            ClearSearchButton.IsVisible = !string.IsNullOrEmpty(e.NewTextValue);

        ClearSearchButton.Clicked += (s, e) =>
        {
            SearchEntry.Text = "";
            if (_controller != null) _controller.SearchText = "";
        };

        RetryButton.Clicked += (s, e) => RetryRequested?.Invoke(this, e);

        // Fermer les menus au tap en dehors
        var tapGesture = new TapGestureRecognizer();
        tapGesture.Tapped += (s, e) =>
        {
            if (_controller == null) return;
            _controller.IsFilterMenuOpen = false;
            _controller.IsSortMenuOpen   = false;
        };
        MainList.GestureRecognizers.Add(tapGesture);
    }

    // ── API publique : brancher un controller typé ────────────────────

    /// <summary>
    /// Branche un ItemListController sur le composant.
    /// Appeler cette méthode depuis le code-behind de la page.
    ///
    /// Exemple :
    ///   MyList.SetController(myTripController);
    /// </summary>
    public void SetController<T>(ItemListController<T> controller) where T : class
    {
        _controller    = controller;
        BindingContext = controller;

        _controller.PropertyChanged += (_, e) =>
        {
            if (e.PropertyName == nameof(IItemListController.ActiveChips))
                RebuildChips();
            if (e.PropertyName == nameof(IItemListController.ActiveTabIndex))
                RebuildTabs();
        };
        RebuildChips();
        RebuildTabs();
    }

    // ── Construction de la barre d'onglets ────────────────────────────

    private void RebuildTabs()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            TabsBar.Children.Clear();
            if (_controller == null || !_controller.HasTabs) return;

            var labels = _controller.TabLabels;
            for (int i = 0; i < labels.Count; i++)
            {
                var idx = i; // capture
                var isActive = i == _controller.ActiveTabIndex;

                var lbl = new Label
                {
                    Text          = labels[i],
                    FontFamily    = "OpenSansSemibold",
                    FontSize      = 14,
                    TextColor     = isActive ? Color.FromArgb("#08316e") : Color.FromArgb("#7A879A"),
                    Padding       = new Thickness(16, 12, 16, 10),
                    VerticalTextAlignment = TextAlignment.Center,
                };

                var underline = new BoxView
                {
                    HeightRequest   = 2,
                    BackgroundColor = isActive ? Color.FromArgb("#08316e") : Colors.Transparent,
                    HorizontalOptions = LayoutOptions.Fill,
                };

                var container = new VerticalStackLayout { Spacing = 0 };
                container.Children.Add(lbl);
                container.Children.Add(underline);

                var tap = new TapGestureRecognizer();
                tap.Tapped += (s, e) => _controller?.SelectTabCommand.Execute(idx);
                container.GestureRecognizers.Add(tap);

                TabsBar.Children.Add(container);
            }
        });
    }

    // ── Construction des chips ─────────────────────────────────────────

    private void RebuildChips()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            ChipsContainer.Children.Clear();
            if (_controller == null) return;

            foreach (var chip in _controller.ActiveChips)
            {
                var frame = new Frame
                {
                    BackgroundColor = chip.IsSortChip
                        ? Color.FromArgb("#08316e")
                        : Color.FromArgb("#E8F0FE"),
                    CornerRadius = 20,
                    BorderColor  = Colors.Transparent,
                    Padding      = new Thickness(10, 5),
                    HasShadow    = false,
                };

                var row = new HorizontalStackLayout { Spacing = 6 };

                // Icône sort vs filter
                row.Add(new Label
                {
                    Text       = chip.IsSortChip ? "\uF1F7" : "\uF230",
                    FontFamily = "MauiIcons",
                    FontSize   = 12,
                    TextColor  = chip.IsSortChip ? Colors.White : Color.FromArgb("#1A56CC"),
                    VerticalTextAlignment = TextAlignment.Center,
                });

                row.Add(new Label
                {
                    Text       = chip.Label,
                    FontFamily = "OpenSansSemibold",
                    FontSize   = 12,
                    FontAttributes = FontAttributes.Bold,
                    TextColor  = chip.IsSortChip ? Colors.White : Color.FromArgb("#1A56CC"),
                    VerticalTextAlignment = TextAlignment.Center,
                });

                // Croix suppression
                var closeLabel = new Label
                {
                    Text       = "\uE8BB",
                    FontFamily = "MauiIcons",
                    FontSize   = 12,
                    TextColor  = chip.IsSortChip ? Colors.White : Color.FromArgb("#1A56CC"),
                    VerticalTextAlignment = TextAlignment.Center,
                };
                var tap = new TapGestureRecognizer();
                var capturedChip = chip; // capture pour le lambda
                tap.Tapped += (s, e) =>
                    _controller?.RemoveChipCommand.Execute(capturedChip);
                closeLabel.GestureRecognizers.Add(tap);
                row.Add(closeLabel);

                frame.Content = row;

                // Tap sur le frame entier = même effet
                var frameTap = new TapGestureRecognizer();
                frameTap.Tapped += (s, e) =>
                    _controller?.RemoveChipCommand.Execute(capturedChip);
                frame.GestureRecognizers.Add(frameTap);

                ChipsContainer.Children.Add(frame);
            }
        });
    }

    private void Refresh() { /* Force re-evaluation des bindings ShowNoInternet */ }
}

