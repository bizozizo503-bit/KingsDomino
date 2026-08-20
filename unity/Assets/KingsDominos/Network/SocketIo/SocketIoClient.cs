using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnityEngine;

namespace KingsDominos.Network
{
    /// <summary>
    /// Minimal Socket.IO v4 (Engine.IO EIO=4) client over System.Net.WebSockets.
    /// Supports the subset of the protocol needed by the KingsDomino MVP:
    /// connect with auth, emit events, receive events, ping/pong keepalive.
    /// </summary>
    public sealed class SocketIoClient : IDisposable
    {
        private const int ENGINE_OPEN = 0;
        private const int ENGINE_CLOSE = 1;
        private const int ENGINE_PING = 2;
        private const int ENGINE_PONG = 3;
        private const int ENGINE_MESSAGE = 4;

        private const int SIO_CONNECT = 0;
        private const int SIO_DISCONNECT = 1;
        private const int SIO_EVENT = 2;
        private const int SIO_ACK = 3;
        private const int SIO_CONNECT_ERROR = 4;

        private readonly ConcurrentQueue<Action> _mainThread = new();
        private readonly ConcurrentQueue<string> _sendQueue = new();

        private ClientWebSocket _ws;
        private CancellationTokenSource _cts;

        public bool IsConnected { get; private set; }
        public string SocketId { get; private set; }

        public event Action OnConnected;
        public event Action<string, JToken> OnEvent;
        public event Action OnClosed;
        public event Action<string> OnError;

        public void Connect(string url, string token)
        {
            tokenJson = token ?? string.Empty;
            _cts = new CancellationTokenSource();
            _ = Task.Run(() => ConnectAsync(url, token, _cts.Token));
        }

        public void Emit(string eventName, object payload)
        {
            if (!IsConnected)
            {
                Debug.LogWarning($"[SocketIoClient] Cannot emit '{eventName}': not connected");
                return;
            }

            var arr = new JArray(eventName, payload == null ? JValue.CreateNull() : JToken.FromObject(payload));
            _sendQueue.Enqueue("42" + arr.ToString(Formatting.None));
        }

        public void Disconnect()
        {
            if (_cts != null)
            {
                try { _cts.Cancel(); } catch { /* ignored */ }
            }
            SafeClose();
        }

        public void Update()
        {
            while (_mainThread.TryDequeue(out var action))
            {
                try { action(); }
                catch (Exception ex) { Debug.LogError($"[SocketIoClient] Handler error: {ex}"); }
            }
        }

        public void Dispose()
        {
            Disconnect();
        }

        private async Task ConnectAsync(string url, string token, CancellationToken ct)
        {
            try
            {
                _ws = new ClientWebSocket();
                await _ws.ConnectAsync(new Uri(url), ct);

                _mainThread.Enqueue(() =>
                {
                    Debug.Log($"[SocketIoClient] Engine.IO transport open: {url}");
                });

                _ = Task.Run(() => ReceiveLoop(ct));
                _ = Task.Run(() => SendLoop(ct));
            }
            catch (Exception ex)
            {
                _mainThread.Enqueue(() => OnError?.Invoke($"Connection failed: {ex.Message}"));
            }
        }

        private async Task SendLoop(CancellationToken ct)
        {
            try
            {
                while (!ct.IsCancellationRequested)
                {
                    while (_sendQueue.TryDequeue(out var msg))
                    {
                        if (_ws == null || _ws.State != WebSocketState.Open) return;
                        var bytes = Encoding.UTF8.GetBytes(msg);
                        await _ws.SendAsync(bytes, WebSocketMessageType.Text, true, ct);
                    }
                    await Task.Delay(20, ct);
                }
            }
            catch { /* cancelled */ }
        }

        private async Task ReceiveLoop(CancellationToken ct)
        {
            var buffer = new byte[8192];
            var builder = new StringBuilder();

            try
            {
                while (!ct.IsCancellationRequested && _ws != null && _ws.State == WebSocketState.Open)
                {
                    builder.Clear();
                    WebSocketReceiveResult result;
                    do
                    {
                        result = await _ws.ReceiveAsync(new ArraySegment<byte>(buffer), ct);
                        if (result.MessageType == WebSocketMessageType.Close)
                        {
                            _mainThread.Enqueue(HandleServerClose);
                            return;
                        }
                        builder.Append(Encoding.UTF8.GetString(buffer, 0, result.Count));
                    } while (!result.EndOfMessage);

                    var text = builder.ToString();
                    var packetType = text.Length > 0 ? text[0] - '0' : -1;

                    switch (packetType)
                    {
                        case ENGINE_OPEN:
                            _mainThread.Enqueue(() =>
                            {
                                try
                                {
                                    var open = JObject.Parse(text.Substring(1));
                                    SocketId = open["sid"]?.ToString();
                                    _sendQueue.Enqueue("40" + (tokenJson.Length > 0 ? tokenJson : ""));
                                }
                                catch (Exception ex)
                                {
                                    OnError?.Invoke($"Bad open packet: {ex.Message}");
                                }
                            });
                            break;

                        case ENGINE_PING:
                            _sendQueue.Enqueue("3");
                            break;

                        case ENGINE_PONG:
                            // ignore
                            break;

                        case ENGINE_MESSAGE:
                            if (text.Length < 2)
                            {
                                _mainThread.Enqueue(() => OnError?.Invoke("Malformed message packet"));
                                break;
                            }
                            var sioType = text[1] - '0';
                            var payload = text.Substring(2);

                            switch (sioType)
                            {
                                case SIO_CONNECT:
                                    _mainThread.Enqueue(() =>
                                    {
                                        IsConnected = true;
                                        Debug.Log($"[SocketIoClient] Socket.IO connected (sid={SocketId})");
                                        OnConnected?.Invoke();
                                    });
                                    break;

                                case SIO_CONNECT_ERROR:
                                    _mainThread.Enqueue(() => OnError?.Invoke($"Socket.IO connect error: {payload}"));
                                    break;

                                case SIO_DISCONNECT:
                                    _mainThread.Enqueue(HandleServerClose);
                                    break;

                                case SIO_EVENT:
                                    _mainThread.Enqueue(() =>
                                    {
                                        try
                                        {
                                            var arr = JArray.Parse(payload);
                                            var name = arr[0]?.ToString();
                                            var data = arr.Count > 1 ? arr[1] : JValue.CreateNull();
                                            if (!string.IsNullOrEmpty(name))
                                            {
                                                Debug.Log($"[SocketIoClient] EVENT {name}");
                                                OnEvent?.Invoke(name, data);
                                            }
                                        }
                                        catch (Exception ex)
                                        {
                                            OnError?.Invoke($"Bad event packet: {ex.Message}");
                                        }
                                    });
                                    break;

                                case SIO_ACK:
                                    // no ack support needed for the MVP
                                    break;
                            }
                            break;

                        default:
                            // unknown engine.io packet type (upgrade/noop) — ignore
                            break;
                    }
                }
            }
            catch (OperationCanceledException) { /* cancelled */ }
            catch (Exception ex)
            {
                if (!ct.IsCancellationRequested)
                    _mainThread.Enqueue(() => OnError?.Invoke($"Receive error: {ex.Message}"));
            }
        }

        private string tokenJson = "";

        private void HandleServerClose()
        {
            IsConnected = false;
            SafeClose();
            OnClosed?.Invoke();
        }

        private void SafeClose()
        {
            try
            {
                if (_ws != null && _ws.State != WebSocketState.Closed)
                {
                    _ws.Abort();
                }
            }
            catch { /* ignored */ }
        }
    }
}