using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

namespace KingsDominos
{
    public class LobbyUIManager : MonoBehaviour
    {
        [Header("Lobby Settings")]
        [SerializeField] private string lobbyTitle = "???? ????????";

        [Header("Colors")]
        [SerializeField]
        private Color backgroundColor =
            new Color(0.035f, 0.015f, 0.08f, 1f);

        [SerializeField]
        private Color goldColor =
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
            {
                uiManager = gameObject.AddComponent<UIManager>();
            }

            LoadArabicFont();
        }

        private void LoadArabicFont()
        {
            arabicFont = Resources.Load<TMP_FontAsset>(
                "ArabicArial SDF"
            );

            if (arabicFont == null)
            {
                Debug.LogError(
                    "? KingsDomino: ArabicArial SDF ??? ????? ???? Resources/Fonts."
                );
                return;
            }

            Debug.Log(
                "? KingsDomino: ArabicArial SDF ?? ??????."
            );

            if (arabicFont.material == null)
            {
                Debug.LogError(
                    "? KingsDomino: ArabicArial SDF ??? ?? Material."
                );
            }
        }

        private void Start()
        {
            BuildLobbyUI();
        }

        private void BuildLobbyUI()
        {
            Canvas canvas = GetComponent<Canvas>();

            if (canvas == null)
            {
                canvas = CreateCanvas();
            }

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

            Debug.Log(
                "? KingsDomino: Lobby UI built successfully."
            );
        }

        private Canvas CreateCanvas()
        {
            GameObject canvasObject = new GameObject(
                "KingsLobbyCanvas",
                typeof(RectTransform),
                typeof(Canvas),
                typeof(CanvasScaler),
                typeof(GraphicRaycaster)
            );

            canvasObject.transform.SetParent(
                transform,
                false
            );

            Canvas canvas =
                canvasObject.GetComponent<Canvas>();

            canvas.renderMode =
                RenderMode.ScreenSpaceOverlay;

            CanvasScaler scaler =
                canvasObject.GetComponent<CanvasScaler>();

            scaler.uiScaleMode =
                CanvasScaler.ScaleMode.ScaleWithScreenSize;

            scaler.referenceResolution =
                new Vector2(1080, 1920);

            scaler.matchWidthOrHeight = 0.5f;

            return canvas;
        }

        private void BuildMainMenu(Transform parent)
        {
            mainMenuPanel = CreatePanel(
                parent,
                "MainMenuPanel",
                backgroundColor
            );

            CreateText(
                mainMenuPanel.transform,
                "Title",
                lobbyTitle,
                72,
                goldColor,
                new Vector2(0, 520),
                new Vector2(700, 120)
            );

            coinsText = CreateText(
                mainMenuPanel.transform,
                "Coins",
                "1,000",
                40,
                goldColor,
                new Vector2(0, 300),
                new Vector2(500, 80)
            );

            playButton = CreateButton(
                mainMenuPanel.transform,
                "PlayButton",
                "???? ????",
                goldColor,
                new Vector2(360, 100),
                new Vector2(0, 80)
            );

            quitButton = CreateButton(
                mainMenuPanel.transform,
                "QuitButton",
                "????",
                new Color(0.25f, 0.25f, 0.25f, 1f),
                new Vector2(240, 70),
                new Vector2(0, -300)
            );
        }

