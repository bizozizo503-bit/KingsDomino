using UnityEngine;

namespace KingsDominos.UI
{
    public abstract class PanelBase : MonoBehaviour
    {
        [SerializeField] protected CanvasGroup canvasGroup;

        protected virtual void Awake()
        {
            if (canvasGroup == null)
                canvasGroup = gameObject.AddComponent<CanvasGroup>();
        }

        public virtual void Show()
        {
            gameObject.SetActive(true);
            if (canvasGroup != null)
            {
                canvasGroup.alpha = 1f;
                canvasGroup.interactable = true;
                canvasGroup.blocksRaycasts = true;
            }
        }

        public virtual void Hide()
        {
            if (canvasGroup != null)
            {
                canvasGroup.alpha = 0f;
                canvasGroup.interactable = false;
                canvasGroup.blocksRaycasts = false;
            }
            gameObject.SetActive(false);
        }

        public bool IsVisible => gameObject.activeSelf;
    }
}
