#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using TMPro;

namespace KingsDominos.Editor
{
    public static class KingsDominosSceneBuilder
    {
        private const string ARABIC_FONT_PATH = "Assets/Resources/KingsDominosFonts/ArabicArial SDF.asset";
        private const string SCENE_PATH = "Assets/KingsDominos/Scenes/SC_Lobby.unity";

        private static TMP_FontAsset _arabicFont;
        private static Material _arabicFontMaterial;

        [MenuItem("KingsDominos/Build Lobby Scene", priority = 10)]
        public static void BuildLobbyScene()
        {
            _arabicFont = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(ARABIC_FONT_PATH);
            if (_arabicFont == null)
            {
                Debug.LogError($"[KingsDominos] Arabic font not found at {ARABIC_FONT_PATH}. Run Create GameConfig Asset first or import the font.");
                return;
            }
            _arabicFontMaterial = _arabicFont.material;

            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            ConfigureCamera();
            CreateManagers();
            CreateLobbyUI();
            CreateEventSystem();

            System.IO.Directory.CreateDirectory("Assets/KingsDominos/Scenes");
            EditorSceneManager.SaveScene(scene, SCENE_PATH);
            Debug.Log($"[KingsDominos] Lobby scene saved: {SCENE_PATH}");
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
            cam.transform.rotation = Quaternion.identity;
        }

        private static void CreateManagers()
        {
            var managers = new GameObject("--- MANAGERS ---");

            var gmObj = new GameObject("GameManager");
            gmObj.transform.SetParent(managers.transform);
            gmObj.AddComponent<Managers.GameManager>();
            gmObj.AddComponent<Managers.AudioManager>();
            gmObj.AddComponent<Network.NetworkManager>();
            gmObj.AddComponent<Managers.NavigationManager>();
        }

        private static void CreateLobbyUI()
        {
            var canvasObj = new GameObject("LobbyCanvas");
            var canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 0;

            var scaler = canvasObj.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            canvasObj.AddComponent<GraphicRaycaster>();

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

            canvasObj.AddComponent<LobbyManager>();
        }

        private static void CreateEventSystem()
        {
            if (Object.FindFirstObjectByType<EventSystem>() == null)
            {
                var es = new GameObject("EventSystem");
                es.AddComponent<EventSystem>();
                es.AddComponent<StandaloneInputModule>();
            }
        }

        private static void CreateBackground(Transform parent)
        {
            var bg = new GameObject("Background", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(parent, false);
            SetFullscreen(bg.GetComponent<RectTransform>());
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

        // --- Main Menu ---

        private static void CreateMainMenuPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "MainMenuPanel");
            panel.AddComponent<UI.Panels.MainMenuPanel>();

            var titleObj = CreateArabicText(panel.transform, "TitleText", "ملوك الدومينو", 72, Color.white, true);
            SetAnchored(titleObj.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.85f), new Vector2(0.5f, 0.85f),
                new Vector2(-400, -50), new Vector2(400, 50));

            CreateGoldText(panel.transform);

            var levelObj = CreateArabicText(panel.transform, "LevelText", "المستوى ١", 30, new Color(0.7f, 0.7f, 0.7f));
            SetAnchored(levelObj.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.72f), new Vector2(0.5f, 0.72f),
                new Vector2(-150, -20), new Vector2(150, 20));

