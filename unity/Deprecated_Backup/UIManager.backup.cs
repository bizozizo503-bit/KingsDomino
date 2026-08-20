using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace KingsDominos
{
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Lobby")]
        [SerializeField] private Button playButton;
        [SerializeField] private TMP_Text coinsText;
        [SerializeField] private TMP_Text statusText;

        [Header("Player Data")]
        [SerializeField] private int startingCoins = 1000;

        private int coins;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
        }

        private void Start()
        {
            coins = PlayerPrefs.GetInt("PlayerCoins", startingCoins);
            RefreshCoins();

            if (playButton != null)
            {
                playButton.onClick.RemoveListener(OnPlayClicked);
                playButton.onClick.AddListener(OnPlayClicked);
            }

            SetStatus("مرحباً بك في قاعة الملوك");
        }

        private void OnDestroy()
        {
            if (playButton != null)
                playButton.onClick.RemoveListener(OnPlayClicked);
        }

        private void OnPlayClicked()
        {
            SetStatus("جاري تجهيز اللعبة...");

            Debug.Log("KingsDominos: Play Now clicked.");

            if (NavigationManager.Instance != null)
            {
                NavigationManager.Instance.ReloadCurrentScene();
            }
            else
            {
                Debug.LogWarning("KingsDominos: NavigationManager is not available.");
            }
        }

        public void AddCoins(int amount)
        {
            if (amount <= 0)
                return;

            coins += amount;
            SaveCoins();
            RefreshCoins();
        }

        public bool SpendCoins(int amount)
        {
            if (amount <= 0 || coins < amount)
                return false;

            coins -= amount;
            SaveCoins();
            RefreshCoins();

            return true;
        }

        public int GetCoins()
        {
            return coins;
        }

        private void RefreshCoins()
        {
            if (coinsText != null)
                coinsText.text = $"🪙 {coins:N0}";
        }

        public void SetStatus(string message)
        {
            if (statusText != null)
                statusText.text = message;
        }

        private void SaveCoins()
        {
            PlayerPrefs.SetInt("PlayerCoins", coins);
            PlayerPrefs.Save();
        }
    }
}
