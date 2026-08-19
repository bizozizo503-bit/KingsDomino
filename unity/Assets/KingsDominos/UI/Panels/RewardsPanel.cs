using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace KingsDominos.UI.Panels
{
    public class RewardsPanel : PanelBase
    {
        private Button claimDailyButton;
        private TMP_Text dailyStatusText;
        private TMP_Text streakText;
        private Transform achievementsGrid;
        private Button backButton;

        private PanelManager _panelManager;
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();
            backButton?.onClick.AddListener(OnBackClicked);
            claimDailyButton?.onClick.AddListener(OnClaimDaily);
        }

        private void AutoWire()
        {
            if (_wired) return;
            backButton = GetChildButton("BackButton");
            claimDailyButton = GetChildButton("ClaimDailyButton");
            dailyStatusText = GetChildText("DailyStatusText");
            streakText = GetChildText("StreakText");
            achievementsGrid = transform.Find("AchievementsGrid");
            _wired = true;
        }

        private void OnClaimDaily()
        {
            Debug.Log("[Rewards] Claim daily reward");
        }

        private void OnBackClicked() => _panelManager?.GoBack();

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
