using UnityEngine;
using UnityEngine.UI;
using TMPro;
using KingsDominos.Managers;

namespace KingsDominos.UI.Panels
{
    public class ProfilePanel : PanelBase
    {
        private TMP_Text usernameText;
        private TMP_Text levelText;
        private TMP_Text xpText;
        private TMP_Text gamesPlayedText;
        private TMP_Text gamesWonText;
        private TMP_Text winRateText;

        private Button backButton;
        private Button editNameButton;

        private PanelManager _panelManager;
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();
            backButton?.onClick.AddListener(OnBackClicked);
            editNameButton?.onClick.AddListener(OnEditName);
            RefreshUI();
        }

        private void AutoWire()
        {
            if (_wired) return;
            backButton = GetChildButton("BackButton");
            editNameButton = GetChildButton("EditNameButton");
            usernameText = GetChildText("UsernameText");
            levelText = GetChildText("LevelText");
            xpText = GetChildText("XPText");
            gamesPlayedText = GetChildText("GamesPlayedText");
            gamesWonText = GetChildText("GamesWonText");
            winRateText = GetChildText("WinRateText");
            _wired = true;
        }

        public void RefreshUI()
        {
            AutoWire();
            var player = GameManager.Instance.PlayerData;

            ArabicFontHelper.SetText(usernameText, player.Username);
            ArabicFontHelper.SetText(levelText, $"المستوى {player.Level}");
            ArabicFontHelper.SetText(xpText, $"نقاط الخبرة: {player.XP}");
        }

        private void OnBackClicked() => _panelManager?.GoBack();
        private void OnEditName() { }

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
