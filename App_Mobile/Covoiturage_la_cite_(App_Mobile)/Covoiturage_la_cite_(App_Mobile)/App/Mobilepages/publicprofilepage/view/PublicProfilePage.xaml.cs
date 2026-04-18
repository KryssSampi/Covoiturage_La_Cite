using Covoiturage_la_cite__App_Mobile_.App.Mobilepages.publicprofilepage.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.App.Mobilepages.publicprofilepage.view;

[QueryProperty(nameof(UserId), "id")]
public partial class PublicProfilePage : ContentPage
{
    private readonly PublicProfilePageDisplayControler _pageController;
    private bool _headerSet;

    public string? UserId { get; set; }

    public PublicProfilePage(PublicProfilePageDisplayControler pageController)
    {
        InitializeComponent();
        _pageController = pageController;
        BindingContext = _pageController;
    }

    protected override async void OnNavigatedTo(NavigatedToEventArgs args)
    {
        base.OnNavigatedTo(args);
        _headerSet = false;
        await _pageController.InitializeAsync(UserId ?? "me-001");
        UpdateSectionContent("stats");
    }

    private void NavigateToSection(object sender, EventArgs e)
    {
        if (sender is Button btn)
            UpdateSectionContent(btn.ClassId);
    }

    private void UpdateSectionContent(string? section)
    {
        if (!_headerSet)
        {
            HeaderCardHost.Content = _pageController.BuildHeaderView();
            _headerSet = true;
        }

        SectionContentHost.Content = section switch
        {
            "stats"     => _pageController.BuildStatsSectionView(),
            "reviews"   => _pageController.BuildReviewsSectionView(),
            "trips"     => _pageController.BuildPublishedTripsSectionView(),
            "recurring" => _pageController.BuildRecurringTripsSectionView(),
            _           => _pageController.BuildStatsSectionView()
        };
    }
}
