using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using KingsDominos.Core;
using KingsDominos.Managers;
using KingsDominos.Network;
using KingsDominos.Network.API;
using KingsDominos.UI;

namespace KingsDominos.Games.Domino
{
    public class DominoGame : GameBase
    {
        private const int MAX_PLAYERS = 2;

        private enum Screen
        {
            Login,
            Room,
            Game
        }

        private Canvas _canvas;
        private GameObject _loginPanel;
        private GameObject _roomPanel;
        private GameObject _gamePanel;
        private GameObject _overlayPanel;

        private TMP_InputField _nameField;
        private TMP_InputField _passField;
        private TMP_InputField _roomCodeField;
        private TMP_Text _statusText;
        private TMP_Text _roomInfoText;
        private TMP_Text _gameTopText;
        private TMP_Text _playersText;
        private TMP_Text _turnText;
        private TMP_Text _overlayTitle;
        private TMP_Text _overlayDetail;
        private Button _startButton;
        private Button _playButton;
        private Transform _handRoot;
        private Transform _boardRoot;

        private string _token = "";
        private string _myId = "";
        private string _myName = "";
        private string _roomCode = "";

        private JArray _hand = new JArray();
        private JArray _board = new JArray();
        private JArray _players = new JArray();
        private JObject _playerNames = new JObject();
        private string _currentPlayer = "";
        private int _selectedIndex = -1;
        private bool _roomReady;
        private bool _listenersAttached;

        protected override void Awake()
        {
            base.Awake();
            gameId = "domino";
            gameNameAr = "الدومينو الملكي";

            if (GameManager.Instance != null && GameManager.Instance.PlayerData != null)
            {
                var pd = GameManager.Instance.PlayerData;
                _token = pd.Token ?? "";
                _myId = pd.UserId ?? "";
                _myName = pd.Username ?? "";
            }
        }

        private void Start()
        {
            BuildUI();
            EnsureNetwork();

            if (!string.IsNullOrEmpty(_token) && !string.IsNullOrEmpty(_myId))
            {
                ShowScreen(Screen.Room);
            }
            else
            {
                ShowScreen(Screen.Login);
            }
        }

        private void EnsureNetwork()
        {
            if (NetworkManager.Instance == null)
            {
                var go = new GameObject("NetworkManager");
                go.AddComponent<NetworkManager>();
            }

            if (ApiClient.Instance == null)
            {
                var go = new GameObject("ApiClient");
                go.AddComponent<ApiClient>();
            }
        }

        private string HttpBase
        {
            get
            {
                var url = ApiClient.Instance != null ? ApiClient.Instance.baseUrl : "http://localhost:3000/api";
                return url.TrimEnd('/').Replace("/api", "");
            }
        }

        private string WsUrl
        {
            get
            {
                var config = GameConfig.Instance;
                return config != null ? config.wsUrl : "ws://localhost:3000";
            }
        }

        // ==================== UI BUILDING ====================

        private void BuildUI()
        {
            var canvasGO = new GameObject("DominoCanvas", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasGO.transform.SetParent(transform, false);
            _canvas = canvasGO.GetComponent<Canvas>();
            _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasGO.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            _loginPanel = BuildPanel("LoginPanel");
            _roomPanel = BuildPanel("RoomPanel");
            _gamePanel = BuildPanel("GamePanel");
            _overlayPanel = BuildOverlay();

            BuildLoginUI();
            BuildRoomUI();
            BuildGameUI();

            ShowScreen(Screen.Login);
        }

        private GameObject BuildPanel(string name)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(_canvas.transform, false);
            var rt = go.GetComponent<RectTransform>();
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(0.06f, 0.07f, 0.12f);
            return go;
        }

        private GameObject BuildOverlay()
        {
            var go = BuildPanel("OverlayPanel");
            go.GetComponent<Image>().color = new Color(0f, 0f, 0f, 0.75f);
            return go;
        }