            var usernameObj = CreateArabicText(panel.transform, "UsernameText", "لاعب", 26, new Color(0.6f, 0.6f, 0.6f));
            SetAnchored(usernameObj.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.66f), new Vector2(0.5f, 0.66f),
                new Vector2(-150, -15), new Vector2(150, 15));

            var playBtn = CreateButton(panel.transform, "PlayButton", "العب الآن", new Color(0.1f, 0.7f, 0.3f), 400, 90);
            SetAnchored(playBtn.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.42f), new Vector2(0.5f, 0.42f),
                new Vector2(-200, -45), new Vector2(200, 45));

            var shopBtn = CreateButton(panel.transform, "ShopButton", "المتجر", new Color(0.8f, 0.55f, 0.08f), 280, 65);
            SetAnchored(shopBtn.GetComponent<RectTransform>(),
                new Vector2(0.22f, 0.22f), new Vector2(0.22f, 0.22f),
                new Vector2(-140, -32), new Vector2(140, 32));

            var rewardsBtn = CreateButton(panel.transform, "RewardsButton", "المكافآت", new Color(0.18f, 0.08f, 0.38f), 280, 65);
            SetAnchored(rewardsBtn.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.22f), new Vector2(0.5f, 0.22f),
                new Vector2(-140, -32), new Vector2(140, 32));

            var friendsBtn = CreateButton(panel.transform, "FriendsButton", "الأصدقاء", new Color(0.18f, 0.08f, 0.38f), 280, 65);
            SetAnchored(friendsBtn.GetComponent<RectTransform>(),
                new Vector2(0.78f, 0.22f), new Vector2(0.78f, 0.22f),
                new Vector2(-140, -32), new Vector2(140, 32));

            var tournamentsBtn = CreateButton(panel.transform, "TournamentsButton", "البطولات", new Color(0.18f, 0.08f, 0.38f), 280, 65);
            SetAnchored(tournamentsBtn.GetComponent<RectTransform>(),
                new Vector2(0.22f, 0.08f), new Vector2(0.22f, 0.08f),
                new Vector2(-140, -32), new Vector2(140, 32));

            var profileBtn = CreateButton(panel.transform, "ProfileButton", "الملف الشخصي", new Color(0.18f, 0.08f, 0.38f), 280, 65);
            SetAnchored(profileBtn.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.08f), new Vector2(0.5f, 0.08f),
                new Vector2(-140, -32), new Vector2(140, 32));

            var settingsBtn = CreateButton(panel.transform, "SettingsButton", "الإعدادات", new Color(0.18f, 0.08f, 0.38f), 280, 65);
            SetAnchored(settingsBtn.GetComponent<RectTransform>(),
                new Vector2(0.78f, 0.08f), new Vector2(0.78f, 0.08f),
                new Vector2(-140, -32), new Vector2(140, 32));
        }

        // --- Game Selection ---

        private static void CreateGameSelectionPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "GameSelectionPanel");
            panel.AddComponent<UI.Panels.GameSelectionPanel>();
            panel.SetActive(false);

            CreateArabicText(panel.transform, "Header", "اختر اللعبة", 52, Color.white, true);
            var headerRect = panel.transform.Find("Header").GetComponent<RectTransform>();
            SetAnchored(headerRect,
                new Vector2(0.5f, 0.93f), new Vector2(0.5f, 0.93f),
                new Vector2(-300, -35), new Vector2(300, 35));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(),
                new Vector2(0.06f, 0.93f), new Vector2(0.06f, 0.93f),
                new Vector2(0, -30), new Vector2(180, 30));

            var tabs = CreatePanel(panel.transform, "Tabs");
            SetAnchored(tabs.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.85f), new Vector2(0.5f, 0.85f),
                new Vector2(-500, -25), new Vector2(500, 25));
            Object.DestroyImmediate(tabs.GetComponent<CanvasGroup>());

            var allTab = CreateButton(tabs.transform, "AllTab", "الكل", new Color(0.25f, 0.12f, 0.45f), 150, 45);
            SetAnchored(allTab.GetComponent<RectTransform>(),
                new Vector2(0.15f, 0.5f), new Vector2(0.15f, 0.5f),
                new Vector2(-75, -22), new Vector2(75, 22));
            var boardTab = CreateButton(tabs.transform, "BoardTab", "لوحية", new Color(0.15f, 0.08f, 0.3f), 150, 45);
            SetAnchored(boardTab.GetComponent<RectTransform>(),
                new Vector2(0.38f, 0.5f), new Vector2(0.38f, 0.5f),
                new Vector2(-75, -22), new Vector2(75, 22));
            var cardTab = CreateButton(tabs.transform, "CardTab", "ورق", new Color(0.15f, 0.08f, 0.3f), 150, 45);
            SetAnchored(cardTab.GetComponent<RectTransform>(),
                new Vector2(0.62f, 0.5f), new Vector2(0.62f, 0.5f),
                new Vector2(-75, -22), new Vector2(75, 22));
            var casualTab = CreateButton(tabs.transform, "CasualTab", "ترفيهية", new Color(0.15f, 0.08f, 0.3f), 150, 45);
            SetAnchored(casualTab.GetComponent<RectTransform>(),
                new Vector2(0.85f, 0.5f), new Vector2(0.85f, 0.5f),
                new Vector2(-75, -22), new Vector2(75, 22));

            var grid = new GameObject("GameGrid", typeof(RectTransform), typeof(GridLayoutGroup));
            grid.transform.SetParent(panel.transform, false);
            SetAnchored(grid.GetComponent<RectTransform>(),
                new Vector2(0.05f, 0.05f), new Vector2(0.95f, 0.78f),
                Vector2.zero, Vector2.zero);
            var glg = grid.GetComponent<GridLayoutGroup>();
            glg.cellSize = new Vector2(280, 180);
            glg.spacing = new Vector2(20, 20);
            glg.childAlignment = TextAnchor.MiddleCenter;
        }

        // --- Profile ---

        private static void CreateProfilePanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ProfilePanel");
            panel.AddComponent<UI.Panels.ProfilePanel>();
            panel.SetActive(false);

            CreateArabicText(panel.transform, "Header", "الملف الشخصي", 52, Color.white, true);
            var headerRect = panel.transform.Find("Header").GetComponent<RectTransform>();
            SetAnchored(headerRect,
                new Vector2(0.5f, 0.9f), new Vector2(0.5f, 0.9f),
                new Vector2(-300, -35), new Vector2(300, 35));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(),
                new Vector2(0.06f, 0.93f), new Vector2(0.06f, 0.93f),
                new Vector2(0, -30), new Vector2(180, 30));

            CreateArabicText(panel.transform, "UsernameText", "لاعب", 36, Color.white);
            SetAnchored(panel.transform.Find("UsernameText").GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.75f), new Vector2(0.5f, 0.75f),
                new Vector2(-200, -25), new Vector2(200, 25));
            CreateArabicText(panel.transform, "LevelText", "المستوى ١", 30, new Color(0.8f, 0.6f, 0.1f));
            SetAnchored(panel.transform.Find("LevelText").GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.65f), new Vector2(0.5f, 0.65f),
                new Vector2(-200, -20), new Vector2(200, 20));
            CreateArabicText(panel.transform, "XPText", "نقاط الخبرة: ٠", 28, new Color(0.7f, 0.7f, 0.7f));
            SetAnchored(panel.transform.Find("XPText").GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.55f), new Vector2(0.5f, 0.55f),
                new Vector2(-200, -20), new Vector2(200, 20));

            var editBtn = CreateButton(panel.transform, "EditNameButton", "تعديل الاسم", new Color(0.18f, 0.08f, 0.38f), 250, 55);
            SetAnchored(editBtn.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.4f), new Vector2(0.5f, 0.4f),
                new Vector2(-125, -27), new Vector2(125, 27));
        }

        // --- Settings ---

        private static void CreateSettingsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "SettingsPanel");
            panel.AddComponent<UI.Panels.SettingsPanel>();
            panel.SetActive(false);

            CreateArabicText(panel.transform, "Header", "الإعدادات", 52, Color.white, true);
            var headerRect = panel.transform.Find("Header").GetComponent<RectTransform>();
            SetAnchored(headerRect,
                new Vector2(0.5f, 0.9f), new Vector2(0.5f, 0.9f),
                new Vector2(-300, -35), new Vector2(300, 35));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(),
                new Vector2(0.06f, 0.93f), new Vector2(0.06f, 0.93f),
                new Vector2(0, -30), new Vector2(180, 30));

            CreateArabicText(panel.transform, "MusicLabel", "الموسيقى: 70%", 28, Color.white);
            SetAnchored(panel.transform.Find("MusicLabel").GetComponent<RectTransform>(),
                new Vector2(0.3f, 0.7f), new Vector2(0.3f, 0.7f),
                new Vector2(-200, -20), new Vector2(200, 20));

            var musicSlider = CreateSlider(panel.transform, "MusicSlider", 0.7f);
            SetAnchored(musicSlider.GetComponent<RectTransform>(),
                new Vector2(0.7f, 0.7f), new Vector2(0.7f, 0.7f),
                new Vector2(-200, -15), new Vector2(200, 15));

            CreateArabicText(panel.transform, "SFXLabel", "المؤثرات: 100%", 28, Color.white);
            SetAnchored(panel.transform.Find("SFXLabel").GetComponent<RectTransform>(),
                new Vector2(0.3f, 0.55f), new Vector2(0.3f, 0.55f),
                new Vector2(-200, -20), new Vector2(200, 20));

            var sfxSlider = CreateSlider(panel.transform, "SFXSlider", 1f);
            SetAnchored(sfxSlider.GetComponent<RectTransform>(),
                new Vector2(0.7f, 0.55f), new Vector2(0.7f, 0.55f),
                new Vector2(-200, -15), new Vector2(200, 15));

            var logoutBtn = CreateButton(panel.transform, "LogoutButton", "تسجيل خروج", new Color(0.6f, 0.15f, 0.15f), 280, 60);
            SetAnchored(logoutBtn.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.2f), new Vector2(0.5f, 0.2f),
                new Vector2(-140, -30), new Vector2(140, 30));
        }

        // --- Shop ---

        private static void CreateShopPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "ShopPanel");
            panel.AddComponent<UI.Panels.ShopPanel>();
            panel.SetActive(false);

            CreateArabicText(panel.transform, "Header", "المتجر", 52, Color.white, true);
            var headerRect = panel.transform.Find("Header").GetComponent<RectTransform>();
            SetAnchored(headerRect,
                new Vector2(0.5f, 0.93f), new Vector2(0.5f, 0.93f),
                new Vector2(-300, -35), new Vector2(300, 35));

            var goldObj = CreateArabicText(panel.transform, "GoldText", "٠", 36, new Color(1f, 0.72f, 0.12f));
            SetAnchored(goldObj.GetComponent<RectTransform>(),
                new Vector2(0.85f, 0.93f), new Vector2(0.85f, 0.93f),
                new Vector2(-100, -25), new Vector2(100, 25));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(),
                new Vector2(0.06f, 0.93f), new Vector2(0.06f, 0.93f),
                new Vector2(0, -30), new Vector2(180, 30));

            var grid = new GameObject("ItemsGrid", typeof(RectTransform), typeof(GridLayoutGroup));
            grid.transform.SetParent(panel.transform, false);
            SetAnchored(grid.GetComponent<RectTransform>(),
                new Vector2(0.05f, 0.05f), new Vector2(0.95f, 0.82f),
                Vector2.zero, Vector2.zero);
            var glg = grid.GetComponent<GridLayoutGroup>();
            glg.cellSize = new Vector2(250, 200);
            glg.spacing = new Vector2(15, 15);
            glg.childAlignment = TextAnchor.MiddleCenter;
        }

        // --- Rewards ---

        private static void CreateRewardsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "RewardsPanel");
            panel.AddComponent<UI.Panels.RewardsPanel>();
            panel.SetActive(false);

            CreateArabicText(panel.transform, "Header", "المكافآت", 52, Color.white, true);
            var headerRect = panel.transform.Find("Header").GetComponent<RectTransform>();
            SetAnchored(headerRect,
                new Vector2(0.5f, 0.93f), new Vector2(0.5f, 0.93f),
                new Vector2(-300, -35), new Vector2(300, 35));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(),
                new Vector2(0.06f, 0.93f), new Vector2(0.06f, 0.93f),
                new Vector2(0, -30), new Vector2(180, 30));

            CreateArabicText(panel.transform, "StreakText", "سلسلة المكافآت: يوم 1", 28, new Color(0.8f, 0.6f, 0.1f));
            SetAnchored(panel.transform.Find("StreakText").GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.8f), new Vector2(0.5f, 0.8f),
                new Vector2(-250, -20), new Vector2(250, 20));

            var claimBtn = CreateButton(panel.transform, "ClaimDailyButton", "المطالبة اليومية", new Color(0.1f, 0.7f, 0.3f), 350, 70);
            SetAnchored(claimBtn.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.65f), new Vector2(0.5f, 0.65f),
                new Vector2(-175, -35), new Vector2(175, 35));

            CreateArabicText(panel.transform, "DailyStatusText", "", 24, new Color(0.7f, 0.7f, 0.7f));
            SetAnchored(panel.transform.Find("DailyStatusText").GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.55f), new Vector2(0.5f, 0.55f),
                new Vector2(-250, -15), new Vector2(250, 15));

            var achGrid = new GameObject("AchievementsGrid", typeof(RectTransform), typeof(GridLayoutGroup));
            achGrid.transform.SetParent(panel.transform, false);
            SetAnchored(achGrid.GetComponent<RectTransform>(),
                new Vector2(0.05f, 0.05f), new Vector2(0.95f, 0.42f),
                Vector2.zero, Vector2.zero);
            var glg = achGrid.GetComponent<GridLayoutGroup>();
            glg.cellSize = new Vector2(420, 120);
            glg.spacing = new Vector2(15, 15);
            glg.childAlignment = TextAnchor.MiddleCenter;
        }

        // --- Friends ---

        private static void CreateFriendsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "FriendsPanel");
            panel.AddComponent<UI.Panels.FriendsPanel>();
            panel.SetActive(false);

            CreateArabicText(panel.transform, "Header", "الأصدقاء", 52, Color.white, true);
            var headerRect = panel.transform.Find("Header").GetComponent<RectTransform>();
            SetAnchored(headerRect,
                new Vector2(0.5f, 0.93f), new Vector2(0.5f, 0.93f),
                new Vector2(-300, -35), new Vector2(300, 35));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(),
                new Vector2(0.06f, 0.93f), new Vector2(0.06f, 0.93f),
                new Vector2(0, -30), new Vector2(180, 30));

            var tabs = CreatePanel(panel.transform, "FriendTabs");
            SetAnchored(tabs.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.84f), new Vector2(0.5f, 0.84f),
                new Vector2(-400, -22), new Vector2(400, 22));
            Object.DestroyImmediate(tabs.GetComponent<CanvasGroup>());

            var fTab = CreateButton(tabs.transform, "FriendsTab", "الأصدقاء", new Color(0.25f, 0.12f, 0.45f), 200, 40);
            SetAnchored(fTab.GetComponent<RectTransform>(),
                new Vector2(0.25f, 0.5f), new Vector2(0.25f, 0.5f),
                new Vector2(-100, -20), new Vector2(100, 20));
            var rTab = CreateButton(tabs.transform, "RequestsTab", "الطلبات", new Color(0.15f, 0.08f, 0.3f), 200, 40);
            SetAnchored(rTab.GetComponent<RectTransform>(),
                new Vector2(0.75f, 0.5f), new Vector2(0.75f, 0.5f),
                new Vector2(-100, -20), new Vector2(100, 20));

            var search = new GameObject("SearchInput", typeof(RectTransform), typeof(Image), typeof(TMP_InputField));
            search.transform.SetParent(panel.transform, false);
            SetAnchored(search.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.76f), new Vector2(0.5f, 0.76f),
                new Vector2(-350, -22), new Vector2(350, 22));
            search.GetComponent<Image>().color = new Color(0.12f, 0.06f, 0.22f);

            var friendsList = new GameObject("FriendsList", typeof(RectTransform));
            friendsList.transform.SetParent(panel.transform, false);
            SetAnchored(friendsList.GetComponent<RectTransform>(),
                new Vector2(0.05f, 0.05f), new Vector2(0.95f, 0.65f),
                Vector2.zero, Vector2.zero);
        }

        // --- Tournaments ---

        private static void CreateTournamentsPanel(Transform parent)
        {
            var panel = CreatePanel(parent, "TournamentsPanel");
            panel.AddComponent<UI.Panels.TournamentsPanel>();
            panel.SetActive(false);

            CreateArabicText(panel.transform, "Header", "البطولات", 52, Color.white, true);
            var headerRect = panel.transform.Find("Header").GetComponent<RectTransform>();
            SetAnchored(headerRect,
                new Vector2(0.5f, 0.93f), new Vector2(0.5f, 0.93f),
                new Vector2(-300, -35), new Vector2(300, 35));

            var backBtn = CreateButton(panel.transform, "BackButton", "رجوع", new Color(0.3f, 0.3f, 0.3f), 180, 50);
            SetAnchored(backBtn.GetComponent<RectTransform>(),
                new Vector2(0.06f, 0.93f), new Vector2(0.06f, 0.93f),
                new Vector2(0, -30), new Vector2(180, 30));

            var list = new GameObject("TournamentsList", typeof(RectTransform));
            list.transform.SetParent(panel.transform, false);
            SetAnchored(list.GetComponent<RectTransform>(),
                new Vector2(0.05f, 0.12f), new Vector2(0.95f, 0.82f),
                Vector2.zero, Vector2.zero);

            var createBtn = CreateButton(panel.transform, "CreateButton", "إنشاء بطولة", new Color(0.1f, 0.7f, 0.3f), 300, 65);
            SetAnchored(createBtn.GetComponent<RectTransform>(),
                new Vector2(0.5f, 0.04f), new Vector2(0.5f, 0.04f),
                new Vector2(-150, -30), new Vector2(150, 30));
        }

        // === Arabic Text Helpers ===

        private static GameObject CreateArabicText(Transform parent, string name, string value, float size, Color color, bool isTitle = false)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI));
            obj.transform.SetParent(parent, false);

            var txt = obj.GetComponent<TextMeshProUGUI>();
            txt.text = UI.ArabicTextShaper.Shape(value);
            txt.fontSize = size;
            txt.color = color;
            txt.fontStyle = FontStyles.Bold;
            txt.richText = true;
            txt.textWrappingMode = TextWrappingModes.NoWrap;
            txt.overflowMode = TextOverflowModes.Ellipsis;
            txt.parseCtrlCharacters = true;

            if (_arabicFont != null)
                txt.font = _arabicFont;
            if (_arabicFontMaterial != null)
                txt.fontSharedMaterial = _arabicFontMaterial;

            txt.isRightToLeftText = true;
            txt.characterSpacing = -5f;
            txt.horizontalAlignment = isTitle
                ? HorizontalAlignmentOptions.Center
                : HorizontalAlignmentOptions.Right;
            txt.verticalAlignment = VerticalAlignmentOptions.Middle;

            return obj;
        }

        private static GameObject CreateButton(Transform parent, string name, string label, Color bgColor, float width = 300, float height = 70)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(Button));
            obj.transform.SetParent(parent, false);
            obj.GetComponent<RectTransform>().sizeDelta = new Vector2(width, height);
            obj.GetComponent<Image>().color = bgColor;

            var labelObj = CreateArabicText(obj.transform, "Label", label, 28, Color.white);
            var lr = labelObj.GetComponent<RectTransform>();
            lr.anchorMin = Vector2.zero;
            lr.anchorMax = Vector2.one;
            lr.offsetMin = Vector2.zero;
            lr.offsetMax = Vector2.zero;
            labelObj.GetComponent<TextMeshProUGUI>().fontStyle = FontStyles.Bold;

            return obj;
        }

        private static void CreateGoldText(Transform parent)
        {
            var obj = CreateArabicText(parent, "GoldText", "١٢٬٥٠٠", 34, new Color(1f, 0.72f, 0.12f));
            SetAnchored(obj.GetComponent<RectTransform>(),
                new Vector2(0.85f, 0.93f), new Vector2(0.85f, 0.93f),
                new Vector2(-100, -25), new Vector2(100, 25));
        }

        private static GameObject CreateSlider(Transform parent, string name, float value)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(Slider));
            obj.transform.SetParent(parent, false);
            obj.GetComponent<RectTransform>().sizeDelta = new Vector2(400, 30);

            var bg = new GameObject("Background", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            bg.transform.SetParent(obj.transform, false);
            var bgRect = bg.GetComponent<RectTransform>();
            bgRect.anchorMin = new Vector2(0, 0.5f);
            bgRect.anchorMax = new Vector2(1, 0.5f);
            bgRect.sizeDelta = new Vector2(0, 8);
            bg.GetComponent<Image>().color = new Color(0.2f, 0.2f, 0.2f);

            var fill = new GameObject("Fill Area", typeof(RectTransform), typeof(CanvasRenderer));
            fill.transform.SetParent(obj.transform, false);
            var fillRect = fill.GetComponent<RectTransform>();
            fillRect.anchorMin = new Vector2(0, 0.5f);
            fillRect.anchorMax = new Vector2(1, 0.5f);
            fillRect.sizeDelta = new Vector2(-20, 8);

            var fillBar = new GameObject("Fill", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            fillBar.transform.SetParent(fill.transform, false);
            var fillBarRect = fillBar.GetComponent<RectTransform>();
            fillBarRect.anchorMin = Vector2.zero;
            fillBarRect.anchorMax = new Vector2(0, 1);
            fillBarRect.sizeDelta = new Vector2(0, 0);
            fillBar.GetComponent<Image>().color = new Color(0.8f, 0.55f, 0.08f);

            var handle = new GameObject("Handle Slide Area", typeof(RectTransform));
            handle.transform.SetParent(obj.transform, false);
            var handleRect = handle.GetComponent<RectTransform>();
            handleRect.anchorMin = Vector2.zero;
            handleRect.anchorMax = Vector2.one;
            handleRect.sizeDelta = Vector2.zero;

            var handleSlide = new GameObject("Handle", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            handleSlide.transform.SetParent(handle.transform, false);
            var handleSlideRect = handleSlide.GetComponent<RectTransform>();
            handleSlideRect.sizeDelta = new Vector2(20, 20);
            handleSlide.GetComponent<Image>().color = Color.white;

            var slider = obj.GetComponent<Slider>();
            slider.fillRect = fillRect;
            slider.handleRect = handleSlideRect;
            slider.targetGraphic = handleSlide.GetComponent<Image>();
            slider.value = value;

            return obj;
        }

        // === Layout Helpers ===

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
