using UnityEngine;
using KingsDominos.Managers;
using KingsDominos.UI;
using KingsDominos.UI.Panels;

namespace KingsDominos
{
    public class LobbyManager : MonoBehaviour
    {
        private PanelManager _panelManager;

        private MainMenuPanel _mainMenu;
        private GameSelectionPanel _gameSelection;
        private ProfilePanel _profile;
        private SettingsPanel _settings;
        private ShopPanel _shop;
        private RewardsPanel _rewards;
        private FriendsPanel _friends;
        private TournamentsPanel _tournaments;

        private void Start()
        {
            Screen.orientation = ScreenOrientation.LandscapeLeft;
            Screen.autorotateToLandscapeLeft = true;
            Screen.autorotateToLandscapeRight = true;
            Screen.autorotateToPortrait = false;
            Screen.autorotateToPortraitUpsideDown = false;

            _panelManager = GetComponent<PanelManager>();
            if (_panelManager == null)
                _panelManager = gameObject.AddComponent<PanelManager>();

            AutoFindPanels();
            RegisterPanels();
            InitializePanels();

            _panelManager.ShowPanel("MainMenu", false);
        }

        private void AutoFindPanels()
        {
            _mainMenu = FindPanel<MainMenuPanel>("MainMenuPanel");
            _gameSelection = FindPanel<GameSelectionPanel>("GameSelectionPanel");
            _profile = FindPanel<ProfilePanel>("ProfilePanel");
            _settings = FindPanel<SettingsPanel>("SettingsPanel");
            _shop = FindPanel<ShopPanel>("ShopPanel");
            _rewards = FindPanel<RewardsPanel>("RewardsPanel");
            _friends = FindPanel<FriendsPanel>("FriendsPanel");
            _tournaments = FindPanel<TournamentsPanel>("TournamentsPanel");
        }

        private T FindPanel<T>(string name) where T : MonoBehaviour
        {
            var t = transform.Find(name);
            if (t == null)
            {
                // Try finding in children recursively
                foreach (Transform child in GetComponentsInChildren<Transform>(true))
                {
                    if (child.name == name)
                        return child.GetComponent<T>();
                }
                return null;
            }
            return t.GetComponent<T>();
        }

        private void RegisterPanels()
        {
            if (_mainMenu != null) _panelManager.Register("MainMenu", _mainMenu.GetComponent<PanelBase>());
            if (_gameSelection != null) _panelManager.Register("GameSelection", _gameSelection.GetComponent<PanelBase>());
            if (_profile != null) _panelManager.Register("Profile", _profile.GetComponent<PanelBase>());
            if (_settings != null) _panelManager.Register("Settings", _settings.GetComponent<PanelBase>());
            if (_shop != null) _panelManager.Register("Shop", _shop.GetComponent<PanelBase>());
            if (_rewards != null) _panelManager.Register("Rewards", _rewards.GetComponent<PanelBase>());
            if (_friends != null) _panelManager.Register("Friends", _friends.GetComponent<PanelBase>());
            if (_tournaments != null) _panelManager.Register("Tournaments", _tournaments.GetComponent<PanelBase>());
        }

        private void InitializePanels()
        {
            _mainMenu?.Initialize(_panelManager);
            _gameSelection?.Initialize(_panelManager);
            _profile?.Initialize(_panelManager);
            _settings?.Initialize(_panelManager);
            _shop?.Initialize(_panelManager);
            _rewards?.Initialize(_panelManager);
            _friends?.Initialize(_panelManager);
            _tournaments?.Initialize(_panelManager);
        }

        public void ShowMainMenu()
        {
            _panelManager.ClearHistory();
            _panelManager.ShowPanel("MainMenu", false);
        }

        public void RefreshAllUI()
        {
            _mainMenu?.RefreshUI();
            _shop?.RefreshGold();
        }
    }
}
