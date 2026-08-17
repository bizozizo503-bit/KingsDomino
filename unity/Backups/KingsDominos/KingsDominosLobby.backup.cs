using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;

#if UNITY_EDITOR
using UnityEditor;
#endif

namespace KingsDominos
{
    public class LobbyUIManager : MonoBehaviour
    {
        [SerializeField] private TMP_Text coinsText;

        private int coins = 1000;

        private void Start()
        {
            RefreshCoins();
        }

        public void RefreshCoins()
        {
            if (coinsText != null)
                coinsText.text = coins.ToString("N0");
        }

        public void PlayNow()
        {
            Debug.Log("KingsDominos: Play Now pressed.");
        }
    }

#if UNITY_EDITOR
    public static class KingsDominosLobbyBuilder
    {
        [MenuItem("KingsDominos/Create Royal Lobby")]
        public static void CreateRoyalLobby()
        {
            var scene = UnityEditor.SceneManagement.EditorSceneManager.NewScene(
                UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,
                UnityEditor.SceneManagement.NewSceneMode.Single
            );

            var navigation = new GameObject("NavigationManager");
            navigation.AddComponent<NavigationManager>();

            var canvasObject = new GameObject(
                "LobbyCanvas",
                typeof(Canvas),
                typeof(CanvasScaler),
                typeof(GraphicRaycaster)
            );

            var canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            scaler.matchWidthOrHeight = 0.5f;

            CreatePanel(
                canvasObject.transform,
                "RoyalBackground",
                new Color(0.035f, 0.015f, 0.08f, 1f),
                new Vector2(0, 0),
                new Vector2(1, 1),
                new Vector2(0, 0),
                new Vector2(0, 0)
            );

            var title = CreateText(
                canvasObject.transform,
                "Title",
                "KINGSDOMINOS",
                72,
                new Color(1f, 0.78f, 0.18f, 1f)
            );

            SetRect(title.rectTransform,
                new Vector2(0.05f, 0.78f),
                new Vector2(0.95f, 0.92f),
                Vector2.zero,
                Vector2.zero
            );

            var subtitle = CreateText(
                canvasObject.transform,
                "Subtitle",
                "قاعة الملوك",
                42,
                Color.white
            );

            SetRect(subtitle.rectTransform,
                new Vector2(0.05f, 0.70f),
                new Vector2(0.95f, 0.79f),
                Vector2.zero,
                Vector2.zero
            );

            var coinsLabel = CreateText(
                canvasObject.transform,
                "CoinsLabel",
                "🪙  1,000",
                38,
                new Color(1f, 0.82f, 0.25f, 1f)
            );

            SetRect(coinsLabel.rectTransform,
                new Vector2(0.20f, 0.58f),
                new Vector2(0.80f, 0.66f),
                Vector2.zero,
                Vector2.zero
            );

            var playButton = CreateButton(
                canvasObject.transform,
                "PlayNowButton",
                "العب الآن",
                46
            );

            SetRect(playButton.GetComponent<RectTransform>(),
                new Vector2(0.15f, 0.37f),
                new Vector2(0.85f, 0.49f),
                Vector2.zero,
                Vector2.zero
            );

            var uiManager = canvasObject.AddComponent<LobbyUIManager>();

            var coinsField = typeof(LobbyUIManager)
                .GetField("coinsText",
                    System.Reflection.BindingFlags.NonPublic |
                    System.Reflection.BindingFlags.Instance);

            coinsField?.SetValue(uiManager, coinsLabel);

            playButton.onClick.AddListener(uiManager.PlayNow);

            var eventSystem = new GameObject(
                "EventSystem",
                typeof(UnityEngine.EventSystems.EventSystem),
                typeof(UnityEngine.EventSystems.StandaloneInputModule)
            );

            UnityEditor.SceneManagement.EditorSceneManager.SaveScene(
                scene,
                "Assets/KingsDominos/Scenes/SC_Lobby.unity"
            );

            Selection.activeGameObject = canvasObject;

            Debug.Log("KingsDominos: SC_Lobby created successfully.");
        }

        private static GameObject CreatePanel(
            Transform parent,
            string name,
            Color color,
            Vector2 anchorMin,
            Vector2 anchorMax,
            Vector2 offsetMin,
            Vector2 offsetMax)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);

            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;

            go.GetComponent<Image>().color = color;

            return go;
        }

        private static TMP_Text CreateText(
            Transform parent,
            string name,
            string text,
            float size,
            Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(TextMeshProUGUI));
            go.transform.SetParent(parent, false);

            var tmp = go.GetComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = size;
            tmp.color = color;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.enableAutoSizing = false;

            return tmp;
        }

        private static Button CreateButton(
            Transform parent,
            string name,
            string label,
            float fontSize)
        {
            var go = new GameObject(
                name,
                typeof(RectTransform),
                typeof(Image),
                typeof(Button)
            );

            go.transform.SetParent(parent, false);

            var image = go.GetComponent<Image>();
            image.color = new Color(0.72f, 0.42f, 0.05f, 1f);

            var button = go.GetComponent<Button>();

            var text = CreateText(
                go.transform,
                "Label",
                label,
                fontSize,
                Color.white
            );

            SetRect(
                text.rectTransform,
                Vector2.zero,
                Vector2.one,
                Vector2.zero,
                Vector2.zero
            );

            return button;
        }

        private static void SetRect(
            RectTransform rect,
            Vector2 anchorMin,
            Vector2 anchorMax,
            Vector2 offsetMin,
            Vector2 offsetMax)
        {
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;
        }
    }
#endif
}
