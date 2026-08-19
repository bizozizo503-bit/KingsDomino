using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

namespace KingsDominos.Editor
{
    public static class FinalLobbySceneBuilder
    {
        private const string ScenePath =
            "Assets/KingsDominos/Scenes/SC_Lobby.unity";

        private const string FontPath =
            "Assets/Resources/KingsDominosFonts/ArabicArial SDF.asset";

        [MenuItem("Tools/KingsDominos/FINAL BUILD LOBBY")]
        public static void Build()
        {
            Debug.Log("KingsDominos: Starting FINAL LOBBY BUILD...");

            var scene = EditorSceneManager.NewScene(
                NewSceneSetup.EmptyScene,
                NewSceneMode.Single
            );

            // Camera
            GameObject cameraObject = new GameObject(
                "Main Camera",
                typeof(Camera)
            );

            Camera camera = cameraObject.GetComponent<Camera>();
            camera.tag = "MainCamera";
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.035f, 0.015f, 0.08f, 1f);
            camera.orthographic = true;
            camera.orthographicSize = 5f;
            camera.transform.position = new Vector3(0, 0, -10);

            // EventSystem
            new GameObject(
                "EventSystem",
                typeof(EventSystem),
                typeof(StandaloneInputModule)
            );

            // Canvas
            GameObject canvasObject = new GameObject(
                "KingsDominosCanvas",
                typeof(Canvas),
                typeof(CanvasScaler),
                typeof(GraphicRaycaster)
            );

            Canvas canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            scaler.matchWidthOrHeight = 0.5f;

            // Main Menu
            GameObject mainMenu = new GameObject(
                "MainMenu",
                typeof(RectTransform)
            );

            mainMenu.transform.SetParent(canvasObject.transform, false);

            RectTransform mainRect =
                mainMenu.GetComponent<RectTransform>();

            mainRect.anchorMin = Vector2.zero;
            mainRect.anchorMax = Vector2.one;
            mainRect.offsetMin = Vector2.zero;
            mainRect.offsetMax = Vector2.zero;

            // Background
            Image background = mainMenu.AddComponent<Image>();
            background.color = new Color(0.035f, 0.015f, 0.08f, 1f);

            // Font
            TMP_FontAsset font =
                AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(FontPath);

            if (font == null)
            {
                Debug.LogError(
                    "KingsDominos: ArabicArial SDF not found: " +
                    FontPath
                );
            }

            // Title
            TMP_Text title = CreateText(
                "Title",
                mainMenu.transform,
                "ملوك الدومينو",
                font,
                92
            );

            SetRect(
                title.rectTransform,
                new Vector2(0.5f, 0.82f),
                new Vector2(0.5f, 0.82f),
                new Vector2(0, 0),
                new Vector2(900, 150)
            );

            title.alignment = TextAlignmentOptions.Center;

            // Coins
            TMP_Text coins = CreateText(
                "CoinsText",
                mainMenu.transform,
                "1,000",
                font,
                52
            );

            SetRect(
                coins.rectTransform,
                new Vector2(0.5f, 0.68f),
                new Vector2(0.5f, 0.68f),
                Vector2.zero,
                new Vector2(700, 100)
            );

            coins.alignment = TextAlignmentOptions.Center;

            // Status
            TMP_Text status = CreateText(
                "StatusText",
                mainMenu.transform,
                "أهلاً بك في ملوك الدومينو",
                font,
                42
            );

            SetRect(
                status.rectTransform,
                new Vector2(0.5f, 0.58f),
                new Vector2(0.5f, 0.58f),
                Vector2.zero,
                new Vector2(900, 100)
            );

            status.alignment = TextAlignmentOptions.Center;

            // Play button
            Button playButton = CreateButton(
                "PlayButton",
                mainMenu.transform,
                "ابدأ اللعب",
                font
            );

            SetRect(
                playButton.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.43f),
                new Vector2(0.5f, 0.43f),
                Vector2.zero,
                new Vector2(650, 150)
            );

            // Create room
            Button createButton = CreateButton(
                "CreateGameButton",
                mainMenu.transform,
                "إنشاء غرفة",
                font
            );

            SetRect(
                createButton.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.32f),
                new Vector2(0.5f, 0.32f),
                Vector2.zero,
                new Vector2(650, 150)
            );

            // Join game
            Button joinButton = CreateButton(
                "JoinGameButton",
                mainMenu.transform,
                "الانضمام إلى لعبة",
                font
            );

            SetRect(
                joinButton.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.21f),
                new Vector2(0.5f, 0.21f),
                Vector2.zero,
                new Vector2(650, 150)
            );

            // UI Manager
            GameObject manager =
                new GameObject("UIManager");

            UIManager uiManager =
                manager.AddComponent<global::KingsDominos.UIManager>();

            uiManager.SetUIRefs(
                mainMenu,
                null,
                coins,
                status
            );

            playButton.onClick.AddListener(
                uiManager.ShowLobby
            );

            createButton.onClick.AddListener(
                uiManager.OnCreateGame
            );

            joinButton.onClick.AddListener(
                uiManager.OnJoinGame
            );

            // Save
            EditorSceneManager.SaveScene(
                scene,
                ScenePath
            );

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log(
                "KingsDominos FINAL: Lobby created successfully."
            );
        }

        private static TMP_Text CreateText(
            string name,
            Transform parent,
            string text,
            TMP_FontAsset font,
            float size)
        {
            GameObject obj =
                new GameObject(
                    name,
                    typeof(RectTransform)
                );

            obj.transform.SetParent(parent, false);

            TMP_Text tmp =
                obj.AddComponent<TextMeshProUGUI>();

            tmp.text = text;
            tmp.fontSize = size;
            tmp.font = font;
            tmp.color = Color.white;
            tmp.enableWordWrapping = false;

            return tmp;
        }

        private static Button CreateButton(
            string name,
            Transform parent,
            string label,
            TMP_FontAsset font)
        {
            GameObject obj =
                new GameObject(
                    name,
                    typeof(RectTransform),
                    typeof(Image),
                    typeof(Button)
                );

            obj.transform.SetParent(parent, false);

            Image image =
                obj.GetComponent<Image>();

            image.color =
                new Color(0.18f, 0.08f, 0.38f, 1f);

            Button button =
                obj.GetComponent<Button>();

            TMP_Text text =
                CreateText(
                    "Label",
                    obj.transform,
                    label,
                    font,
                    44
                );

            RectTransform rect =
                text.rectTransform;

            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            text.alignment =
                TextAlignmentOptions.Center;

            return button;
        }

        private static void SetRect(
            RectTransform rect,
            Vector2 anchorMin,
            Vector2 anchorMax,
            Vector2 position,
            Vector2 size)
        {
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.anchoredPosition = position;
            rect.sizeDelta = size;
        }
    }
}
