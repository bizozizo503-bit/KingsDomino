using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace KingsDominos.UI.Panels
{
    public class ShopPanel : PanelBase
    {
        private TMP_Text headerText;
        private TMP_Text goldText;
        private Button backButton;
        private Button avatarsTab;
        private Button framesTab;
        private Button emotesTab;
        private Button boostsTab;
        private Transform itemsGrid;

        private PanelManager _panelManager;
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();
            backButton?.onClick.AddListener(OnBackClicked);
            if (headerText != null) headerText.text = "المتجر";
            RefreshGold();
        }

        private void AutoWire()
        {
            if (_wired) return;
            headerText = GetChildText("Header");
            goldText = GetChildText("GoldText");
            backButton = GetChildButton("BackButton");
            avatarsTab = GetChildButton("AvatarsTab");
            framesTab = GetChildButton("FramesTab");
            emotesTab = GetChildButton("EmotesTab");
            boostsTab = GetChildButton("BoostsTab");
            itemsGrid = transform.Find("ItemsGrid");
            _wired = true;
        }

        public void RefreshGold()
        {
            AutoWire();
            if (goldText != null)
                goldText.text = Managers.GameManager.Instance.PlayerData.Gold.ToString("N0");
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
