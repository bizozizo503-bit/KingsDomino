using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

namespace KingsDominos
{
    public class LobbyUIManager : MonoBehaviour
    {
        [Header("Lobby Settings")]
        [SerializeField] private string lobbyTitle = "ملوك الدومينو";

        [Header("Colors")]
        [SerializeField] private Color backgroundColor =
            new Color(0.035f, 0.015f, 0.08f, 1f);

        [SerializeField] private Color goldColor =
            new Color(1f, 0.72f, 0.12f, 1f);


        private GameObject mainMenuPanel;
        private GameObject lobbyPanel;

        private Button playButton;
        private Button quitButton;
        private Button backButton;
        private Button joinButton;
        private Button createButton;

        private TMP_Text coinsText;
        private TMP_Text statusText;

        private UIManager uiManager;
        private TMP_FontAsset arabicFont;


        private void Awake()
        {
            uiManager = GetComponent<UIManager>();

            if (uiManager == null)
                uiManager = gameObject.AddComponent<UIManager>();

            LoadArabicFont();
        }


        private void LoadArabicFont()
        {
            arabicFont =
                Resources.Load<TMP_FontAsset>(
                    "KingsDominosFonts/ArabicArial SDF"
                );

            if (arabicFont == null)
            {
                Debug.LogError(
                    "ArabicArial SDF NOT FOUND"
                );
            }
            else
            {
                Debug.Log(
                    "ArabicArial SDF loaded successfully"
                );
            }
        }


        private void Start()
        {
            BuildLobbyUI();
        }


        private void BuildLobbyUI()
        {
            Canvas canvas =
                GetComponentInChildren<Canvas>();

            if (canvas == null)
                canvas = CreateCanvas();

            EnsureEventSystem();

            BuildMainMenu(canvas.transform);
            BuildLobby(canvas.transform);

            uiManager.SetUIRefs(
                mainMenuPanel,
                lobbyPanel,
                coinsText,
                statusText
            );

            ConnectButtons();

            uiManager.ShowMainMenu();
        }


        private Canvas CreateCanvas()
        {
            GameObject obj =
                new GameObject(
                    "KingsDominosCanvas",
                    typeof(RectTransform),
                    typeof(Canvas),
                    typeof(CanvasScaler),
                    typeof(GraphicRaycaster)
                );

            obj.transform.SetParent(
                transform,
                false
            );

            Canvas canvas =
                obj.GetComponent<Canvas>();

            canvas.renderMode =
                RenderMode.ScreenSpaceOverlay;

            CanvasScaler scaler =
                obj.GetComponent<CanvasScaler>();

            scaler.uiScaleMode =
                CanvasScaler.ScaleMode.ScaleWithScreenSize;

            scaler.referenceResolution =
                new Vector2(1080, 1920);

            return canvas;
        }


        private TMP_Text CreateText(
            Transform parent,
            string name,
            string value,
            float size,
            Color color)
        {
            GameObject obj =
                new GameObject(
                    name,
                    typeof(RectTransform),
                    typeof(TextMeshProUGUI)
                );

            obj.transform.SetParent(
                parent,
                false
            );

            TMP_Text txt =
                obj.GetComponent<TMP_Text>();

            if (arabicFont != null)
                txt.font = arabicFont;

            txt.isRightToLeftText = true;

            txt.text = value;
            txt.fontSize = size;
            txt.color = color;

            txt.alignment =
                TextAlignmentOptions.Center;

            txt.fontStyle =
                FontStyles.Bold;

            txt.textWrappingMode =
                TextWrappingModes.NoWrap;

            return txt;
        }


        private GameObject CreatePanel(
            Transform parent,
            string name,
            Color color)
        {
            GameObject obj =
                new GameObject(
                    name,
                    typeof(RectTransform),
                    typeof(Image)
                );

            obj.transform.SetParent(
                parent,
                false
            );

            obj.GetComponent<Image>().color =
                color;

            return obj;
        }


        private Button CreateButton(
            Transform parent,
            string name,
            string label,
            Color color)
        {
            GameObject obj =
                new GameObject(
                    name,
                    typeof(RectTransform),
                    typeof(Image),
                    typeof(Button)
                );

            obj.transform.SetParent(
                parent,
                false
            );

            obj.GetComponent<Image>().color =
                color;

            Button btn =
                obj.GetComponent<Button>();

            CreateText(
                obj.transform,
                "Label",
                label,
                38,
                Color.white
            );

            return btn;
        }


        private void BuildMainMenu(Transform parent)
        {
            mainMenuPanel =
                CreatePanel(
                    parent,
                    "MainMenuPanel",
                    backgroundColor
                );

            CreateText(
                mainMenuPanel.transform,
                "Title",
                lobbyTitle,
                72,
                goldColor
            );

            coinsText =
                CreateText(
                    mainMenuPanel.transform,
                    "Coins",
                    "1,000",
                    40,
                    goldColor
                );

            playButton =
                CreateButton(
                    mainMenuPanel.transform,
                    "PlayButton",
                    "العب الآن",
                    goldColor
                );

            quitButton =
                CreateButton(
                    mainMenuPanel.transform,
                    "QuitButton",
                    "خروج",
                    Color.gray
                );
        }


        private void BuildLobby(Transform parent)
        {
            lobbyPanel =
                CreatePanel(
                    parent,
                    "LobbyPanel",
                    backgroundColor
                );

            statusText =
                CreateText(
                    lobbyPanel.transform,
                    "Status",
                    "أهلاً بك في ملوك الدومينو",
                    34,
                    Color.white
                );

            joinButton =
                CreateButton(
                    lobbyPanel.transform,
                    "JoinButton",
                    "انضم إلى لعبة",
                    Color.green
                );

            createButton =
                CreateButton(
                    lobbyPanel.transform,
                    "CreateButton",
                    "إنشاء غرفة",
                    goldColor
                );

            backButton =
                CreateButton(
                    lobbyPanel.transform,
                    "BackButton",
                    "رجوع",
                    Color.gray
                );

            lobbyPanel.SetActive(false);
        }


        private void ConnectButtons()
        {
            playButton.onClick.AddListener(
                uiManager.ShowLobby
            );

            quitButton.onClick.AddListener(
                uiManager.QuitGame
            );

            backButton.onClick.AddListener(
                uiManager.ShowMainMenu
            );

            joinButton.onClick.AddListener(
                uiManager.OnJoinGame
            );

            createButton.onClick.AddListener(
                uiManager.OnCreateGame
            );
        }


        private void EnsureEventSystem()
        {
            if (Object.FindObjectOfType<EventSystem>() != null)
                return;

            new GameObject(
                "EventSystem",
                typeof(EventSystem),
                typeof(StandaloneInputModule)
            );
        }
    }
}