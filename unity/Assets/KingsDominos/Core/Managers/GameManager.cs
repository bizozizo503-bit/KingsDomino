using UnityEngine;
using KingsDominos.Core;

namespace KingsDominos.Managers
{
    public class GameManager : Singleton<GameManager>
    {
        [Header("References")]
        [SerializeField] private GameConfig config;

        public GameConfig Config => config;

        private PlayerData _playerData;

        public PlayerData PlayerData
        {
            get
            {
                if (_playerData == null)
                {
                    _playerData = new PlayerData();
                    _playerData.Load();
                }
                return _playerData;
            }
        }

        protected override void Awake()
        {
            base.Awake();
            Application.targetFrameRate = 60;
            Screen.sleepTimeout = SleepTimeout.NeverSleep;
        }

        public void Initialize()
        {
            Debug.Log("[GameManager] KingsDomino initialized");
        }
    }
}
