using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace KingsDominos.UI.Panels
{
    public class FriendsPanel : PanelBase
    {
        private Button friendsTab;
        private Button requestsTab;
        private Button findTab;
        private Transform friendsList;
        private TMP_InputField searchInput;
        private Button searchButton;
        private Button backButton;

        private PanelManager _panelManager;
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();
            backButton?.onClick.AddListener(OnBackClicked);
        }

        private void AutoWire()
        {
            if (_wired) return;
            backButton = GetChildButton("BackButton");
            friendsTab = GetChildButton("FriendsTab");
            requestsTab = GetChildButton("RequestsTab");
            findTab = GetChildButton("FindTab");
            searchInput = GetChildInput("SearchInput");
            searchButton = GetChildButton("SearchButton");
            friendsList = transform.Find("FriendsList");
            _wired = true;
        }

        private void OnBackClicked() => _panelManager?.GoBack();

        private Button GetChildButton(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<Button>() : null;
        }

        private TMP_InputField GetChildInput(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<TMP_InputField>() : null;
        }
    }
}
