using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Cards.Views
{
    public partial class NewFeatureCard : ContentView
    {
        public static readonly BindableProperty ModelProperty =
            BindableProperty.Create(
                nameof(Model),
                typeof(NewFeatureCardDisplayModel),
                typeof(NewFeatureCard),
                propertyChanged: (b, _, n) =>
                {
                    if (b is NewFeatureCard card && n is NewFeatureCardDisplayModel m)
                    {
                        card.BindingContext = m;
                    }
                });

        public NewFeatureCardDisplayModel? Model
        {
            get => (NewFeatureCardDisplayModel?)GetValue(ModelProperty);
            set => SetValue(ModelProperty, value);
        }

        public event EventHandler? CtaClicked;

        public NewFeatureCard()
        {
            InitializeComponent();
            CtaButton.Clicked += (s, e) => CtaClicked?.Invoke(this, e);
        }
    }
}