        private void BuildLoginUI()
        {
            var title = ArabicFontHelper.CreateArabicText(_loginPanel.transform, "Title", "👑 ملوك الدومينو", 46, new Color(1f, 0.8f, 0.1f), true);
            SetRect(title.rectTransform, 0f, 0.75f, 1f, 0.9f);

            var subtitle = ArabicFontHelper.CreateArabicText(_loginPanel.transform, "Subtitle", "العب الدومينو أونلاين", 24, Color.white, true);
            SetRect(subtitle.rectTransform, 0f, 0.68f, 1f, 0.75f);

            _nameField = BuildInputField(_loginPanel.transform, "NameInput", "اسم المستخدم", 0.55f);
            _passField = BuildInputField(_loginPanel.transform, "PassInput", "كلمة المرور", 0.45f);
            _passField.contentType = TMP_InputField.ContentType.Password;

            var loginBtn = BuildButton(_loginPanel.transform, "LoginButton", "تسجيل الدخول", 0.35f, new Color(0.15f, 0.4f, 0.95f), OnLoginClicked);
            var registerBtn = BuildButton(_loginPanel.transform, "RegisterButton", "حساب جديد", 0.27f, new Color(0.1f, 0.6f, 0.35f), OnRegisterClicked);

            _statusText = ArabicFontHelper.CreateArabicText(_loginPanel.transform, "Status", "أدخل بياناتك ثم اضغط تسجيل الدخول", 20, new Color(0.75f, 0.75f, 0.75f), true);
            SetRect(_statusText.rectTransform, 0.1f, 0.06f, 0.9f, 0.15f);
        }

        private void BuildRoomUI()
        {
            var title = ArabicFontHelper.CreateArabicText(_roomPanel.transform, "Title", "غرفة الدومينو", 40, new Color(1f, 0.8f, 0.1f), true);
            SetRect(title.rectTransform, 0f, 0.86f, 1f, 0.95f);

            _roomCodeField = BuildInputField(_roomPanel.transform, "RoomCodeInput", "كود الغرفة", 0.72f);

            var createBtn = BuildButton(_roomPanel.transform, "CreateButton", "إنشاء غرفة", 0.6f, new Color(0.15f, 0.4f, 0.95f), OnCreateRoomClicked);
            var joinBtn = BuildButton(_roomPanel.transform, "JoinButton", "دخول غرفة", 0.5f, new Color(0.1f, 0.6f, 0.35f), OnJoinRoomClicked);

            _roomInfoText = ArabicFontHelper.CreateArabicText(_roomPanel.transform, "RoomInfo", "", 26, new Color(1f, 0.8f, 0.1f), true);
            SetRect(_roomInfoText.rectTransform, 0f, 0.32f, 1f, 0.42f);

            _playersText = ArabicFontHelper.CreateArabicText(_roomPanel.transform, "Players", "", 22, Color.white, true);
            SetRect(_playersText.rectTransform, 0f, 0.2f, 1f, 0.3f);

            _startButton = BuildButton(_roomPanel.transform, "StartButton", "بدء اللعبة", 0.06f, new Color(0.9f, 0.4f, 0.05f), OnStartClicked);
            _startButton.gameObject.SetActive(false);

            var backBtn = BuildButton(_roomPanel.transform, "BackButton", "رجوع", 0.01f, new Color(0.35f, 0.35f, 0.4f), OnBackClicked);
        }

