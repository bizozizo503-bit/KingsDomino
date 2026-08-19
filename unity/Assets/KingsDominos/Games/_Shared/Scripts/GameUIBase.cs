using UnityEngine;

namespace KingsDominos.Games.Shared
{
    public abstract class GameUIBase : MonoBehaviour
    {
        [Header("Common UI")]
        [SerializeField] protected GameObject gameUIRoot;

        public virtual void Initialize()
        {
            if (gameUIRoot != null)
                gameUIRoot.SetActive(false);
        }

        public virtual void ShowGameUI()
        {
            if (gameUIRoot != null)
                gameUIRoot.SetActive(true);
        }

        public virtual void HideGameUI()
        {
            if (gameUIRoot != null)
                gameUIRoot.SetActive(false);
        }

        public abstract void UpdateState(object state);
        public abstract void ShowGameOver(object result);
    }
}
