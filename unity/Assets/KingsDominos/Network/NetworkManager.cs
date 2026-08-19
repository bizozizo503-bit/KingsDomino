using System;
using System.Collections.Generic;
using System.Text;
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

    public class SocketEvent
    {
        public string Name;
        public string JsonPayload;
        public float Timestamp;
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

        private string _serverUrl;
        private readonly Dictionary<string, List<Action<string>>> _handlers = new();
        private readonly Queue<SocketEvent> _outgoing = new();
        private readonly Queue<SocketEvent> _incoming = new();
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
            ProcessIncoming();

            if (State == ConnectionState.Reconnecting)
            {
                _reconnectTimer -= Time.deltaTime;
                if (_reconnectTimer <= 0f)
                {
                    AttemptConnect();
                }
            }
        }

        public void Connect(string serverUrl, string token, string playerId)
        {
            _serverUrl = serverUrl;
            Token = token;
            PlayerId = playerId;
            _reconnectAttempt = 0;
            AttemptConnect();
        }

        private void AttemptConnect()
        {
            SetState(ConnectionState.Connecting);
            Debug.Log($"[NetworkManager] Connecting to {_serverUrl} (attempt {_reconnectAttempt})");

            // Socket.IO connection is handled by the SocketIO client library.
            // When connected, call OnConnected();
            // When disconnected, call HandleDisconnect();
            // When receiving data, enqueue to _incoming with ProcessIncoming() on main thread.

            // Placeholder: simulate connection for now
            SetState(ConnectionState.Connected);
            OnConnected?.Invoke();
        }

        public void Disconnect()
        {
            _reconnectAttempt = MAX_RECONNECT;
            SetState(ConnectionState.Disconnected);
            OnDisconnected?.Invoke();
        }

        public void Emit(string eventName, string json = "{}")
        {
            if (State != ConnectionState.Connected)
            {
                Debug.LogWarning($"[NetworkManager] Cannot emit '{eventName}': not connected");
                return;
            }

            var evt = new SocketEvent
            {
                Name = eventName,
                JsonPayload = json,
                Timestamp = Time.realtimeSinceStartup
            };
            _outgoing.Enqueue(evt);
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
            if (State != ConnectionState.Connected) return;
            Emit(eventName, json);
        }

        private void ProcessIncoming()
        {
            while (_incoming.Count > 0)
            {
                var evt = _incoming.Dequeue();
                DispatchEvent(evt.Name, evt.JsonPayload);
            }
        }

        private void DispatchEvent(string eventName, string json)
        {
            OnEvent?.Invoke(eventName, json);

            if (_handlers.TryGetValue(eventName, out var callbacks))
            {
                for (int i = 0; i < callbacks.Count; i++)
                {
                    try
                    {
                        callbacks[i]?.Invoke(json);
                    }
                    catch (Exception ex)
                    {
                        Debug.LogError($"[NetworkManager] Handler error for '{eventName}': {ex.Message}");
                    }
                }
            }
        }

        private void HandleDisconnect()
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

        private void SetState(ConnectionState newState)
        {
            if (State == newState) return;
            State = newState;
            OnStateChanged?.Invoke(newState);
        }

        public void EnqueueIncoming(string eventName, string json)
        {
            _incoming.Enqueue(new SocketEvent
            {
                Name = eventName,
                JsonPayload = json,
                Timestamp = Time.realtimeSinceStartup
            });
        }

        public void ClearAllHandlers()
        {
            _handlers.Clear();
        }
    }
}
