using Covoiturage_la_cite__App_Mobile_.Features.customshell.DisplayControler;

namespace Covoiturage_la_cite__App_Mobile_.Features.shell.views.ui;

public partial class SideNavHeader : ContentView
{
    private readonly ShellControler? _vm;

    public SideNavHeader()
    {
        InitializeComponent();
        // Récupère le ViewModel depuis le ServiceProvider
        _vm = IPlatformApplication.Current?.Services.GetService<ShellControler>();
        if (_vm != null)
        {
            _vm.PropertyChanged += Vm_PropertyChanged;
            Refresh();
        }
    }

    private void Vm_PropertyChanged(object? sender,
        System.ComponentModel.PropertyChangedEventArgs e)
    {
        if (e.PropertyName is nameof(ShellControler.UserName)
                           or nameof(ShellControler.UserEmail)
                           or nameof(ShellControler.UserAvatarUrl)
                           or nameof(ShellControler.UserInitials))
        {
            MainThread.BeginInvokeOnMainThread(Refresh);
        }
    }

    private void Refresh()
    {
        if (_vm == null) return;

        UserNameLabel.Text = _vm.UserName;
        UserEmailLabel.Text = _vm.UserEmail;
        InitialsLabel.Text = _vm.UserInitials;

        if (_vm.HasAvatar)
        {
            AvatarImage.Source = _vm.UserAvatarUrl;
            AvatarImageFrame.IsVisible = true;
        }
        else
        {
            AvatarImageFrame.IsVisible = false;
        }
    }
}
