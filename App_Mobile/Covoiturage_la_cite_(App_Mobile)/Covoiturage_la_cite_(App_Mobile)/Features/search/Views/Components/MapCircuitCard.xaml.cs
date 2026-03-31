// Features/search/Views/Components/MapCircuitCard.xaml.cs

using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.Views.Components;

public partial class MapCircuitCard : ContentView
{
    // ── BindableProperty Model ────────────────────────────────────────
    public static readonly BindableProperty ModelProperty =
        BindableProperty.Create(nameof(Model), typeof(MapCircuitCardDisplayModel),
            typeof(MapCircuitCard),
            propertyChanged: (b, _, n) =>
            {
                if (b is MapCircuitCard card && n is MapCircuitCardDisplayModel m)
                {
                    card.BindingContext  = m;
                    if (!string.IsNullOrEmpty(m.MapImageSource))
                        card.MapImage.Source = m.MapImageSource;
                }
            });

    public MapCircuitCardDisplayModel? Model
    {
        get => (MapCircuitCardDisplayModel?)GetValue(ModelProperty);
        set => SetValue(ModelProperty, value);
    }

    // ── Événement CTA ─────────────────────────────────────────────────
    public event EventHandler<MapCircuitCardDisplayModel?>? CtaClicked;

    public MapCircuitCard()
    {
        InitializeComponent();
        CtaButton.Clicked += (s, e) => CtaClicked?.Invoke(this, Model);
    }
}

// ════════════════════════════════════════════════════════════════════════
// DataTemplateSelector pour la zone de résultats
// Discrimine DriverTripResultItem ↔ MapCircuitResultItem
// ════════════════════════════════════════════════════════════════════════

public class SearchResultTemplateSelector : DataTemplateSelector
{
    private static readonly DataTemplate DriverTemplate  = MakeDriverTemplate();
    private static readonly DataTemplate CircuitTemplate = MakeCircuitTemplate();

    // Callback vers le code-behind pour notifier la sélection d'un circuit
    public static Action<MapCircuitCardDisplayModel?>? OnCircuitSelected { get; set; }

    protected override DataTemplate OnSelectTemplate(object item, BindableObject container)
        => item is MapCircuitResultItem ? CircuitTemplate : DriverTemplate;

    private static DataTemplate MakeDriverTemplate() => new(() =>
    {
        var card = new DriverTripCard();
        card.SetBinding(DriverTripCard.ModelProperty,
            new Binding(nameof(DriverTripResultItem.Card)));
        return card;
    });

    private static DataTemplate MakeCircuitTemplate() => new(() =>
    {
        var card = new MapCircuitCard();
        card.SetBinding(MapCircuitCard.ModelProperty,
            new Binding(nameof(MapCircuitResultItem.Card)));
        card.CtaClicked += (s, model) => OnCircuitSelected?.Invoke(model);
        return card;
    });
}
