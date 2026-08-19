using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace KingsDominos.Network.API
{
    [Serializable]
    public class ApiResponse
    {
        public bool success;
        public string message;
        public string error;
        public string data;
    }

    [Serializable]
    public class ApiResponse<T>
    {
        public bool success;
        public string message;
        public string error;
        public T data;
    }

    public class ApiClient
    {
        private string _baseUrl;
        private string _token;

        public ApiClient(string baseUrl)
        {
            _baseUrl = baseUrl.TrimEnd('/');
        }

        public void SetBaseUrl(string url) => _baseUrl = url.TrimEnd('/');
        public void SetToken(string token) => _token = token;

        public IEnumerator Get<T>(string endpoint, Action<ApiResponse<T>> callback)
        {
            using var request = UnityWebRequest.Get($"{_baseUrl}{endpoint}");
            AddHeaders(request);

            yield return request.SendWebRequest();
            yield return HandleResponse(request, callback);
        }

        public IEnumerator Post<T>(string endpoint, string json, Action<ApiResponse<T>> callback)
        {
            using var request = CreateRequest(endpoint, "POST", json);
            yield return request.SendWebRequest();
            yield return HandleResponse(request, callback);
        }

        public IEnumerator Put<T>(string endpoint, string json, Action<ApiResponse<T>> callback)
        {
            using var request = CreateRequest(endpoint, "PUT", json);
            yield return request.SendWebRequest();
            yield return HandleResponse(request, callback);
        }

        public IEnumerator Delete<T>(string endpoint, Action<ApiResponse<T>> callback)
        {
            using var request = CreateRequest(endpoint, "DELETE", null);
            yield return request.SendWebRequest();
            yield return HandleResponse(request, callback);
        }

        // --- Auth ---

        public IEnumerator AuthRegister(string username, string password, string displayName,
            Action<ApiResponse<AuthData>> callback)
        {
            var json = JsonUtility.ToJson(new { username, password, displayName });
            return Post<AuthData>("/auth/register", json, callback);
        }

        public IEnumerator AuthLogin(string username, string password,
            Action<ApiResponse<AuthData>> callback)
        {
            var json = JsonUtility.ToJson(new { username, password });
            return Post<AuthData>("/auth/login", json, callback);
        }

        public IEnumerator AuthProfile(Action<ApiResponse<PlayerProfileData>> callback)
        {
            return Get<PlayerProfileData>("/auth/profile", callback);
        }

        // --- Wallet ---

        public IEnumerator WalletGet(Action<ApiResponse<WalletData>> callback)
        {
            return Get<WalletData>("/wallet", callback);
        }

        public IEnumerator WalletHistory(int page = 1, int limit = 20,
            Action<ApiResponse<WalletHistoryData>> callback)
        {
            return Get<WalletHistoryData>($"/wallet/history?page={page}&limit={limit}", callback);
        }

        // --- Games ---

        public IEnumerator GamesList(Action<ApiResponse<string[]>> callback)
        {
            return Get<string[]>("/games", callback);
        }

        public IEnumerator GamesCreateRoom(string gameId, bool isPrivate,
            Action<ApiResponse<RoomData>> callback)
        {
            var json = JsonUtility.ToJson(new { gameId, isPrivate });
            return Post<RoomData>("/games/room", json, callback);
        }

        public IEnumerator GamesJoinRoom(string roomId, Action<ApiResponse<RoomData>> callback)
        {
            var json = JsonUtility.ToJson(new { roomId });
            return Post<RoomData>("/games/room/join", json, callback);
        }

        // --- Social ---

        public IEnumerator FriendsList(Action<ApiResponse<FriendListData>> callback)
        {
            return Get<FriendListData>("/social/friends", callback);
        }

        public IEnumerator FriendsRequest(string targetId, Action<ApiResponse> callback)
        {
            var json = JsonUtility.ToJson(new { targetId });
            return Post("/social/friends/request", json, callback);
        }

        public IEnumerator FriendsAccept(string friendshipId, Action<ApiResponse> callback)
        {
            var json = JsonUtility.ToJson(new { friendshipId });
            return Post("/social/friends/accept", json, callback);
        }

        public IEnumerator ChatHistory(string channelId, int limit = 50,
            Action<ApiResponse<ChatMessage[]>> callback)
        {
            return Get<ChatMessage[]>($"/social/chat/{channelId}?limit={limit}", callback);
        }

        // --- Rewards ---

        public IEnumerator RewardsDailyStatus(Action<ApiResponse<DailyRewardStatus>> callback)
        {
            return Get<DailyRewardStatus>("/rewards/daily/status", callback);
        }

        public IEnumerator RewardsDailyClaim(Action<ApiResponse<DailyRewardResult>> callback)
        {
            return Post<DailyRewardResult>("/rewards/daily/claim", "{}", callback);
        }

        public IEnumerator RewardsAchievements(Action<ApiResponse<AchievementData[]>> callback)
        {
            return Get<AchievementData[]>("/rewards/achievements", callback);
        }

        public IEnumerator RewardsAchievementClaim(string achievementId,
            Action<ApiResponse> callback)
        {
            var json = JsonUtility.ToJson(new { achievementId });
            return Post("/rewards/achievements/claim", json, callback);
        }

        public IEnumerator RewardsShop(string category = null,
            Action<ApiResponse<ShopItemData[]>> callback)
        {
            var endpoint = string.IsNullOrEmpty(category)
                ? "/rewards/shop"
                : $"/rewards/shop?category={category}";
            return Get<ShopItemData[]>(endpoint, callback);
        }

        public IEnumerator RewardsShopPurchase(string itemId, Action<ApiResponse> callback)
        {
            var json = JsonUtility.ToJson(new { itemId });
            return Post("/rewards/shop/purchase", json, callback);
        }

        // --- Tournaments ---

        public IEnumerator TournamentsList(string status = null,
            Action<ApiResponse<TournamentData[]>> callback)
        {
            var endpoint = string.IsNullOrEmpty(status)
                ? "/tournaments"
                : $"/tournaments?status={status}";
            return Get<TournamentData[]>(endpoint, callback);
        }

        public IEnumerator TournamentsJoin(string tournamentId, Action<ApiResponse> callback)
        {
            var json = JsonUtility.ToJson(new { tournamentId });
            return Post("/tournaments/join", json, callback);
        }

        public IEnumerator TournamentsDetail(string tournamentId,
            Action<ApiResponse<TournamentData>> callback)
        {
            return Get<TournamentData>($"/tournaments/{tournamentId}", callback);
        }

        // --- Events ---

        public IEnumerator EventsActive(Action<ApiResponse<EventData[]>> callback)
        {
            return Get<EventData[]>("/events/active", callback);
        }

        public IEnumerator EventsDetail(string eventId, Action<ApiResponse<EventData>> callback)
        {
            return Get<EventData>($"/events/{eventId}", callback);
        }

        // --- Leaderboard ---

        public IEnumerator Leaderboard(string gameId, string period = "all",
            Action<ApiResponse<LeaderboardEntry[]>> callback)
        {
            return Get<LeaderboardEntry[]>($"/games/leaderboard/{gameId}?period={period}", callback);
        }

        // --- Helpers ---

        private UnityWebRequest CreateRequest(string endpoint, string method, string json)
        {
            var request = new UnityWebRequest($"{_baseUrl}{endpoint}", method);
            AddHeaders(request);

            if (!string.IsNullOrEmpty(json))
            {
                var bodyRaw = Encoding.UTF8.GetBytes(json);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            }

            request.downloadHandler = new DownloadHandlerBuffer();
            return request;
        }

        private void AddHeaders(UnityWebRequest request)
        {
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Accept", "application/json");
            if (!string.IsNullOrEmpty(_token))
                request.SetRequestHeader("Authorization", $"Bearer {_token}");
        }

        private IEnumerator HandleResponse<T>(UnityWebRequest request, Action<ApiResponse<T>> callback)
        {
            if (request.result != UnityWebRequest.Result.Success)
            {
                callback?.Invoke(new ApiResponse<T>
                {
                    success = false,
                    error = request.error
                });
                yield break;
            }

            var text = request.downloadHandler.text;
            try
            {
                var response = JsonUtility.FromJson<ApiResponse<T>>(text);
                callback?.Invoke(response);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[ApiClient] JSON parse error: {ex.Message}\nRaw: {text}");
                callback?.Invoke(new ApiResponse<T>
                {
                    success = false,
                    error = $"JSON parse error: {ex.Message}"
                });
            }
        }
    }

    // --- Data DTOs ---

    [Serializable]
    public class AuthData
    {
        public string accessToken;
        public string userId;
        public string username;
    }

    [Serializable]
    public class PlayerProfileData
    {
        public string id;
        public string username;
        public int level;
        public int xp;
        public int gamesPlayed;
        public int gamesWon;
        public int gold;
    }

    [Serializable]
    public class WalletData
    {
        public int balance;
        public string currency;
    }

    [Serializable]
    public class WalletHistoryData
    {
        public WalletTransaction[] transactions;
        public int total;
    }

    [Serializable]
    public class WalletTransaction
    {
        public string id;
        public string type;
        public int amount;
        public string source;
        public string description;
        public string createdAt;
    }

    [Serializable]
    public class RoomData
    {
        public string id;
        public string gameId;
        public string code;
        public string hostId;
        public int playerCount;
        public int maxPlayers;
        public string status;
    }

    [Serializable]
    public class FriendListData
    {
        public FriendData[] friends;
        public FriendData[] pending;
    }

    [Serializable]
    public class FriendData
    {
        public string id;
        public string username;
        public int level;
        public bool online;
    }

    [Serializable]
    public class ChatMessage
    {
        public string id;
        public string senderId;
        public string senderName;
        public string content;
        public string timestamp;
    }

    [Serializable]
    public class DailyRewardStatus
    {
        public int currentStreak;
        public int maxStreak;
        public bool canClaim;
        public int nextRewardGold;
    }

    [Serializable]
    public class DailyRewardResult
    {
        public int goldAwarded;
        public int newBalance;
        public int newStreak;
    }

    [Serializable]
    public class AchievementData
    {
        public string id;
        public string name;
        public string description;
        public string category;
        public int targetProgress;
        public int currentProgress;
        public bool claimed;
        public int rewardGold;
    }

    [Serializable]
    public class ShopItemData
    {
        public string id;
        public string name;
        public string description;
        public string category;
        public int price;
        public string currency;
        public bool owned;
        public bool equipped;
    }

    [Serializable]
    public class TournamentData
    {
        public string id;
        public string name;
        public string gameId;
        public string status;
        public int entryFee;
        public int maxPlayers;
        public int currentPlayers;
        public string startTime;
        public string endTime;
    }

    [Serializable]
    public class EventData
    {
        public string id;
        public string name;
        public string description;
        public string type;
        public string startTime;
        public string endTime;
        public MissionData[] missions;
    }

    [Serializable]
    public class MissionData
    {
        public string id;
        public string name;
        public int targetProgress;
        public int currentProgress;
        public bool completed;
        public int rewardGold;
    }

    [Serializable]
    public class LeaderboardEntry
    {
        public int rank;
        public string playerId;
        public string username;
        public int score;
        public int gamesPlayed;
    }
}
