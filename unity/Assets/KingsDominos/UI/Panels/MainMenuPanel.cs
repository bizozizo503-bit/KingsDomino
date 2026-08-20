using UnityEngine;
using UnityEngine.UI;
using TMPro;
using KingsDominos.Managers;

namespace KingsDominos.UI.Panels
{
    public class MainMenuPanel : PanelBase
    {
        private TMP_Text titleText;
        private TMP_Text goldText;
        private TMP_Text levelText;
        private TMP_Text usernameText;

        private Button playButton;
        private Button shopButton;
        private Button rewardsButton;
        private Button friendsButton;
        private Button tournamentsButton;
        private Button settingsButton;
        private Button profileButton;

        private PanelManager _panelManager;
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();
            BindButtons();
            RefreshUI();
        }

        private void AutoWire()
        {
            if (_wired) return;
            playButton = GetChildButton("PlayButton");
            shopButton = GetChildButton("ShopButton");
            rewardsButton = GetChildButton("RewardsButton");
            friendsButton = GetChildButton("FriendsButton");
            tournamentsButton = GetChildButton("TournamentsButton");
            settingsButton = GetChildButton("SettingsButton");
            profileButton = GetChildButton("ProfileButton");
            titleText = GetChildText("TitleText");
            goldText = GetChildText("GoldText");
            levelText = GetChildText("LevelText");
            usernameText = GetChildText("UsernameText");
            _wired = true;
        }

        private void BindButtons()
        {
            playButton?.onClick.AddListener(OnPlayClicked);
            shopButton?.onClick.AddListener(OnShopClicked);
            rewardsButton?.onClick.AddListener(OnRewardsClicked);
            friendsButton?.onClick.AddListener(OnFriendsClicked);
            tournamentsButton?.onClick.AddListener(OnTournamentsClicked);
            settingsButton?.onClick.AddListener(OnSettingsClicked);
            profileButton?.onClick.AddListener(OnProfileClicked);
        }

        public void RefreshUI()
        {
            AutoWire();
            var player = GameManager.Instance.PlayerData;

            ArabicFontHelper.SetText(titleText, "ملوك الدومينو");

            if (goldText != null)
                ArabicFontHelper.SetText(goldText, player.Gold.ToString("N0"));

            if (levelText != null)
                ArabicFontHelper.SetText(levelText, $"المستوى {player.Level}");

            if (usernameText != null)
                ArabicFontHelper.SetText(usernameText, player.Username);
        }

        private void OnPlayClicked() => _panelManager?.ShowPanel("GameSelection");
        private void OnShopClicked() => _panelManager?.ShowPanel("Shop");
        private void OnRewardsClicked() => _panelManager?.ShowPanel("Rewards");
        private void OnFriendsClicked() => _panelManager?.ShowPanel("Friends");
        private void OnTournamentsClicked() => _panelManager?.ShowPanel("Tournaments");
        private void OnSettingsClicked() => _panelManager?.ShowPanel("Settings");
        private void OnProfileClicked() => _panelManager?.ShowPanel("Profile");

        private Button GetChildButton(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<Button>() : null;
        }

        private TMP_Text GetChildText(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<TMP_Text>() : null;
        }
    }
}
