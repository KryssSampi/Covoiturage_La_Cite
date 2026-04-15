using System.Reflection;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Behaviors
{
    public static class ScrollChevron
    {
        public static readonly BindableProperty IsEnabledProperty =
            BindableProperty.CreateAttached(
                "IsEnabled",
                typeof(bool),
                typeof(ScrollChevron),
                false,
                propertyChanged: OnIsEnabledChanged);

        private static readonly BindableProperty StateProperty =
            BindableProperty.CreateAttached(
                "State",
                typeof(ChevronState),
                typeof(ScrollChevron),
                null);

        public static bool GetIsEnabled(BindableObject view) =>
            (bool)view.GetValue(IsEnabledProperty);

        public static void SetIsEnabled(BindableObject view, bool value) =>
            view.SetValue(IsEnabledProperty, value);

        private static void OnIsEnabledChanged(BindableObject bindable, object oldValue, object newValue)
        {
            if (newValue is true)
                Attach(bindable);
            else
                Detach(bindable);
        }

        private static ChevronState? GetState(BindableObject view) =>
            (ChevronState?)view.GetValue(StateProperty);

        private static void SetState(BindableObject view, ChevronState? state) =>
            view.SetValue(StateProperty, state);

        private static void Attach(BindableObject bindable)
        {
            var existing = GetState(bindable);
            if (existing != null)
            {
                if (existing.Host is null)
                    SetState(bindable, null);
                else
                    return;
            }

            if (bindable is ScrollView scrollView)
            {
                AttachScrollView(scrollView);
                return;
            }

            if (bindable is CollectionView collectionView)
            {
                AttachCollectionView(collectionView);
            }
        }

        private static void Detach(BindableObject bindable)
        {
            var state = GetState(bindable);
            if (state is null)
                return;

            if (state.ScrollView is not null)
            {
                if (state.ScrolledHandler is not null)
                    state.ScrollView.Scrolled -= state.ScrolledHandler;
                if (state.SizeChangedHandler is not null)
                    state.ScrollView.SizeChanged -= state.SizeChangedHandler;
                if (state.ContentSizeChangedHandler is not null && state.ScrollView.Content != null)
                    state.ScrollView.Content.SizeChanged -= state.ContentSizeChangedHandler;
                if (state.ParentChangedHandler is not null)
                    state.ScrollView.ParentChanged -= state.ParentChangedHandler;
            }

            if (state.CollectionView is not null)
            {
                if (state.ItemsScrolledHandler is not null)
                    state.CollectionView.Scrolled -= state.ItemsScrolledHandler;
                if (state.SizeChangedHandler is not null)
                    state.CollectionView.SizeChanged -= state.SizeChangedHandler;
                if (state.ParentChangedHandler is not null)
                    state.CollectionView.ParentChanged -= state.ParentChangedHandler;
            }

            if (state.Host is not null)
            {
                if (state.StartChevron is not null)
                    state.Host.Children.Remove(state.StartChevron);
                if (state.EndChevron is not null)
                    state.Host.Children.Remove(state.EndChevron);
            }

            SetState(bindable, null);
        }

        private static View? CreateChevronIcon(string materialIcon)
        {
            try
            {
                // Build a tiny XAML snippet that creates a MauiIcon from the registered provider.
                var xaml = $"<mi:MauiIcon xmlns=\"http://schemas.microsoft.com/dotnet/2021/maui\" xmlns:mi=\"http://www.aathifmahir.com/dotnet/2022/maui/icons\" Icon=\"{{mi:Material Icon={materialIcon}}}\" IconSize=\"16\" IconColor=\"#3D4A5C\" Opacity=\"0.35\" InputTransparent=\"True\" IsVisible=\"False\" />";

                // Attempt to locate the internal XamlLoader via reflection and invoke its Load method.
                Type? loaderType = null;
                foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
                {
                    try
                    {
                        loaderType = asm.GetType("Microsoft.Maui.Controls.Xaml.XamlLoader", throwOnError: false, ignoreCase: false);
                    }
                    catch
                    {
                        loaderType = null;
                    }
                    if (loaderType != null)
                        break;
                }

                if (loaderType != null)
                {
                    var loadMethod = loaderType.GetMethod(
                        "Load",
                        BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic,
                        binder: null,
                        types: new[] { typeof(string) },
                        modifiers: null);

                    if (loadMethod != null)
                    {
                        var obj = loadMethod.Invoke(null, new object[] { xaml });
                        return obj as View;
                    }
                }

                // If reflection failed, fall back to null so caller will use the Label fallback.
                return null;
            }
            catch
            {
                return null;
            }
        }

        private static void UpdateVisibility(ScrollView scrollView)
        {
            var state = GetState(scrollView);
            if (state?.StartChevron is null || state.EndChevron is null)
                return;

            var orientation = scrollView.Orientation == ScrollOrientation.Horizontal
                ? ScrollOrientation.Horizontal
                : ScrollOrientation.Vertical;

            double viewportWidth = scrollView.Width;
            double viewportHeight = scrollView.Height;
            double contentWidth = scrollView.Content?.Width ?? 0;
            double contentHeight = scrollView.Content?.Height ?? 0;

            if (orientation == ScrollOrientation.Horizontal)
            {
                bool canScroll = contentWidth > viewportWidth + 0.5;
                state.StartChevron.IsVisible = canScroll && scrollView.ScrollX > 0.5;
                state.EndChevron.IsVisible = canScroll && (scrollView.ScrollX + viewportWidth) < (contentWidth - 0.5);
            }
            else
            {
                bool canScroll = contentHeight > viewportHeight + 0.5;
                state.StartChevron.IsVisible = canScroll && scrollView.ScrollY > 0.5;
                state.EndChevron.IsVisible = canScroll && (scrollView.ScrollY + viewportHeight) < (contentHeight - 0.5);
            }
        }

        private static void UpdateVisibility(CollectionView collectionView)
        {
            var state = GetState(collectionView);
            if (state?.StartChevron is null || state.EndChevron is null)
                return;

            var orientation = GetItemsOrientation(collectionView.ItemsLayout);
            int count = GetItemsCount(collectionView.ItemsSource);

            if (count <= 0)
            {
                state.StartChevron.IsVisible = false;
                state.EndChevron.IsVisible = false;
                return;
            }

            int first = state.FirstVisibleIndex;
            int last = state.LastVisibleIndex;

            if (first < 0 || last < 0)
            {
                state.StartChevron.IsVisible = false;
                state.EndChevron.IsVisible = count > 1;
                return;
            }

            state.StartChevron.IsVisible = first > 0;
            state.EndChevron.IsVisible = last < count - 1;
        }

        private static void AttachScrollView(ScrollView scrollView)
        {
            if (GetState(scrollView) != null)
                return;

            // Choose material icons based on orientation
            var (startIcon, endIcon) = scrollView.Orientation == ScrollOrientation.Horizontal
                ? ("ChevronLeft", "ChevronRight")
                : ("KeyboardArrowUp", "KeyboardArrowDown");

            var startChevron = CreateChevronIcon(startIcon) ?? new Label();
            var endChevron = CreateChevronIcon(endIcon) ?? new Label();

            // Apply placement and margins similar to previous implementation
            if (scrollView.Orientation == ScrollOrientation.Horizontal)
            {
                startChevron.HorizontalOptions = LayoutOptions.Start;
                endChevron.HorizontalOptions = LayoutOptions.End;
                startChevron.VerticalOptions = LayoutOptions.Center;
                endChevron.VerticalOptions = LayoutOptions.Center;
                startChevron.Margin = new Thickness(6, 0);
                endChevron.Margin = new Thickness(6, 0);
            }
            else
            {
                startChevron.HorizontalOptions = LayoutOptions.Center;
                endChevron.HorizontalOptions = LayoutOptions.Center;
                startChevron.VerticalOptions = LayoutOptions.Start;
                endChevron.VerticalOptions = LayoutOptions.End;
                startChevron.Margin = new Thickness(0, 6);
                endChevron.Margin = new Thickness(0, 6);
            }

            if (!TryAddOverlay(scrollView, startChevron, endChevron, out var host, out var parentChanged))
                return;

            EventHandler<ScrolledEventArgs> scrolledHandler = (_, __) => UpdateVisibility(scrollView);
            EventHandler sizeChangedHandler = (_, __) => UpdateVisibility(scrollView);
            EventHandler contentSizeChangedHandler = (_, __) => UpdateVisibility(scrollView);

            scrollView.Scrolled += scrolledHandler;
            scrollView.SizeChanged += sizeChangedHandler;
            if (scrollView.Content != null)
                scrollView.Content.SizeChanged += contentSizeChangedHandler;

            SetState(scrollView, new ChevronState
            {
                Host = host,
                StartChevron = startChevron,
                EndChevron = endChevron,
                ScrollView = scrollView,
                ScrolledHandler = scrolledHandler,
                SizeChangedHandler = sizeChangedHandler,
                ContentSizeChangedHandler = contentSizeChangedHandler,
                ParentChangedHandler = parentChanged
            });

            UpdateVisibility(scrollView);
        }

        private static void AttachCollectionView(CollectionView collectionView)
        {
            if (GetState(collectionView) != null)
                return;

            var orientation = GetItemsOrientation(collectionView.ItemsLayout);
            var (startIcon, endIcon) = orientation == ItemsLayoutOrientation.Horizontal
                ? ("ChevronLeft", "ChevronRight")
                : ("KeyboardArrowUp", "KeyboardArrowDown");

            var startChevron = CreateChevronIcon(startIcon) ?? new Label();
            var endChevron = CreateChevronIcon(endIcon) ?? new Label();

            if (orientation == ItemsLayoutOrientation.Horizontal)
            {
                startChevron.HorizontalOptions = LayoutOptions.Start;
                endChevron.HorizontalOptions = LayoutOptions.End;
                startChevron.VerticalOptions = LayoutOptions.Center;
                endChevron.VerticalOptions = LayoutOptions.Center;
                startChevron.Margin = new Thickness(6, 0);
                endChevron.Margin = new Thickness(6, 0);
            }
            else
            {
                startChevron.HorizontalOptions = LayoutOptions.Center;
                endChevron.HorizontalOptions = LayoutOptions.Center;
                startChevron.VerticalOptions = LayoutOptions.Start;
                endChevron.VerticalOptions = LayoutOptions.End;
                startChevron.Margin = new Thickness(0, 6);
                endChevron.Margin = new Thickness(0, 6);
            }

            if (!TryAddOverlay(collectionView, startChevron, endChevron, out var host, out var parentChanged))
                return;

            EventHandler<ItemsViewScrolledEventArgs> scrolledHandler = (_, e) =>
            {
                var state = GetState(collectionView);
                if (state is null) return;
                state.FirstVisibleIndex = e.FirstVisibleItemIndex;
                state.LastVisibleIndex = e.LastVisibleItemIndex;
                UpdateVisibility(collectionView);
            };

            EventHandler sizeChangedHandler = (_, __) => UpdateVisibility(collectionView);

            collectionView.Scrolled += scrolledHandler;
            collectionView.SizeChanged += sizeChangedHandler;

            SetState(collectionView, new ChevronState
            {
                Host = host,
                StartChevron = startChevron,
                EndChevron = endChevron,
                CollectionView = collectionView,
                ItemsScrolledHandler = scrolledHandler,
                SizeChangedHandler = sizeChangedHandler,
                ParentChangedHandler = parentChanged
            });

            UpdateVisibility(collectionView);
        }

        private static bool TryAddOverlay(View view, View startChevron, View endChevron, out Grid? host, out EventHandler? parentChanged)
        {
            host = null;
            parentChanged = null;

            if (view.Parent is Grid grid)
            {
                host = grid;
                Grid.SetRow(startChevron, Grid.GetRow(view));
                Grid.SetColumn(startChevron, Grid.GetColumn(view));
                Grid.SetRowSpan(startChevron, Grid.GetRowSpan(view));
                Grid.SetColumnSpan(startChevron, Grid.GetColumn(view));

                Grid.SetRow(endChevron, Grid.GetRow(view));
                Grid.SetColumn(endChevron, Grid.GetColumn(view));
                Grid.SetRowSpan(endChevron, Grid.GetRowSpan(view));
                Grid.SetColumnSpan(endChevron, Grid.GetColumn(view));

                startChevron.ZIndex = 99;
                endChevron.ZIndex = 99;

                grid.Children.Add(startChevron);
                grid.Children.Add(endChevron);
                return true;
            }

            if (view.Parent is Layout layout)
            {
                int index = layout.Children.IndexOf(view);
                var wrapper = new Grid
                {
                    Margin = view.Margin,
                    HorizontalOptions = view.HorizontalOptions,
                    VerticalOptions = view.VerticalOptions,
                    HeightRequest = view.HeightRequest,
                    WidthRequest = view.WidthRequest,
                    MinimumHeightRequest = view.MinimumHeightRequest,
                    MinimumWidthRequest = view.MinimumWidthRequest,
                    MaximumHeightRequest = view.MaximumHeightRequest,
                    MaximumWidthRequest = view.MaximumWidthRequest
                };

                view.Margin = new Thickness(0);
                view.HorizontalOptions = LayoutOptions.Fill;
                view.VerticalOptions = LayoutOptions.Fill;

                layout.Children.Remove(view);
                wrapper.Children.Add(view);
                wrapper.Children.Add(startChevron);
                wrapper.Children.Add(endChevron);
                layout.Children.Insert(index, wrapper);

                startChevron.ZIndex = 99;
                endChevron.ZIndex = 99;
                host = wrapper;
                return true;
            }

            parentChanged = (_, __) =>
            {
                if (view.Parent is Grid or Layout)
                    Attach(view);
            };
            view.ParentChanged += parentChanged;
            SetState(view, new ChevronState { ParentChangedHandler = parentChanged });
            return false;
        }

        private static ItemsLayoutOrientation GetItemsOrientation(IItemsLayout? itemsLayout)
        {
            if (itemsLayout is LinearItemsLayout linear)
                return linear.Orientation;
            if (itemsLayout is GridItemsLayout grid)
                return grid.Orientation;
            return ItemsLayoutOrientation.Vertical;
        }

        private static int GetItemsCount(object? itemsSource)
        {
            if (itemsSource is System.Collections.ICollection c)
                return c.Count;
            if (itemsSource is System.Collections.IEnumerable e)
            {
                int count = 0;
                foreach (var _ in e)
                    count++;
                return count;
            }
            return -1;
        }

        private sealed class ChevronState
        {
            public Grid? Host { get; set; }
            public View? StartChevron { get; set; }
            public View? EndChevron { get; set; }
            public ScrollView? ScrollView { get; set; }
            public CollectionView? CollectionView { get; set; }
            public EventHandler<ScrolledEventArgs>? ScrolledHandler { get; set; }
            public EventHandler<ItemsViewScrolledEventArgs>? ItemsScrolledHandler { get; set; }
            public EventHandler? SizeChangedHandler { get; set; }
            public EventHandler? ContentSizeChangedHandler { get; set; }
            public EventHandler? ParentChangedHandler { get; set; }
            public int FirstVisibleIndex { get; set; } = -1;
            public int LastVisibleIndex { get; set; } = -1;
        }
    }
}
