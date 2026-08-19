using UnityEngine;
using TMPro;

namespace KingsDominos
{
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Player")]
        [SerializeField] private int startingCoins = 1000;

        [Header("Panels")]
        [SerializeField] private GameObject mainMenu;
        [SerializeField] private GameObject lobby;

        [Header("Texts")]
        [SerializeField] private TMP_Text coinsText;
        [SerializeField] private TMP_Text statusText;

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

            UpdateCoinsUI();
            ShowMainMenu();
        }

        public void SetUIRefs(
            GameObject mainMenu,
            GameObject lobby,
            TMP_Text coinsText,
            TMP_Text statusText)
        {
            this.mainMenu = mainMenu;
            this.lobby = lobby;
            this.coinsText = coinsText;
            this.statusText = statusText;

            UpdateCoinsUI();
        }

        public void ShowMainMenu()
        {
            if (mainMenu != null)
                mainMenu.SetActive(true);

            if (lobby != null)
                lobby.SetActive(false);

            SetStatus("أهلاً بك في ملوك الدومينو");
        }

        public void ShowLobby()
        {
            if (mainMenu != null)
                mainMenu.SetActive(false);

            if (lobby != null)
                lobby.SetActive(true);

            SetStatus("اختر طريقة اللعب");
        }

        public void OnJoinGame()
        {
            SetStatus("جاري البحث عن لعبة...");
            Debug.Log("KingsDominos: Join Game");
        }

        public void OnCreateGame()
        {
            SetStatus("جاري إنشاء الغرفة...");
            Debug.Log("KingsDominos: Create Game");
        }

        public void AddCoins(int amount)
        {
            if (amount <= 0)
                return;

            coins += amount;

            SaveCoins();
            UpdateCoinsUI();
        }

        public bool SpendCoins(int amount)
        {
            if (amount <= 0 || coins < amount)
                return false;

            coins -= amount;

            SaveCoins();
            UpdateCoinsUI();

            return true;
        }

        public int GetCoins()
        {
            return coins;
        }

        public void QuitGame()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        private void SaveCoins()
        {
            PlayerPrefs.SetInt("PlayerCoins", coins);
            PlayerPrefs.Save();
        }

        private void UpdateCoinsUI()
        {
            if (coinsText != null)
                coinsText.text = coins.ToString("N0");
        }

        private void SetStatus(string message)
        {
            if (statusText != null)
                statusText.text = message;
        }

        private void OnDestroy()
        {
            if (Instance == this)
                Instance = null;
        }
    }
}
