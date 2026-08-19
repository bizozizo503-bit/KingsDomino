using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace KingsDominos.UI.Panels
{
    public class TournamentsPanel : PanelBase
    {
        private Transform tournamentsList;
        private Button createButton;
        private Button backButton;

        private PanelManager _panelManager;
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();
            backButton?.onClick.AddListener(OnBackClicked);
            createButton?.onClick.AddListener(OnCreateTournament);
        }

        private void AutoWire()
        {
            if (_wired) return;
            backButton = GetChildButton("BackButton");
            createButton = GetChildButton("CreateButton");
            tournamentsList = transform.Find("TournamentsList");
            _wired = true;
        }

        private void OnCreateTournament()
        {
            Debug.Log("[Tournaments] Create tournament");
        }

        private void OnBackClicked() => _panelManager?.GoBack();

        private Button GetChildButton(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<Button>() : null;
        }
    }
}
