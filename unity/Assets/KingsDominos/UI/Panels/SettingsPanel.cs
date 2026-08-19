using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace KingsDominos.UI.Panels
{
    public class SettingsPanel : PanelBase
    {
        private Slider musicSlider;
        private Slider sfxSlider;
        private TMP_Text musicLabel;
        private TMP_Text sfxLabel;
        private Button backButton;
        private Button logoutButton;

        private PanelManager _panelManager;
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();

            backButton?.onClick.AddListener(OnBackClicked);
            logoutButton?.onClick.AddListener(OnLogout);

            if (musicSlider != null)
            {
                musicSlider.value = Managers.AudioManager.Instance.GetMusicVolume();
                musicSlider.onValueChanged.AddListener(OnMusicChanged);
            }

            if (sfxSlider != null)
            {
                sfxSlider.value = Managers.AudioManager.Instance.GetSFXVolume();
                sfxSlider.onValueChanged.AddListener(OnSFXChanged);
            }
        }

        private void AutoWire()
        {
            if (_wired) return;
            backButton = GetChildButton("BackButton");
            logoutButton = GetChildButton("LogoutButton");
            musicSlider = GetChildSlider("MusicSlider");
            sfxSlider = GetChildSlider("SFXSlider");
            musicLabel = GetChildText("MusicLabel");
            sfxLabel = GetChildText("SFXLabel");
            _wired = true;
        }

        private void OnMusicChanged(float val)
        {
            Managers.AudioManager.Instance.SetMusicVolume(val);
            if (musicLabel != null) musicLabel.text = $"الموسيقى: {(int)(val * 100)}%";
        }

        private void OnSFXChanged(float val)
        {
            Managers.AudioManager.Instance.SetSFXVolume(val);
            if (sfxLabel != null) sfxLabel.text = $"المؤثرات: {(int)(val * 100)}%";
        }

        private void OnBackClicked() => _panelManager?.GoBack();

        private void OnLogout()
        {
            Managers.GameManager.Instance.PlayerData.Clear();
            Managers.NavigationManager.Instance.GoToLobby();
        }

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

        private Slider GetChildSlider(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<Slider>() : null;
        }
    }
}