        private void BuildGameUI()
        {
            var top = ArabicFontHelper.CreateArabicText(_gamePanel.transform, "TopBar", "", 22, Color.white, true);
            SetRect(top.rectTransform, 0f, 0.92f, 1f, 1f);
            _gameTopText = top;

            var boardBox = new GameObject("BoardBox", typeof(RectTransform), typeof(Image));
            boardBox.transform.SetParent(_gamePanel.transform, false);
            var brt = boardBox.GetComponent<RectTransform>();
            brt.anchorMin = new Vector2(0.05f, 0.32f);
            brt.anchorMax = new Vector2(0.95f, 0.85f);
            brt.offsetMin = Vector2.zero;
            brt.offsetMax = Vector2.zero;
            boardBox.GetComponent<Image>().color = new Color(0.08f, 0.3f, 0.12f);

            _boardRoot = new GameObject("BoardScroll", typeof(RectTransform)).transform;
            _boardRoot.SetParent(boardBox.transform, false);
            var br = _boardRoot.GetComponent<RectTransform>();
            br.anchorMin = Vector2.zero;
            br.anchorMax = Vector2.one;
            br.offsetMin = Vector2.zero;
            br.offsetMax = Vector2.zero;

            var turnLabel = ArabicFontHelper.CreateArabicText(_gamePanel.transform, "TurnLabel", "الطاولة", 18, new Color(0.8f, 0.9f, 0.8f), true);
            SetRect(turnLabel.rectTransform, 0.05f, 0.26f, 0.95f, 0.32f);
            _turnText = turnLabel;

            var handLabel = ArabicFontHelper.CreateArabicText(_gamePanel.transform, "HandLabel", "قطعك", 18, Color.white, true);
            SetRect(handLabel.rectTransform, 0.05f, 0.22f, 0.95f, 0.26f);

            var handBox = new GameObject("HandBox", typeof(RectTransform), typeof(Image));
            handBox.transform.SetParent(_gamePanel.transform, false);
            var hrt = handBox.GetComponent<RectTransform>();
            hrt.anchorMin = new Vector2(0.05f, 0.02f);
            hrt.anchorMax = new Vector2(0.95f, 0.2f);
            hrt.offsetMin = Vector2.zero;
            hrt.offsetMax = Vector2.zero;
            handBox.GetComponent<Image>().color = new Color(0.12f, 0.13f, 0.2f);

            _handRoot = new GameObject("HandScroll", typeof(RectTransform)).transform;
            _handRoot.SetParent(handBox.transform, false);
            var hr = _handRoot.GetComponent<RectTransform>();
            hr.anchorMin = Vector2.zero;
            hr.anchorMax = Vector2.one;
            hr.offsetMin = Vector2.zero;
            hr.offsetMax = Vector2.zero;

            _playButton = BuildButton(_gamePanel.transform, "PlayButton", "لعب القطعة", 0.07f, new Color(0.1f, 0.7f, 0.3f), OnPlayClicked);
            SetRect(_playButton.GetComponent<RectTransform>(), 0.05f, 0.07f, 0.95f, 0.16f);
        }

        private void SetRect(RectTransform rt, float x0, float y0, float x1, float y1)
        {
            rt.anchorMin = new Vector2(x0, y0);
            rt.anchorMax = new Vector2(x1, y1);
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        private TMP_InputField BuildInputField(Transform parent, string name, string placeholder, float anchorY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(TMP_InputField));
            go.transform.SetParent(parent, false);
            var rt = go.GetComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.25f, anchorY);
            rt.anchorMax = new Vector2(0.75f, anchorY + 0.08f);
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(1f, 1f, 1f);

            var field = go.GetComponent<TMP_InputField>();

            var area = new GameObject("TextArea", typeof(RectTransform)).GetComponent<RectTransform>();
            area.SetParent(rt, false);
            area.anchorMin = Vector2.zero;
            area.anchorMax = Vector2.one;
            area.offsetMin = new Vector2(10, 0);
            area.offsetMax = new Vector2(-10, 0);

            var textObj = new GameObject("Text", typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI));
            textObj.transform.SetParent(area, false);
            var textRect = textObj.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;
            var text = textObj.GetComponent<TextMeshProUGUI>();
            text.fontSize = 26;
            text.color = Color.black;

