using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayModels
{
    public record HomeSearchChipDisplayModel(
        string Label,
        string IconKey,
        string BackgroundHex,
        string ForegroundHex,
        string Value
    );

    public class HomeSearchBarDisplayModel : INotifyPropertyChanged
    {
        private string _query = "";
        private string _placeholder = "Rechercher une destination…";
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
