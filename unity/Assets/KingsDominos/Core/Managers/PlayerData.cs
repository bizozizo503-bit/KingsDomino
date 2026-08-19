using UnityEngine;

namespace KingsDominos.Managers
{
    public class PlayerData
    {
        private const string KEY_USER_ID = "kd_user_id";
        private const string KEY_USERNAME = "kd_username";
        private const string KEY_GOLD = "kd_gold";
        private const string KEY_LEVEL = "kd_level";
        private const string KEY_XP = "kd_xp";
        private const string KEY_TOKEN = "kd_token";
        private const string KEY_AVATAR = "kd_avatar";
        private const string KEY_COUNTRY = "kd_country";

        public string UserId { get; set; }
        public string Username { get; set; }
        public int Gold { get; set; }
        public int Level { get; set; }
        public int XP { get; set; }
        public string Token { get; set; }
        public string AvatarUrl { get; set; }
        public string Country { get; set; }

        public bool IsLoggedIn => !string.IsNullOrEmpty(Token);

        public void Load()
        {
            UserId = PlayerPrefs.GetString(KEY_USER_ID, "");
            Username = PlayerPrefs.GetString(KEY_USERNAME, "Player");
            Gold = PlayerPrefs.GetInt(KEY_GOLD, 12500);
            Level = PlayerPrefs.GetInt(KEY_LEVEL, 1);
            XP = PlayerPrefs.GetInt(KEY_XP, 0);
            Token = PlayerPrefs.GetString(KEY_TOKEN, "");
            AvatarUrl = PlayerPrefs.GetString(KEY_AVATAR, "");
            Country = PlayerPrefs.GetString(KEY_COUNTRY, "SA");
        }

        public void Save()
        {
            PlayerPrefs.SetString(KEY_USER_ID, UserId);
            PlayerPrefs.SetString(KEY_USERNAME, Username);
            PlayerPrefs.SetInt(KEY_GOLD, Gold);
            PlayerPrefs.SetInt(KEY_LEVEL, Level);
            PlayerPrefs.SetInt(KEY_XP, XP);
            PlayerPrefs.SetString(KEY_TOKEN, Token);
            PlayerPrefs.SetString(KEY_AVATAR, AvatarUrl);
            PlayerPrefs.SetString(KEY_COUNTRY, Country);
            PlayerPrefs.Save();
        }

        public void Clear()
        {
            PlayerPrefs.DeleteKey(KEY_USER_ID);
            PlayerPrefs.DeleteKey(KEY_USERNAME);
            PlayerPrefs.DeleteKey(KEY_GOLD);
            PlayerPrefs.DeleteKey(KEY_LEVEL);
            PlayerPrefs.DeleteKey(KEY_XP);
            PlayerPrefs.DeleteKey(KEY_TOKEN);
            PlayerPrefs.DeleteKey(KEY_AVATAR);
            PlayerPrefs.DeleteKey(KEY_COUNTRY);
            PlayerPrefs.Save();
        }

        public bool SpendGold(int amount)
        {
            if (amount <= 0 || Gold < amount) return false;
            Gold -= amount;
            Save();
            return true;
        }

        public void AddGold(int amount)
        {
            if (amount <= 0) return;
            Gold += amount;
            Save();
        }
    }
}