        private void BuildLobby(Transform parent)
        {
            lobbyPanel = CreatePanel(
                parent,
                "LobbyPanel",
                backgroundColor
            );

            CreateText(
                lobbyPanel.transform,
                "LobbyTitle",
                "???? ????????",
                58,
                goldColor,
                new Vector2(0, 520),
                new Vector2(700, 100)
            );

            statusText = CreateText(
                lobbyPanel.transform,
                "Status",
                "???? ????!",
                34,
                Color.white,
                new Vector2(0, 350),
                new Vector2(700, 80)
            );

            joinButton = CreateButton(
                lobbyPanel.transform,
                "JoinButton",
                "???? ??? ??????",
                new Color(0.15f, 0.55f, 0.25f, 1f),
                new Vector2(400, 90),
                new Vector2(0, 100)
            );

            createButton = CreateButton(
                lobbyPanel.transform,
                "CreateButton",
                "???? ??????",
                goldColor,
                new Vector2(400, 90),
                new Vector2(0, -20)
            );

            backButton = CreateButton(
                lobbyPanel.transform,
                "BackButton",
                "????",
                new Color(0.25f, 0.25f, 0.25f, 1f),
                new Vector2(240, 70),
                new Vector2(0, -350)
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

        private GameObject CreatePanel(
            Transform parent,
            string objectName,
            Color color)
        {
            GameObject panel = new GameObject(
                objectName,
                typeof(RectTransform),
                typeof(Image)
            );

            panel.transform.SetParent(
                parent,
                false
            );

            RectTransform rect =
                panel.GetComponent<RectTransform>();

            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            Image image =
                panel.GetComponent<Image>();

            image.color = color;

            return panel;
        }

        private TMP_Text CreateText(
            Transform parent,
            string objectName,
            string text,
            float fontSize,
            Color color,
            Vector2 position,
            Vector2 size)
        {
            GameObject textObject = new GameObject(
                objectName,
                typeof(RectTransform),
                typeof(TextMeshProUGUI)
            );

            textObject.transform.SetParent(
                parent,
                false
            );

            RectTransform rect =
                textObject.GetComponent<RectTransform>();

            rect.anchorMin =
                new Vector2(0.5f, 0.5f);

            rect.anchorMax =
                new Vector2(0.5f, 0.5f);

            rect.anchoredPosition = position;
            rect.sizeDelta = size;

            TextMeshProUGUI textComponent =
                textObject.GetComponent<TextMeshProUGUI>();

            textComponent.text = text;
            textComponent.fontSize = fontSize;
            textComponent.color = color;

            textComponent.alignment =
                TextAlignmentOptions.Center;

            textComponent.fontStyle =
                FontStyles.Bold;

            ApplyArabicFont(textComponent);

            return textComponent;
        }

        private void ApplyArabicFont(TMP_Text textComponent)
        {
            if (arabicFont == null)
            {
                return;
            }

            textComponent.font = arabicFont;

            if (arabicFont.material != null)
            {
                textComponent.fontSharedMaterial =
                    arabicFont.material;
            }
        }

        private Button CreateButton(
            Transform parent,
            string objectName,
            string label,
            Color color,
            Vector2 size,
            Vector2 position)
        {
            GameObject buttonObject = new GameObject(
                objectName,
                typeof(RectTransform),
                typeof(Image),
                typeof(Button)
            );

            buttonObject.transform.SetParent(
                parent,
                false
            );

            RectTransform rect =
                buttonObject.GetComponent<RectTransform>();

            rect.anchorMin =
                new Vector2(0.5f, 0.5f);

            rect.anchorMax =
                new Vector2(0.5f, 0.5f);

            rect.anchoredPosition = position;
            rect.sizeDelta = size;

            Image image =
                buttonObject.GetComponent<Image>();

            image.color = color;

            Button button =
                buttonObject.GetComponent<Button>();

            button.targetGraphic = image;

            CreateText(
                buttonObject.transform,
                "Label",
                label,
                38,
                Color.white,
                Vector2.zero,
                size - new Vector2(20, 10)
            );

            return button;
        }

        private void EnsureEventSystem()
        {
            if (FindFirstObjectByType<EventSystem>() != null)
            {
                return;
            }

            new GameObject(
                "EventSystem",
                typeof(EventSystem),
                typeof(StandaloneInputModule)
            );

            Debug.Log(
                "? KingsDomino: EventSystem created."
            );
        }
    }
}