            var placeholderObj = new GameObject("Placeholder", typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI));
            placeholderObj.transform.SetParent(area, false);
            var phRect = placeholderObj.GetComponent<RectTransform>();
            phRect.anchorMin = Vector2.zero;
            phRect.anchorMax = Vector2.one;
            phRect.offsetMin = Vector2.zero;
            phRect.offsetMax = Vector2.zero;
            var phText = placeholderObj.GetComponent<TextMeshProUGUI>();
            phText.fontSize = 24;
            phText.color = new Color(0.4f, 0.4f, 0.4f);
            phText.text = placeholder;

            field.textViewport = area;
            field.textComponent = text;
            field.placeholder = phText;

            return field;
        }

        private Button BuildButton(Transform parent, string name, string label, float anchorY, Color color, Action onClick)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rt = go.GetComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.3f, anchorY);
            rt.anchorMax = new Vector2(0.7f, anchorY + 0.07f);
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = color;

            var text = ArabicFontHelper.CreateArabicText(go.transform, "Label", label, 24, Color.white, true);
            var tr = text.rectTransform;
            tr.anchorMin = Vector2.zero;
            tr.anchorMax = Vector2.one;
            tr.offsetMin = Vector2.zero;
            tr.offsetMax = Vector2.zero;

            var btn = go.GetComponent<Button>();
            btn.onClick.AddListener(() => onClick());
            return btn;
        }

        private GameObject BuildTile(Transform parent, int left, int right, bool interactive, Action<int> onTap = null, int index = -1, bool selected = false)
        {
            var go = new GameObject("Tile", typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rt = go.GetComponent<RectTransform>();
            rt.sizeDelta = new Vector2(90, 130);
            var img = go.GetComponent<Image>();
            img.color = selected ? new Color(1f, 0.85f, 0.2f) : new Color(0.95f, 0.95f, 0.95f);

            var leftText = ArabicFontHelper.CreateArabicText(go.transform, "Left", left.ToString(), 40, Color.black, true);
            var lr = leftText.rectTransform;
            lr.anchorMin = new Vector2(0f, 0.5f);
            lr.anchorMax = new Vector2(1f, 1f);
            lr.offsetMin = Vector2.zero;
            lr.offsetMax = Vector2.zero;

            var divider = new GameObject("Divider", typeof(RectTransform), typeof(Image));
            divider.transform.SetParent(go.transform, false);
            var dr = divider.GetComponent<RectTransform>();
            dr.anchorMin = new Vector2(0f, 0.47f);
            dr.anchorMax = new Vector2(1f, 0.53f);
            dr.offsetMin = Vector2.zero;
            dr.offsetMax = Vector2.zero;
            divider.GetComponent<Image>().color = new Color(0.2f, 0.2f, 0.2f);

            var rightText = ArabicFontHelper.CreateArabicText(go.transform, "Right", right.ToString(), 40, Color.black, true);
            var rr = rightText.rectTransform;
            rr.anchorMin = new Vector2(0f, 0f);
            rr.anchorMax = new Vector2(1f, 0.5f);
            rr.offsetMin = Vector2.zero;
            rr.offsetMax = Vector2.zero;

            var btn = go.GetComponent<Button>();
            btn.interactable = interactive;
            if (interactive && onTap != null)
            {
                var idx = index;
                btn.onClick.AddListener(() => onTap(idx));
            }

            return go;
        }

        // ==================== SCREEN MANAGEMENT ====================

        private void ShowScreen(Screen screen)
        {
            _loginPanel.SetActive(screen == Screen.Login);
            _roomPanel.SetActive(screen == Screen.Room);
            _gamePanel.SetActive(screen == Screen.Game);
            _overlayPanel.SetActive(false);
        }

        private void SetStatus(string message)
        {
            if (_statusText != null)
                ArabicFontHelper.SetText(_statusText, message);
        }

        // ==================== AUTH ====================

        private void OnLoginClicked()
        {
            Login(false);
        }

        private void OnRegisterClicked()
        {
            Login(true);
        }

        private void Login(bool register)
        {
            var username = _nameField.text.Trim();
            var password = _passField.text;

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                SetStatus("أدخل اسم المستخدم وكلمة المرور");
                return;
            }

            SetStatus("جاري الاتصال...");

            var payload = new JObject
            {
                ["username"] = username,
                ["password"] = password
            };
            if (register)
            {
                payload["display_name"] = username;
            }

            var endpoint = register ? "/auth/register" : "/auth/login";
            ApiClient.Instance.Post(
                endpoint,
                payload.ToString(Formatting.None),
                raw =>
                {
                    try
                    {
                        var data = JObject.Parse(raw);
                        _token = data["access_token"]?.ToString() ?? "";
                        var user = data["user"] as JObject;
                        _myId = user?["id"]?.ToString() ?? "";
                        _myName = user?["username"]?.ToString() ?? username;

                        if (GameManager.Instance != null)
                        {
                            var pd = GameManager.Instance.PlayerData;
                            pd.Token = _token;
                            pd.UserId = _myId;
                            pd.Username = _myName;
                            pd.Save();
                        }

                        ApiClient.Instance.AuthToken = _token;
                        SetStatus("");
                        ShowScreen(Screen.Room);
                    }
                    catch (Exception ex)
                    {
                        SetStatus("خطأ في تحليل الاستجابة: " + ex.Message);
                    }
                },
                err => SetStatus("فشل الاتصال بالسيرفر: " + err)
            );
        }

        // ==================== ROOM ====================

        private void OnCreateRoomClicked()
        {
            EnsureToken();
            var name = string.IsNullOrEmpty(_myName) ? "Player" : _myName;

            ApiClient.Instance.Post(
                "/rooms",
                new JObject { ["players"] = MAX_PLAYERS, ["name"] = name }.ToString(Formatting.None),
                raw =>
                {
                    try
                    {
                        var room = JObject.Parse(raw);
                        _roomCode = room["code"]?.ToString() ?? "";
                        _roomInfoText.text = "";
                        ArabicFontHelper.SetText(_roomInfoText, "الكود: " + _roomCode);
                        ConnectAndJoinRoom();
                    }
                    catch (Exception ex)
                    {
                        SetStatus("خطأ: " + ex.Message);
                    }
                },
                err => SetStatus("فشل إنشاء الغرفة: " + err)
            );
        }

        private void OnJoinRoomClicked()
        {
            EnsureToken();
            var code = _roomCodeField.text.Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(code))
            {
                SetStatus("اكتب كود الغرفة أولًا");
                return;
            }

            var name = string.IsNullOrEmpty(_myName) ? "Player" : _myName;

            ApiClient.Instance.Post(
                "/rooms/" + code + "/join",
                new JObject { ["name"] = name }.ToString(Formatting.None),
                raw =>
                {
                    try
                    {
                        var room = JObject.Parse(raw);
                        _roomCode = room["code"]?.ToString() ?? code;
                        ArabicFontHelper.SetText(_roomInfoText, "الكود: " + _roomCode);
                        ConnectAndJoinRoom();
                    }
                    catch (Exception ex)
                    {
                        SetStatus("خطأ: " + ex.Message);
                    }
                },
                err => SetStatus("فشل الدخول: " + err)
            );
        }

        private void OnStartClicked()
        {
            NetworkManager.Instance.Emit("startGame", new JObject { ["roomCode"] = _roomCode }.ToString(Formatting.None));
        }

        private void OnBackClicked()
        {
            if (NetworkManager.Instance != null)
            {
                if (!string.IsNullOrEmpty(_roomCode))
                    NetworkManager.Instance.Emit("leaveRoom", new JObject { ["roomCode"] = _roomCode }.ToString(Formatting.None));
                NetworkManager.Instance.Disconnect();
            }
            _roomCode = "";
            _players = new JArray();
            _hand = new JArray();
            _board = new JArray();
            ShowScreen(Screen.Login);
        }

        private void EnsureToken()
        {
            if (string.IsNullOrEmpty(_token))
            {
                SetStatus("يجب تسجيل الدخول أولًا");
                ShowScreen(Screen.Login);
                return;
            }
            if (ApiClient.Instance != null)
                ApiClient.Instance.AuthToken = _token;
        }

        // ==================== NETWORK ====================

        private void ConnectAndJoinRoom()
        {
            var nm = NetworkManager.Instance;
            if (!_listenersAttached)
            {
                nm.On("roomUpdated", HandleRoomUpdated);
                nm.On("gameStarted", HandleGameStarted);
                nm.On("dominoPlayed", HandleDominoPlayed);
                nm.On("gameOver", HandleGameOver);
                nm.On("gameError", HandleGameError);
                nm.OnConnected += OnSocketConnected;
                nm.OnDisconnected += OnSocketDisconnected;
                _listenersAttached = true;
            }

            nm.Connect(WsUrl, _token, _myId);
        }

        private void OnSocketConnected()
        {
            Debug.Log("[DominoGame] Socket connected, joining room");
            NetworkManager.Instance.Emit("joinRoom", new JObject
            {
                ["roomCode"] = _roomCode,
                ["name"] = string.IsNullOrEmpty(_myName) ? "Player" : _myName
            }.ToString(Formatting.None));
        }

        private void OnSocketDisconnected()
        {
            Debug.Log("[DominoGame] Socket disconnected");
        }

        private void HandleRoomUpdated(string json)
        {
            try
            {
                var room = JObject.Parse(json);
                _players = room["players"] as JArray ?? new JArray();
                _playerNames = room["playerNames"] as JObject ?? new JObject();
                _roomCode = room["code"]?.ToString() ?? _roomCode;
                var started = room["started"]?.Value<bool>() ?? false;

                var count = _players.Count;
                ArabicFontHelper.SetText(_roomInfoText, $"الكود: {_roomCode}   اللاعبون: {count}/{MAX_PLAYERS}");

                var sb = new System.Text.StringBuilder();
                foreach (var playerId in _players)
                {
                    var id = playerId.ToString();
                    var name = _playerNames[id]?.ToString() ?? id;
                    sb.AppendLine("• " + name + (id == _myId ? " (أنت)" : ""));
                }
                ArabicFontHelper.SetText(_playersText, sb.ToString());

                var isHost = room["host"]?.ToString() == _myId;
                _startButton.gameObject.SetActive(!started && isHost && count >= 2);
            }
            catch (Exception ex)
            {
                Debug.LogError("[DominoGame] roomUpdated parse error: " + ex.Message);
            }
        }

        private void HandleGameStarted(string json)
        {
            try
            {
                var data = JObject.Parse(json);
                _hand = data["hand"] as JArray ?? new JArray();
                _board = data["board"] as JArray ?? new JArray();
                _currentPlayer = data["currentPlayer"]?.ToString() ?? "";
                _players = data["players"] as JArray ?? _players;
                _playerNames = data["playerNames"] as JObject ?? _playerNames;

                _selectedIndex = -1;
                if (_gameTopText != null)
                    ArabicFontHelper.SetText(_gameTopText, "الغرفة: " + _roomCode);
                ShowScreen(Screen.Game);
                RenderBoard();
                RenderHand();
                RefreshTurn();
            }
            catch (Exception ex)
            {
                Debug.LogError("[DominoGame] gameStarted parse error: " + ex.Message);
            }
        }

        private void HandleDominoPlayed(string json)
        {
            try
            {
                var data = JObject.Parse(json);
                _board = data["board"] as JArray ?? _board;
                _currentPlayer = data["currentPlayer"]?.ToString() ?? _currentPlayer;

                var tile = data["tile"];
                if (tile != null && tile.Type != JTokenType.Null)
                {
                    var idx = _selectedIndex;
                    if (idx >= 0 && idx < _hand.Count)
                        _hand.RemoveAt(idx);
                    _selectedIndex = -1;
                }

                var winner = data["winner"]?.ToString();
                var blocked = data["blocked"]?.Value<bool>() ?? false;

                RenderBoard();
                RenderHand();

                if (!string.IsNullOrEmpty(winner) || blocked)
                {
                    ShowGameOverOverlay(winner, data["scores"] as JObject, blocked);
                }
                else
                {
                    RefreshTurn();
                }
            }
            catch (Exception ex)
            {
                Debug.LogError("[DominoGame] dominoPlayed parse error: " + ex.Message);
            }
        }

        private void HandleGameOver(string json)
        {
            try
            {
                var data = JObject.Parse(json);
                var winner = data["winner"]?.ToString();
                var blocked = data["blocked"]?.Value<bool>() ?? false;
                ShowGameOverOverlay(winner, data["scores"] as JObject, blocked);
            }
            catch (Exception ex)
            {
                Debug.LogError("[DominoGame] gameOver parse error: " + ex.Message);
            }
        }

        private void HandleGameError(string json)
        {
            try
            {
                var data = JObject.Parse(json);
                var msg = data["message"]?.ToString() ?? "خطأ في اللعبة";
                Debug.LogError("[DominoGame] Server error: " + msg);
                ArabicFontHelper.SetText(_turnText, "خطأ: " + msg);
            }
            catch { /* ignore */ }
        }

        // ==================== GAME RENDERING ====================

        private bool IsMyTurn => !string.IsNullOrEmpty(_currentPlayer) && _currentPlayer == _myId;

        private void RefreshTurn()
        {
            if (IsMyTurn)
            {
                ArabicFontHelper.SetText(_turnText, "دورك الآن — اختر قطعة واضغط لعب");
                _playButton.interactable = _selectedIndex >= 0;
            }
            else
            {
                var name = _playerNames[_currentPlayer]?.ToString() ?? _currentPlayer;
                ArabicFontHelper.SetText(_turnText, "دور " + name);
                _playButton.interactable = false;
            }
        }

        private void RenderBoard()
        {
            ClearChildren(_boardRoot);
            for (int i = 0; i < _board.Count; i++)
            {
                var t = _board[i] as JObject;
                if (t == null) continue;
                var left = t["left"]?.Value<int>() ?? 0;
                var right = t["right"]?.Value<int>() ?? 0;
                BuildTile(_boardRoot, left, right, false);
            }
        }

        private void RenderHand()
        {
            ClearChildren(_handRoot);
            for (int i = 0; i < _hand.Count; i++)
            {
                var t = _hand[i] as JObject;
                if (t == null) continue;
                var left = t["left"]?.Value<int>() ?? 0;
                var right = t["right"]?.Value<int>() ?? 0;
                BuildTile(_handRoot, left, right, true, OnTileTapped, i, i == _selectedIndex);
            }
        }

        private void OnTileTapped(int index)
        {
            _selectedIndex = index;
            RenderHand();
            RefreshTurn();
        }

        private void OnPlayClicked()
        {
            if (!IsMyTurn || _selectedIndex < 0) return;
            NetworkManager.Instance.Emit("playDomino", new JObject
            {
                ["roomCode"] = _roomCode,
                ["tileIndex"] = _selectedIndex
            }.ToString(Formatting.None));
        }

        private void ShowGameOverOverlay(string winner, JObject scores, bool blocked)
        {
            ShowScreen(Screen.Game);
            _overlayPanel.SetActive(true);

            if (_overlayTitle == null)
            {
                _overlayTitle = ArabicFontHelper.CreateArabicText(_overlayPanel.transform, "OverlayTitle", "", 38, new Color(1f, 0.8f, 0.1f), true);
                SetRect(_overlayTitle.rectTransform, 0f, 0.62f, 1f, 0.75f);

                _overlayDetail = ArabicFontHelper.CreateArabicText(_overlayPanel.transform, "OverlayDetail", "", 26, Color.white, true);
                SetRect(_overlayDetail.rectTransform, 0f, 0.35f, 1f, 0.55f);

                BuildButton(_overlayPanel.transform, "BackToRoom", "العودة", 0.18f, new Color(0.3f, 0.3f, 0.4f), OnBackClicked);
            }

            ArabicFontHelper.SetText(_overlayTitle, blocked ? "انتهت اللعبة (توقف)" : "🎉 انتهت اللعبة");

            if (!string.IsNullOrEmpty(winner))
            {
                var name = _playerNames[winner]?.ToString() ?? winner;
                ArabicFontHelper.SetText(_overlayDetail, "الفائز: " + name);
            }
            else
            {
                ArabicFontHelper.SetText(_overlayDetail, "لا يوجد فائز (تعادل)");
            }
        }

        private void ClearChildren(Transform parent)
        {
            for (int i = parent.childCount - 1; i >= 0; i--)
            {
                Destroy(parent.GetChild(i).gameObject);
            }
        }

        // ==================== GameBase overrides ====================

        public override void StartGame()
        {
            Debug.Log("[Domino] StartGame requested");
        }

        public override void HandleMove(string playerId, string action, object data)
        {
            Debug.Log($"[Domino] Move: {playerId} - {action}");
        }

        public override bool IsGameOver() => false;

        public override void Cleanup()
        {
            if (NetworkManager.Instance != null && !string.IsNullOrEmpty(_roomCode))
            {
                NetworkManager.Instance.Emit("leaveRoom", new JObject { ["roomCode"] = _roomCode }.ToString(Formatting.None));
            }
        }
    }
}