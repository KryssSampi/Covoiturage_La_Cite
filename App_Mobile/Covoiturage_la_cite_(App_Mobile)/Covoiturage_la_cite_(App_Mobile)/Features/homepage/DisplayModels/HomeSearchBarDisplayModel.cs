using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayModels
{
    /// <summary>
    /// Chip de lieu favori dans la SearchBar
    /// - Label = pseudo du lieu (ex: "Maison", "Travail")
    /// - Value = adresse complète pour autofill
    /// - Address = adresse affichée (optionnel, sinon Value)
    /// </summary>
    public class HomeSearchChipDisplayModel : INotifyPropertyChanged
    {
        private bool _isPressed;
        
        public string Label { get; }
        public string IconKey { get; }
        public string Value { get; }
        public string Address => Value;
        
        // Couleurs
        public string BackgroundHex { get; }
        public string ForegroundHex { get; }
        public string PressedBackgroundHex { get; }
        
        public bool IsPressed
        {
            get => _isPressed;
            set
            {
                if (_isPressed == value) return;
                _isPressed = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(CurrentBackgroundHex));
            }
        }
        
        /// <summary>Couleur de fond actuelle (normale ou pressée)</summary>
        public string CurrentBackgroundHex => IsPressed ? PressedBackgroundHex : BackgroundHex;

        public HomeSearchChipDisplayModel(
            string label,
            string iconKey,
            string backgroundHex,
            string foregroundHex,
            string value,
            string? pressedBackgroundHex = null)
        {
            Label = label;
            IconKey = iconKey;
            BackgroundHex = backgroundHex;
            ForegroundHex = foregroundHex;
            Value = value;
            PressedBackgroundHex = pressedBackgroundHex ?? DarkenColor(backgroundHex);
        }

        /// <summary>Assombrit légèrement une couleur hex pour l'effet pressed</summary>
        private static string DarkenColor(string hex)
        {
            // Simple darkening: on utilise une couleur plus foncée
            return hex switch
            {
                "#E8F0FE" => "#C5D9F8", // Bleu clair → bleu moyen
                "#FEF3E2" => "#F8DEB8", // Orange clair → orange moyen
                "#E8FEF0" => "#C5F8D9", // Vert clair → vert moyen
                "#F3E8FE" => "#DEC5F8", // Violet clair → violet moyen
                _ => "#D0D0D0" // Fallback gris
            };
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }

    public class HomeSearchBarDisplayModel : INotifyPropertyChanged
    {
        private string _query = "";
        private string _placeholder = "Où Voulez-Vous allez ?...";
        private IReadOnlyList<HomeSearchChipDisplayModel> _chips = Array.Empty<HomeSearchChipDisplayModel>();

        public string Query { get => _query; set => SetField(ref _query, value); }
        public string Placeholder { get => _placeholder; set => SetField(ref _placeholder, value); }
        public IReadOnlyList<HomeSearchChipDisplayModel> Chips { get => _chips; set => SetField(ref _chips, value); }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

        private bool SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(name);
            return true;
        }
    }
}
