using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;
using Microsoft.Maui.Controls.Shapes;

namespace Covoiturage_la_cite__App_Mobile_.Features.shell.views.components;

public partial class ShellTopBar : ContentView
{
    private ShellControler? _vm;

    public ShellTopBar()
    {
        InitializeComponent();
        _vm = IPlatformApplication.Current?.Services.GetService<ShellControler>();

        if (_vm != null)
        {
            _vm.PropertyChanged += Vm_PropertyChanged;
            RefreshBadge();
            RefreshTitle();
        }

        // Branche les gestes
        MenuTap.Tapped += (s, e) =>
            Shell.Current.FlyoutIsPresented = true;

        BellTap.Tapped += async (s, e) =>
        {
            if (_vm?.OpenNotificationsCommand.CanExecute(null) == true)
                _vm.OpenNotificationsCommand.Execute(null);
        };
    }

    private void Vm_PropertyChanged(object? sender,
        System.ComponentModel.PropertyChangedEventArgs e)
    {
        switch (e.PropertyName)
        {
            case nameof(ShellControler.NotificationCount):
            case nameof(ShellControler.HasNotifications):
            case nameof(ShellControler.NotificationBadgeText):
                MainThread.BeginInvokeOnMainThread(RefreshBadge);
                break;

            case nameof(ShellControler.PageTitle):
                MainThread.BeginInvokeOnMainThread(RefreshTitle);
                break;
        }
    }

    private void RefreshBadge()
    {
        if (_vm == null) return;
        BadgeFrame.IsVisible = _vm.HasNotifications;
        BadgeLabel.Text = _vm.NotificationBadgeText;

        // Élargit le badge pour "99+"
        BadgeFrame.WidthRequest = _vm.NotificationCount > 9 ? 22 : 18;

        // Correction : Utiliser le bon type RoundRectangle de Microsoft.Maui.Controls.Shapes
        BadgeFrame.StrokeShape = new RoundRectangle
        {
            CornerRadius = new CornerRadius(BadgeFrame.WidthRequest / 2)
        };
    }

    private void RefreshTitle()
    {
        if (_vm == null) return;
        TitleLabel.Text = _vm.PageTitle;
    }
}
