using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;
using UnityEngine;

namespace KingsDominos.Network
{
    public enum ConnectionState
    {
        Disconnected,
        Connecting,
        Connected,
        Reconnecting
    }

    public class NetworkManager : MonoBehaviour
    {
        public static NetworkManager Instance { get; private set; }

        public ConnectionState State { get; private set; } = ConnectionState.Disconnected;
        public string Token { get; private set; }
        public string PlayerId { get; private set; }
        public bool IsConnected => State == ConnectionState.Connected;

        public event Action OnConnected;
        public event Action OnDisconnected;
        public event Action<string> OnError;
        public event Action<string, string> OnEvent;
        public event Action<ConnectionState> OnStateChanged;

        private SocketIoClient _socket;
        private string _wsUrl;
        private readonly Dictionary<string, List<Action<string>>> _handlers = new();

        private float _reconnectTimer;
        private int _reconnectAttempt;
        private const int MAX_RECONNECT = 5;
        private const float RECONNECT_BASE_DELAY = 1f;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Update()
        {
            if (_socket != null)
            {
                _socket.Update();
            }

            if (State == ConnectionState.Reconnecting)
            {
                _reconnectTimer -= Time.deltaTime;
                if (_reconnectTimer <= 0f)
                {
                    AttemptConnect();
                }
            }
        }

        public void Connect(string wsUrl, string token, string playerId)
        {
            _wsUrl = wsUrl;
            Token = token;
            PlayerId = playerId;
            _reconnectAttempt = 0;

            _socket = new SocketIoClient();
            _socket.OnConnected += HandleSocketConnected;
            _socket.OnEvent += HandleSocketEvent;
            _socket.OnClosed += HandleSocketClosed;
            _socket.OnError += HandleSocketError;

            AttemptConnect();
        }

        private void AttemptConnect()
        {
            SetState(ConnectionState.Connecting);

            var endpoint = _wsUrl;
            if (!endpoint.Contains("/socket.io"))
            {
                if (!endpoint.EndsWith("/"))
                    endpoint += "/";
                endpoint += "socket.io/?EIO=4&transport=websocket";
            }

            Debug.Log($"[NetworkManager] Connecting to {endpoint} (attempt {_reconnectAttempt})");
            _socket.Connect(endpoint, Token);
        }

        public void Disconnect()
        {
            _reconnectAttempt = MAX_RECONNECT;
            if (_socket != null)
            {
                _socket.OnConnected -= HandleSocketConnected;
                _socket.OnEvent -= HandleSocketEvent;
                _socket.OnClosed -= HandleSocketClosed;
                _socket.OnError -= HandleSocketError;
                _socket.Disconnect();
                _socket = null;
            }
            SetState(ConnectionState.Disconnected);
            OnDisconnected?.Invoke();
        }

        public void Emit(string eventName, string json = "{}")
        {
            if (!IsConnected || _socket == null)
            {
                Debug.LogWarning($"[NetworkManager] Cannot emit '{eventName}': not connected");
                return;
            }

            try
            {
                var payload = string.IsNullOrEmpty(json) ? new JObject() : JToken.Parse(json);
                _socket.Emit(eventName, payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[NetworkManager] Invalid payload for '{eventName}': {ex.Message}");
            }
        }

        public void On(string eventName, Action<string> callback)
        {
            if (!_handlers.ContainsKey(eventName))
                _handlers[eventName] = new List<Action<string>>();
            _handlers[eventName].Add(callback);
        }

        public void Off(string eventName, Action<string> callback)
        {
            if (_handlers.TryGetValue(eventName, out var list))
                list.Remove(callback);
        }

        public void EmitToRoom(string eventName, string roomId, string json = "{}")
        {
            if (!IsConnected) return;
            Emit(eventName, json);
        }

        public void ClearAllHandlers()
        {
            _handlers.Clear();
        }

        private void HandleSocketConnected()
        {
            _reconnectAttempt = 0;
            SetState(ConnectionState.Connected);
            OnConnected?.Invoke();
        }

        private void HandleSocketEvent(string name, JToken data)
        {
            var json = data == null ? "{}" : data.ToString();
            OnEvent?.Invoke(name, json);

            if (_handlers.TryGetValue(name, out var callbacks))
            {
                for (int i = 0; i < callbacks.Count; i++)
                {
                    try
                    {
                        callbacks[i]?.Invoke(json);
                    }
                    catch (Exception ex)
                    {
                        Debug.LogError($"[NetworkManager] Handler error for '{name}': {ex.Message}");
                    }
                }
            }
        }

        private void HandleSocketClosed()
        {
            if (_reconnectAttempt >= MAX_RECONNECT)
            {
                SetState(ConnectionState.Disconnected);
                OnDisconnected?.Invoke();
                return;
            }

            SetState(ConnectionState.Reconnecting);
            float delay = RECONNECT_BASE_DELAY * Mathf.Pow(2, _reconnectAttempt);
            _reconnectTimer = delay;
            _reconnectAttempt++;
            Debug.Log($"[NetworkManager] Reconnecting in {delay:F1}s (attempt {_reconnectAttempt})");
        }

        private void HandleSocketError(string message)
        {
            Debug.LogError($"[NetworkManager] Socket error: {message}");
            OnError?.Invoke(message);
        }

        private void SetState(ConnectionState newState)
        {
            if (State == newState) return;
            State = newState;
            OnStateChanged?.Invoke(newState);
        }

        private void OnDestroy()
        {
            if (_socket != null)
            {
                _socket.Disconnect();
            }
        }
    }
}