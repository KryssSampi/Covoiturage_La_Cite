using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Covoiturage_la_cite__App_Mobile_.Services.navigation;

using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Covoiturage_la_cite__App_Mobile_.Features.homepage.DisplayControler
{
    public class HomepageDisplayController : INotifyPropertyChanged
    {
        private readonly NavigationService _navigationService;
        private readonly ShellControler _shellControler;

        private HomeSearchBarDisplayModel _searchBar;
        private HomeQuickNavGridDisplayModel _quickNav;

        public HomeSearchBarDisplayModel SearchBar
        {
            get => _searchBar;
            private set => SetField(ref _searchBar, value);
        }

        public HomeQuickNavGridDisplayModel QuickNav
        {
            get => _quickNav;
            private set => SetField(ref _quickNav, value);
        }

        public ICommand SearchCommand { get; }
        public ICommand SelectChipCommand { get; }
        public ICommand QuickNavCommand { get; }

        public HomepageDisplayController(
            NavigationService navigationService,
            ShellControler shellControler)
        {
            _navigationService = navigationService;
            _shellControler = shellControler;

            _searchBar = new HomeSearchBarDisplayModel();
            _quickNav = new HomeQuickNavGridDisplayModel(Array.Empty<HomeQuickNavItemDisplayModel>());

            SearchCommand = new Command(ExecuteSearch);
            SelectChipCommand = new Command<HomeSearchChipDisplayModel>(chip =>
            {
                if (chip is null) return;
                SearchBar.Query = chip.Value;
                ExecuteSearch();
            });
            QuickNavCommand = new Command<HomeQuickNavItemDisplayModel>(item =>
            {
                if (item is null) return;
                if (item.Route == "menu")
                {
                    if (_shellControler.OpenMenuCommand.CanExecute(null))
                        _shellControler.OpenMenuCommand.Execute(null);
                    if (Shell.Current is not null)
                        Shell.Current.FlyoutIsPresented = true;
                    return;
                }
                if (NavigationService.IsMainRoute(item.Route))
                    _navigationService.GoTo(item.Route);
                else
                    _navigationService.Push(item.Route);
            });
        }

        private void ExecuteSearch()
        {
            // Passe la query saisie en paramètre To + positionne "Votre position" sur From
            var query = SearchBar.Query?.Trim() ?? "";

            var parameters = new Dictionary<string, object>
            {
                ["useCurrentLocation"] = (object)true,
            };

            if (!string.IsNullOrWhiteSpace(query))
                parameters["toText"] = Uri.EscapeDataString(query);

            _navigationService.Push("search", parameters);
        }

        public void SetSearchBar(HomeSearchBarDisplayModel model)
        {
            SearchBar = model;
        }

        public void SetQuickNav(HomeQuickNavGridDisplayModel model)
        {
            QuickNav = model;
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string? name = null)
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
