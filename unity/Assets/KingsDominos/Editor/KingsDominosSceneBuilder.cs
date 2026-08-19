#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.UI;
using TMPro;

namespace KingsDominos.Editor
{
    public static class KingsDominosSceneBuilder
    {
        [MenuItem("KingsDominos/Build Lobby Scene", priority = 10)]
        public static void BuildLobbyScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            ConfigureCamera();

            CreateManagers();
            CreateLobbyUI();

            var path = "Assets/KingsDominos/Scenes/SC_Lobby.unity";
            System.IO.Directory.CreateDirectory("Assets/KingsDominos/Scenes");
            EditorSceneManager.SaveScene(scene, path);
            Debug.Log($"[KingsDominos] Lobby scene saved: {path}");
        }

        private static void ConfigureCamera()
        {
            var cam = Camera.main;
            if (cam == null) return;

            cam.orthographic = false;
            cam.fieldOfView = 60;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.035f, 0.015f, 0.08f, 1f);
            cam.transform.position = new Vector3(0, 0, -10);
        }

        private static void CreateManagers()
        {
            var managers = new GameObject("--- MANAGERS ---");

            var gmObj = new GameObject("GameManager", typeof(Managers.GameManager), typeof(Managers.AudioManager), typeof(Network.NetworkManager), typeof(Managers.NavigationManager));
            gmObj.transform.SetParent(managers.transform);

            var gm = gmObj.GetComponent<Managers.GameManager>();
        }

        private static void CreateLobbyUI()
        {
            var canvasObj = new GameObject("LobbyCanvas", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster), typeof(CanvasGroup));
            var canvas = canvasObj.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 0;

            var scaler = canvasObj.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            CreateEventSystem();

            CreateBackground(canvasObj.transform);

            var rootPanel = CreatePanel(canvasObj.transform, "RootPanel");
            rootPanel.AddComponent<UI.PanelManager>();

            CreateMainMenuPanel(rootPanel.transform);
            CreateGameSelectionPanel(rootPanel.transform);
            CreateProfilePanel(rootPanel.transform);
            CreateSettingsPanel(rootPanel.transform);
            CreateShopPanel(rootPanel.transform);
            CreateRewardsPanel(rootPanel.transform);
            CreateFriendsPanel(rootPanel.transform);
            CreateTournamentsPanel(rootPanel.transform);

            var lobbyMgr = canvasObj.AddComponent<LobbyManager>();
        }

        private static void CreateEventSystem()
        {
            if (Object.FindObjectOfType<UnityEngine.EventSystems.EventSystem>() == null)
            {
                var es = new GameObject("EventSystem", typeof(UnityEngine.EventSystems.EventSystem), typeof(UnityEngine.EventSystems.StandaloneInputModule));
            }
        }

        private static void CreateBackground(Transform parent)
        {
            var bg = new GameObject("Background", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(parent, false);

            var rect = bg.GetComponent<RectTransform>();
            SetFullscreen(rect);

            bg.GetComponent<Image>().color = new Color(0.035f, 0.015f, 0.08f, 1f);
        }

        private static GameObject CreatePanel(Transform parent, string name)
        {
            var panel = new GameObject(name, typeof(RectTransform), typeof(CanvasGroup));
            panel.transform.SetParent(parent, false);
            SetFullscreen(panel.GetComponent<RectTransform>());

            var cg = panel.GetComponent<CanvasGroup>();
            cg.alpha = 1f;
            cg.interactable = true;
            cg.blocksRaycasts = true;

            return panel;
        }

        private static void CreateMainMenuPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "MainMenuPanel");
            panel.AddComponent<UI.Panels.MainMenuPanel>();

            CreateGoldText(panel.transform);

            var playBtn = CreateButton(panel.transform, "PlayButton", "العب الآن", new Color(0.1f, 0.7f, 0.3f), 400, 80);
            SetAnchored(playBtn.GetComponent<RectTransform>(), new Vector2(0.5f, 0.4f), new Vector2(0.5f, 0.4f), new Vector2(-200, -40), new Vector2(200, 40));

            var shopBtn = CreateButton(panel.transform, "ShopButton", "المتجر", new Color(0.8f, 0.55f, 0.08f), 250, 60);
            SetAnchored(shopBtn.GetComponent<RectTransform>(), new Vector2(0.2f, 0.25f), new Vector2(0.2f, 0.25f), new Vector2(-125, -30), new Vector2(125, 30));

            var rewardsBtn = CreateButton(panel.transform, "RewardsButton", "المكافآت", new Color(0.18f, 0.08f, 0.38f), 250, 60);
            SetAnchored(rewardsBtn.GetComponent<RectTransform>(), new Vector2(0.5f, 0.25f), new Vector2(0.5f, 0.25f), new Vector2(-125, -30), new Vector2(125, 30));

            var friendsBtn = CreateButton(panel.transform, "FriendsButton", "الأصدقاء", new Color(0.18f, 0.08f, 0.38f), 250, 60);
            SetAnchored(friendsBtn.GetComponent<RectTransform>(), new Vector2(0.8f, 0.25f), new Vector2(0.8f, 0.25f), new Vector2(-125, -30), new Vector2(125, 30));

            var tournamentsBtn = CreateButton(panel.transform, "TournamentsButton", "البطولات", new Color(0.18f, 0.08f, 0.38f), 250, 60);
            SetAnchored(tournamentsBtn.GetComponent<RectTransform>(), new Vector2(0.2f, 0.1f), new Vector2(0.2f, 0.1f), new Vector2(-125, -30), new Vector2(125, 30));

            var settingsBtn = CreateButton(panel.transform, "SettingsButton", "الإعدادات", new Color(0.18f, 0.08f, 0.38f), 250, 60);
            SetAnchored(settingsBtn.GetComponent<RectTransform>(), new Vector2(0.8f, 0.1f), new Vector2(0.8f, 0.1f), new Vector2(-125, -30), new Vector2(125, 30));
        }

        private static void CreateGameSelectionPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "GameSelectionPanel");
            panel.AddComponent<UI.Panels.GameSelectionPanel>();
            panel.SetActive(false);

            var header = CreateText(panel.transform, "Header", "اختر اللعبة", 48, Color.white);
            SetAnchored(header.GetComponent<RectTransform>(), new Vector2(0.5f, 0.95f), new Vector2(0.5f, 0.95f), new Vector2(-300, -40), new Vector2(300, 0));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(), new Vector2(0.05f, 0.95f), new Vector2(0.05f, 0.95f), new Vector2(0, -40), new Vector2(180, 0));

            var grid = new GameObject("GameGrid", typeof(RectTransform), typeof(GridLayoutGroup));
            grid.transform.SetParent(panel.transform, false);
            var gridRect = grid.GetComponent<RectTransform>();
            SetAnchored(gridRect, new Vector2(0.05f, 0.05f), new Vector2(0.95f, 0.85f), Vector2.zero, Vector2.zero);

            var glg = grid.GetComponent<GridLayoutGroup>();
            glg.cellSize = new Vector2(280, 200);
            glg.spacing = new Vector2(20, 20);
            glg.childAlignment = TextAnchor.MiddleCenter;
        }

        private static void CreateProfilePanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ProfilePanel");
            panel.AddComponent<UI.Panels.ProfilePanel>();
            panel.SetActive(false);

            var header = CreateText(panel.transform, "Header", "الملف الشخصي", 48, Color.white);
            SetAnchored(header.GetComponent<RectTransform>(), new Vector2(0.5f, 0.9f), new Vector2(0.5f, 0.9f), new Vector2(-300, -40), new Vector2(300, 0));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(), new Vector2(0.05f, 0.95f), new Vector2(0.05f, 0.95f), new Vector2(0, -40), new Vector2(180, 0));
        }

        private static void CreateSettingsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "SettingsPanel");
            panel.AddComponent<UI.Panels.SettingsPanel>();
            panel.SetActive(false);

            var header = CreateText(panel.transform, "Header", "الإعدادات", 48, Color.white);
            SetAnchored(header.GetComponent<RectTransform>(), new Vector2(0.5f, 0.9f), new Vector2(0.5f, 0.9f), new Vector2(-300, -40), new Vector2(300, 0));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(), new Vector2(0.05f, 0.95f), new Vector2(0.05f, 0.95f), new Vector2(0, -40), new Vector2(180, 0));
        }

        private static void CreateShopPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ShopPanel");
            panel.AddComponent<UI.Panels.ShopPanel>();
            panel.SetActive(false);

            var header = CreateText(panel.transform, "Header", "المتجر", 48, Color.white);
            SetAnchored(header.GetComponent<RectTransform>(), new Vector2(0.5f, 0.95f), new Vector2(0.5f, 0.95f), new Vector2(-300, -40), new Vector2(300, 0));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(), new Vector2(0.05f, 0.95f), new Vector2(0.05f, 0.95f), new Vector2(0, -40), new Vector2(180, 0));
        }

        private static void CreateRewardsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "RewardsPanel");
            panel.AddComponent<UI.Panels.RewardsPanel>();
            panel.SetActive(false);

            var header = CreateText(panel.transform, "Header", "المكافآت", 48, Color.white);
            SetAnchored(header.GetComponent<RectTransform>(), new Vector2(0.5f, 0.95f), new Vector2(0.5f, 0.95f), new Vector2(-300, -40), new Vector2(300, 0));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(), new Vector2(0.05f, 0.95f), new Vector2(0.05f, 0.95f), new Vector2(0, -40), new Vector2(180, 0));
        }

        private static void CreateFriendsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "FriendsPanel");
            panel.AddComponent<UI.Panels.FriendsPanel>();
            panel.SetActive(false);

            var header = CreateText(panel.transform, "Header", "الأصدقاء", 48, Color.white);
            SetAnchored(header.GetComponent<RectTransform>(), new Vector2(0.5f, 0.95f), new Vector2(0.5f, 0.95f), new Vector2(-300, -40), new Vector2(300, 0));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(), new Vector2(0.05f, 0.95f), new Vector2(0.05f, 0.95f), new Vector2(0, -40), new Vector2(180, 0));
        }

        private static void CreateTournamentsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "TournamentsPanel");
            panel.AddComponent<UI.Panels.TournamentsPanel>();
            panel.SetActive(false);

            var header = CreateText(panel.transform, "Header", "البطولات", 48, Color.white);
            SetAnchored(header.GetComponent<RectTransform>(), new Vector2(0.5f, 0.95f), new Vector2(0.5f, 0.95f), new Vector2(-300, -40), new Vector2(300, 0));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(), new Vector2(0.05f, 0.95f), new Vector2(0.05f, 0.95f), new Vector2(0, -40), new Vector2(180, 0));
        }

        // --- Helpers ---

        private static GameObject CreateButton(Transform parent, string name, string label, Color bgColor, float width = 300, float height = 70)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            obj.transform.SetParent(parent, false);
            obj.GetComponent<RectTransform>().sizeDelta = new Vector2(width, height);
            obj.GetComponent<Image>().color = bgColor;

            var labelObj = new GameObject("Label", typeof(RectTransform), typeof(TextMeshProUGUI));
            labelObj.transform.SetParent(obj.transform, false);
            var txt = labelObj.GetComponent<TextMeshProUGUI>();
            txt.text = label;
            txt.fontSize = 26;
            txt.color = Color.white;
            txt.alignment = TextAlignmentOptions.Center;
            txt.fontStyle = FontStyles.Bold;

            var lr = labelObj.GetComponent<RectTransform>();
            lr.anchorMin = Vector2.zero;
            lr.anchorMax = Vector2.one;
            lr.offsetMin = Vector2.zero;
            lr.offsetMax = Vector2.zero;

            return obj;
        }

        private static GameObject CreateText(Transform parent, string name, string value, float size, Color color)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(TextMeshProUGUI));
            obj.transform.SetParent(parent, false);
            var txt = obj.GetComponent<TextMeshProUGUI>();
            txt.text = value;
            txt.fontSize = size;
            txt.color = color;
            txt.alignment = TextAlignmentOptions.Center;
            txt.fontStyle = FontStyles.Bold;
            return obj;
        }

        private static void CreateGoldText(Transform parent)
        {
            var obj = CreateText(parent, "GoldText", "💰 12,500", 32, new Color(1f, 0.72f, 0.12f));
            SetAnchored(obj.GetComponent<RectTransform>(), new Vector2(0.85f, 0.95f), new Vector2(0.85f, 0.95f), new Vector2(-100, -30), new Vector2(100, 0));
        }

        private static void SetFullscreen(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void SetAnchored(RectTransform rect, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
        {
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;
        }
    }
}
#endif
