using UnityEngine;
using System;
using System.Collections.Generic;

namespace KingsDominos.UI
{
    public class PanelManager : MonoBehaviour
    {
        private readonly Dictionary<string, PanelBase> _panels = new Dictionary<string, PanelBase>();
        private readonly Stack<string> _history = new Stack<string>();
        private string _currentPanelId;

        public string CurrentPanelId => _currentPanelId;

        public void Register(string id, PanelBase panel)
        {
            if (!_panels.ContainsKey(id))
                _panels[id] = panel;
        }

        public void ShowPanel(string panelId, bool addToHistory = true)
        {
            if (!_panels.ContainsKey(panelId))
            {
                Debug.LogWarning($"[PanelManager] Panel '{panelId}' not registered");
                return;
            }

            if (!string.IsNullOrEmpty(_currentPanelId) && _panels.ContainsKey(_currentPanelId))
            {
                _panels[_currentPanelId].Hide();
            }

            if (addToHistory && !string.IsNullOrEmpty(_currentPanelId))
            {
                _history.Push(_currentPanelId);
            }

            _currentPanelId = panelId;
            _panels[panelId].Show();
        }

        public void GoBack()
        {
            if (_history.Count > 0)
            {
                string previousId = _history.Pop();
                ShowPanel(previousId, false);
            }
        }

        public void ClearHistory()
        {
            _history.Clear();
        }

        public void HideAll()
        {
            foreach (var panel in _panels.Values)
                panel.Hide();
            _currentPanelId = null;
        }
    }
}
