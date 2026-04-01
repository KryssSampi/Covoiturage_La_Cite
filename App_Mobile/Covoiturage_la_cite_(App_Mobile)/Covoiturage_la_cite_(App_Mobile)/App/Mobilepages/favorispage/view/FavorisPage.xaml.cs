// ============================================================
//  App/Mobilepages/favorispage/view/FavorisPage.xaml.cs
//  3 sections (Lieux / Personnes / Alertes) + Popup lieu + Sheet conducteur
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.favoris.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.favoris.Fixtures;
using Covoiturage_la_cite__App_Mobile_.Features.favoris.Views.Components;
using Microsoft.Maui.Controls.Shapes;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.favorispage.view
{
    public partial class FavorisPage : ContentView
    {
        // ── Section data ──────────────────────────────────────────────
        private IList<FavoriteCardDisplayModel> _places  = [];
        private IList<FavoriteCardDisplayModel> _persons = [];
        private IList<FavoriteCardDisplayModel> _alerts  = [];

        // ── Popup lieu state ──────────────────────────────────────────
        private FavoriteCardDisplayModel? _selectedSuggestion;

        // ── Sheet conducteur state ────────────────────────────────────
        private readonly HashSet<string> _selectedPersonIds = new();
        private readonly List<FavoriteCardDisplayModel> _sheetResults  = new();

        // Mock address suggestions (production: ORS geocode API)
        private static readonly IReadOnlyList<(string Label, string Address)> _mockAddresses =
        [
            ("Campus La Cité",      "950 rue de la Gappe, Gatineau, QC"),
            ("Gare d'Ottawa",       "200 Tremblay Rd, Ottawa, ON"),
            ("Place d'Orléans",     "110 Place d'Orléans Dr, Ottawa, ON"),
            ("Rideau Centre",       "50 Rideau St, Ottawa, ON"),
            ("Costco Gatineau",     "1500 rue Rosalie-Jetté, Gatineau, QC"),
            ("CHEO",                "401 Smyth Rd, Ottawa, ON"),
            ("Hôpital Montfort",    "713 Montreal Rd, Ottawa, ON"),
            ("Carleton University", "1125 Colonel By Dr, Ottawa, ON"),
            ("Université d'Ottawa", "75 Laurier Ave E, Ottawa, ON"),
            ("Galeries de Hull",    "320 boul. St-Joseph, Gatineau, QC"),
        ];

        // Mock driver pool for sheet search (production: user service)
        private static readonly IReadOnlyList<FavoriteCardDisplayModel> _searchDriverPool =
        [
            new("drv-s1", FavoriteType.Person, "Amélie Tremblay",  "👤", "Conductrice · 4.9 ★",
                null, null, "AT", "Conductrice régulière",    "Il y a 2 jours",    true,
                string.Empty, string.Empty, false, string.Empty),
            new("drv-s2", FavoriteType.Person, "Kevin Nguyen",     "👤", "Conducteur · 4.7 ★",
                null, null, "KN", "Conducteur certifié",      "La semaine dernière", true,
                string.Empty, string.Empty, false, string.Empty),
            new("drv-s3", FavoriteType.Person, "Fatima Benali",    "👤", "Conductrice · 4.8 ★",
                null, null, "FB", "Conductrice active",       "Il y a 3 jours",    true,
                string.Empty, string.Empty, false, string.Empty),
            new("drv-s4", FavoriteType.Person, "Lucas Moreau",     "👤", "Conducteur · 4.6 ★",
                null, null, "LM", "Conducteur actif",         "Il y a 5 jours",    true,
                string.Empty, string.Empty, false, string.Empty),
            new("drv-s5", FavoriteType.Person, "Jade Ouellet",     "👤", "Conductrice · 4.9 ★",
                null, null, "JO", "Conductrice expérimentée", "Hier",              true,
                string.Empty, string.Empty, false, string.Empty),
            new("drv-s6", FavoriteType.Person, "Marco Di Palma",   "👤", "Conducteur · 4.5 ★",
                null, null, "MD", "Nouveau conducteur",       "Il y a 1 semaine",  true,
                string.Empty, string.Empty, false, string.Empty),
        ];

        // Preset pill labels
        private static readonly string[] _presets = ["🏠 Maison", "🎓 École", "💼 Travail", "🏋️ Gym", "🌟 Autre"];

        // Flag pour éviter double chargement
        private bool _isLoaded;

        // ─────────────────────────────────────────────────────────────
        public FavorisPage()
        {
            InitializeComponent();
            Loaded += OnLoaded;
        }

        // ─────────────────────────────────────────────────────────────
        //  Chargement différé — libère le UI thread au démarrage
        // ─────────────────────────────────────────────────────────────
        private async void OnLoaded(object? sender, EventArgs e)
        {
            if (_isLoaded) return;
            _isLoaded = true;

            // Charge les données hors UI thread
            var places  = await Task.Run(() => FavorisFixtures.Places().ToList());
            var persons = await Task.Run(() => FavorisFixtures.Persons().ToList());
            var alerts  = await Task.Run(() => FavorisFixtures.Alerts().ToList());

            // Assigne sur UI thread
            _places  = places;
            _persons = persons;
            _alerts  = alerts;

            BuildSection();
            BuildPresetPills();
        }

        // ════════════════════════════════════════════════════════════
        //  SECTION BUILDING
        // ════════════════════════════════════════════════════════════

        private void BuildSection()
        {
            PlacesCountLabel.Text  = $"({_places.Count})";
            PersonsCountLabel.Text = $"({_persons.Count})";
            AlertsCountLabel.Text  = $"({_alerts.Count})";

            PlacesStack.Children.Clear();
            foreach (var m in _places)
            {
                var card = new FavoritePlaceCard { BindingContext = m };
                card.DeleteRequested += OnDeletePlace;
                PlacesStack.Children.Add(card);
            }

            PersonsStack.Children.Clear();
            foreach (var m in _persons)
            {
                var card = new FavoritePersonCard { BindingContext = m };
                card.DeleteRequested += OnDeletePerson;
                card.MessageRequested += OnMessagePerson;
                PersonsStack.Children.Add(card);
            }

            AlertsStack.Children.Clear();
            foreach (var m in _alerts)
            {
                var card = new FavoriteAlertCard { BindingContext = m };
                card.DeleteRequested += OnDeleteAlert;
                card.SearchRequested += OnSearchAlert;
                card.ToggleRequested += OnToggleAlert;
                AlertsStack.Children.Add(card);
            }
        }

        // ════════════════════════════════════════════════════════════
        //  LIEUX
        // ════════════════════════════════════════════════════════════

        private void OnDeletePlace(object? sender, string id)
        {
            var item = _places.FirstOrDefault(p => p.Id == id);
            if (item is null) return;
            _places.Remove(item);
            BuildSection();
        }

        private async void OnAddPlaceTapped(object sender, TappedEventArgs e)
            => await OpenLieuPopupAsync();

        // ════════════════════════════════════════════════════════════
        //  PERSONNES
        // ════════════════════════════════════════════════════════════

        private void OnDeletePerson(object? sender, string id)
        {
            var item = _persons.FirstOrDefault(p => p.Id == id);
            if (item is null) return;
            _persons.Remove(item);
            BuildSection();
        }

        private async void OnMessagePerson(object? sender, string id)
        {
            var convId = Uri.EscapeDataString(id);
            await Shell.Current.GoToAsync($"conversation?conversationId={convId}");
        }

        private async void OnAddPersonTapped(object sender, TappedEventArgs e)
            => await OpenPersonSheetAsync();

        // ════════════════════════════════════════════════════════════
        //  ALERTES
        // ════════════════════════════════════════════════════════════

        private void OnDeleteAlert(object? sender, string id)
        {
            var item = _alerts.FirstOrDefault(a => a.Id == id);
            if (item is null) return;
            _alerts.Remove(item);
            BuildSection();
        }

        private async void OnSearchAlert(object? sender, string id)
        {
            var alert = _alerts.FirstOrDefault(a => a.Id == id);
            if (alert is null) return;
            var dep = Uri.EscapeDataString(alert.AlertOrigin);
            var arr = Uri.EscapeDataString(alert.AlertDestination);
            await Shell.Current.GoToAsync($"search?departure={dep}&arrival={arr}");
        }

        private void OnToggleAlert(object? sender, string id)
        {
            var item = _alerts.FirstOrDefault(a => a.Id == id);
            if (item is null) return;
            var idx = _alerts.IndexOf(item);
            if (idx < 0) return;
            _alerts[idx] = item with { AlertIsActive = !item.AlertIsActive };
            BuildSection();
        }

        private async void OnAddAlertTapped(object sender, TappedEventArgs e)
            => await Shell.Current.GoToAsync("search");

        // ════════════════════════════════════════════════════════════
        //  POPUP LIEU — OPEN / CLOSE
        // ════════════════════════════════════════════════════════════

        private async Task OpenLieuPopupAsync()
        {
            _selectedSuggestion = null;
            LieuSearchEntry.Text = string.Empty;
            PseudoEntry.Text     = string.Empty;
            SuggestionsContainer.IsVisible = false;
            SuggestionsInner.Children.Clear();
            UpdateSaveLieuBtn();

            LieuPopup.Opacity = 0;
            LieuPopup.Scale   = 0.92;
            Backdrop.IsVisible  = true;
            LieuPopup.IsVisible = true;

            await Task.WhenAll(
                LieuPopup.FadeTo(1,    200, Easing.CubicOut),
                LieuPopup.ScaleTo(1,   200, Easing.CubicOut));
        }

        private async Task CloseLieuPopupAsync()
        {
            await Task.WhenAll(
                LieuPopup.FadeTo(0,    160, Easing.CubicIn),
                LieuPopup.ScaleTo(0.94, 160, Easing.CubicIn));
            LieuPopup.IsVisible = false;
            Backdrop.IsVisible  = false;
        }

        private async void OnCloseLieuPopup(object sender, TappedEventArgs e)
            => await CloseLieuPopupAsync();

        // ── Address suggestions ───────────────────────────────────────

        private void OnLieuSearchTextChanged(object sender, TextChangedEventArgs e)
        {
            var q = (e.NewTextValue ?? string.Empty).Trim();

            _selectedSuggestion = null;
            UpdateSaveLieuBtn();

            if (q.Length < 2)
            {
                SuggestionsContainer.IsVisible = false;
                SuggestionsInner.Children.Clear();
                return;
            }

            var matches = _mockAddresses
                .Where(a => a.Label.Contains(q,   StringComparison.OrdinalIgnoreCase)
                         || a.Address.Contains(q, StringComparison.OrdinalIgnoreCase))
                .Take(5)
                .ToList();

            SuggestionsInner.Children.Clear();

            if (matches.Count == 0)
            {
                SuggestionsContainer.IsVisible = false;
                return;
            }

            for (var i = 0; i < matches.Count; i++)
            {
                var (label, address) = matches[i];
                var isLast = i == matches.Count - 1;
                SuggestionsInner.Children.Add(BuildSuggestionRow(label, address, isLast));
            }
            SuggestionsContainer.IsVisible = true;
        }

        private View BuildSuggestionRow(string label, string address, bool isLast)
        {
            var grid = new Grid
            {
                ColumnDefinitions =
                [
                    new ColumnDefinition { Width = GridLength.Auto },
                    new ColumnDefinition { Width = GridLength.Star },
                ],
                Padding = new Thickness(12, 10),
            };

            var pin = new Label
            {
                Text = "📍", FontSize = 14,
                VerticalOptions = LayoutOptions.Start,
                Margin = new Thickness(0, 2, 8, 0),
            };

            var infoStack = new VerticalStackLayout { Spacing = 1 };
            infoStack.Children.Add(new Label
            {
                Text = label, FontSize = 13,
                TextColor = Color.FromArgb("#0D1624"),
                FontAttributes = FontAttributes.Bold,
            });
            infoStack.Children.Add(new Label
            {
                Text = address, FontSize = 11,
                TextColor = Color.FromArgb("#7A879A"),
                LineBreakMode = LineBreakMode.TailTruncation,
            });

            Grid.SetColumn(pin, 0);
            Grid.SetColumn(infoStack, 1);
            grid.Children.Add(pin);
            grid.Children.Add(infoStack);

            var tap = new TapGestureRecognizer();
            tap.Tapped += (_, _) => OnSuggestionTapped(label, address);
            grid.GestureRecognizers.Add(tap);

            if (isLast) return grid;

            var outer = new VerticalStackLayout { Spacing = 0 };
            outer.Children.Add(grid);
            outer.Children.Add(new BoxView
            {
                HeightRequest = 1,
                BackgroundColor = Color.FromArgb("#0D000000"),
            });
            return outer;
        }

        private void OnSuggestionTapped(string label, string address)
        {
            LieuSearchEntry.Text = address;

            _selectedSuggestion = new FavoriteCardDisplayModel(
                Id:                  Guid.NewGuid().ToString(),
                Type:                FavoriteType.Place,
                Name:                label,
                Emoji:               "📍",
                SubLabel:            address,
                PlaceAddress:        address,
                PlaceEstimatedTime:  null,
                PersonInitial:       string.Empty,
                PersonRoleLabel:     string.Empty,
                PersonLastTripStr:   string.Empty,
                PersonIsDriver:      false,
                AlertOrigin:         string.Empty,
                AlertDestination:    string.Empty,
                AlertIsActive:       false,
                AlertFrequency:      string.Empty
            );

            if (string.IsNullOrWhiteSpace(PseudoEntry.Text))
                PseudoEntry.Text = label;

            SuggestionsContainer.IsVisible = false;
            UpdateSaveLieuBtn();
        }

        // ── Preset pills ──────────────────────────────────────────────

        private void BuildPresetPills()
        {
            foreach (var preset in _presets)
            {
                var pill = new Border
                {
                    BackgroundColor = Color.FromArgb("#EEF3FB"),
                    StrokeThickness = 0,
                    Padding = new Thickness(12, 6),
                    StrokeShape = new RoundRectangle { CornerRadius = 99 },
                    Content = new Label
                    {
                        Text = preset, FontSize = 12,
                        TextColor = Color.FromArgb("#1A56CC"),
                        FontFamily = "OpenSansSemibold",
                    },
                };

                var label = preset;
                var tap = new TapGestureRecognizer();
                tap.Tapped += (_, _) => PseudoEntry.Text = label;
                pill.GestureRecognizers.Add(tap);
                PresetPills.Children.Add(pill);
            }
        }

        // ── Save lieu ─────────────────────────────────────────────────

        private void UpdateSaveLieuBtn()
        {
            SaveLieuBtn.BackgroundColor = _selectedSuggestion is not null
                ? Color.FromArgb("#1A56CC")
                : Color.FromArgb("#A8B4C8");
        }

        private async void OnSaveLieu(object sender, TappedEventArgs e)
        {
            if (_selectedSuggestion is null) return;

            var name = string.IsNullOrWhiteSpace(PseudoEntry.Text)
                ? _selectedSuggestion.Name
                : PseudoEntry.Text.Trim();

            _places.Add(_selectedSuggestion with { Name = name });
            BuildSection();

            await CloseLieuPopupAsync();
            await ShowToastAsync($"« {name} » ajouté aux favoris");
        }

        // ════════════════════════════════════════════════════════════
        //  BOTTOM SHEET CONDUCTEUR — OPEN / CLOSE
        // ════════════════════════════════════════════════════════════

        private async Task OpenPersonSheetAsync()
        {
            _selectedPersonIds.Clear();
            _sheetResults.Clear();
            PersonSearchEntry.Text = string.Empty;
            SheetPersonRows.Children.Clear();
            SheetPersonRows.IsVisible  = false;
            SheetEmptyState.IsVisible  = true;
            SelCountBar.IsVisible      = false;

            PersonSheet.TranslationY = PersonSheet.HeightRequest;
            PersonSheet.IsVisible = true;
            Backdrop.IsVisible    = true;

            await PersonSheet.TranslateTo(0, 0, 280, Easing.CubicOut);
        }

        private async Task ClosePersonSheetAsync()
        {
            await PersonSheet.TranslateTo(0, PersonSheet.HeightRequest, 240, Easing.CubicIn);
            PersonSheet.IsVisible = false;
            Backdrop.IsVisible    = false;
            PersonSheet.TranslationY = PersonSheet.HeightRequest;
        }

        private async void OnClosePersonSheet(object sender, TappedEventArgs e)
            => await ClosePersonSheetAsync();

        // ── Person search ─────────────────────────────────────────────

        private void OnPersonSearchTextChanged(object sender, TextChangedEventArgs e)
        {
            var q = (e.NewTextValue ?? string.Empty).Trim();

            if (q.Length < 2)
            {
                _sheetResults.Clear();
                SheetPersonRows.Children.Clear();
                SheetPersonRows.IsVisible = false;
                SheetEmptyState.IsVisible = true;
                return;
            }

            _sheetResults.Clear();
            _sheetResults.AddRange(
                _searchDriverPool
                    .Where(p => p.Name.Contains(q,     StringComparison.OrdinalIgnoreCase)
                             || p.SubLabel.Contains(q, StringComparison.OrdinalIgnoreCase))
                    .Where(p => _persons.All(ex => ex.Id != p.Id))
            );

            SheetPersonRows.Children.Clear();
            SheetEmptyState.IsVisible = _sheetResults.Count == 0;
            SheetPersonRows.IsVisible = _sheetResults.Count > 0;

            foreach (var driver in _sheetResults)
                SheetPersonRows.Children.Add(BuildPersonRow(driver));
        }

        private View BuildPersonRow(FavoriteCardDisplayModel driver)
        {
            var isChecked = _selectedPersonIds.Contains(driver.Id);

            var grid = new Grid
            {
                ColumnDefinitions =
                [
                    new ColumnDefinition { Width = GridLength.Auto },
                    new ColumnDefinition { Width = GridLength.Star },
                    new ColumnDefinition { Width = GridLength.Auto },
                ],
                Padding = new Thickness(16, 12),
            };

            // Avatar circle
            var avatar = new Frame
            {
                WidthRequest = 40, HeightRequest = 40, CornerRadius = 20,
                BackgroundColor = Color.FromArgb("#EEF3FB"),
                Padding = 0, HasShadow = false, BorderColor = Colors.Transparent,
                Content = new Label
                {
                    Text = driver.PersonInitial,
                    FontSize = 15, FontAttributes = FontAttributes.Bold,
                    TextColor = Color.FromArgb("#1A56CC"),
                    HorizontalTextAlignment = TextAlignment.Center,
                    VerticalTextAlignment   = TextAlignment.Center,
                },
            };

            // Name + role
            var info = new VerticalStackLayout
            {
                Spacing = 2, VerticalOptions = LayoutOptions.Center,
                Margin = new Thickness(10, 0),
            };
            info.Children.Add(new Label
            {
                Text = driver.Name, FontSize = 13,
                FontAttributes = FontAttributes.Bold,
                TextColor = Color.FromArgb("#0D1624"),
            });
            info.Children.Add(new Label
            {
                Text = driver.PersonRoleLabel, FontSize = 11,
                TextColor = Color.FromArgb("#7A879A"),
            });

            // Checkbox visual
            var checkbox = new Frame
            {
                WidthRequest = 22, HeightRequest = 22, CornerRadius = 6,
                Padding = 0, HasShadow = false,
                BackgroundColor = isChecked ? Color.FromArgb("#1A56CC") : Colors.White,
                BorderColor     = isChecked ? Color.FromArgb("#1A56CC") : Color.FromArgb("#D8DBE5"),
                VerticalOptions = LayoutOptions.Center,
            };
            if (isChecked)
            {
                checkbox.Content = new Label
                {
                    Text = "✓", FontSize = 12, TextColor = Colors.White,
                    HorizontalTextAlignment = TextAlignment.Center,
                    VerticalTextAlignment   = TextAlignment.Center,
                };
            }

            Grid.SetColumn(avatar,   0);
            Grid.SetColumn(info,     1);
            Grid.SetColumn(checkbox, 2);
            grid.Children.Add(avatar);
            grid.Children.Add(info);
            grid.Children.Add(checkbox);

            var driverId = driver.Id;
            var tap = new TapGestureRecognizer();
            tap.Tapped += (_, _) => OnPersonRowTapped(driverId);
            grid.GestureRecognizers.Add(tap);

            var outer = new VerticalStackLayout { Spacing = 0 };
            outer.Children.Add(grid);
            outer.Children.Add(new BoxView
            {
                HeightRequest = 1,
                BackgroundColor = Color.FromArgb("#0D000000"),
            });
            return outer;
        }

        private void OnPersonRowTapped(string id)
        {
            if (!_selectedPersonIds.Remove(id))
                _selectedPersonIds.Add(id);

            SheetPersonRows.Children.Clear();
            foreach (var driver in _sheetResults)
                SheetPersonRows.Children.Add(BuildPersonRow(driver));

            UpdateSelCountBar();
        }

        private void UpdateSelCountBar()
        {
            var count = _selectedPersonIds.Count;
            SelCountBar.IsVisible = count > 0;
            SelCountLabel.Text    = $"{count} sélectionné(s)";
        }

        private void OnClearSelections(object sender, TappedEventArgs e)
        {
            _selectedPersonIds.Clear();
            SheetPersonRows.Children.Clear();
            foreach (var driver in _sheetResults)
                SheetPersonRows.Children.Add(BuildPersonRow(driver));
            UpdateSelCountBar();
        }

        private async void OnSavePersons(object sender, TappedEventArgs e)
        {
            if (_selectedPersonIds.Count == 0)
            {
                await ClosePersonSheetAsync();
                return;
            }

            var toAdd = _sheetResults.Where(p => _selectedPersonIds.Contains(p.Id)).ToList();
            foreach (var person in toAdd)
                _persons.Add(person);

            BuildSection();

            var toastMsg = toAdd.Count == 1
                ? $"« {toAdd[0].Name} » ajouté aux favoris"
                : $"{toAdd.Count} conducteurs ajoutés aux favoris";

            await ClosePersonSheetAsync();
            await ShowToastAsync(toastMsg);
        }

        // ════════════════════════════════════════════════════════════
        //  BACKDROP
        // ════════════════════════════════════════════════════════════

        private async void OnBackdropTapped(object sender, TappedEventArgs e)
        {
            if (LieuPopup.IsVisible)
                await CloseLieuPopupAsync();
            else if (PersonSheet.IsVisible)
                await ClosePersonSheetAsync();
        }

        // ════════════════════════════════════════════════════════════
        //  TOAST
        // ════════════════════════════════════════════════════════════

        private async Task ShowToastAsync(string message)
        {
            ToastLabel.Text       = message;
            ToastView.Opacity     = 0;
            ToastView.IsVisible   = true;

            await ToastView.FadeTo(1, 200, Easing.CubicOut);
            await Task.Delay(2500);
            await ToastView.FadeTo(0, 300, Easing.CubicIn);

            ToastView.IsVisible = false;
        }
    }
}
