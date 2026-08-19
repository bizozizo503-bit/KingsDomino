using UnityEngine;

namespace KingsDominos.Managers
{
    public class AudioManager : Singleton<AudioManager>
    {
        [Header("Sources")]
        [SerializeField] private AudioSource musicSource;
        [SerializeField] private AudioSource sfxSource;

        [Header("Settings")]
        [SerializeField] private float musicVolume = 0.7f;
        [SerializeField] private float sfxVolume = 1f;

        private const string KEY_MUSIC = "kd_music_vol";
        private const string KEY_SFX = "kd_sfx_vol";

        protected override void Awake()
        {
            base.Awake();

            if (musicSource == null)
            {
                var musicObj = new GameObject("MusicSource");
                musicObj.transform.SetParent(transform);
                musicSource = musicObj.AddComponent<AudioSource>();
                musicSource.loop = true;
                musicSource.playOnAwake = false;
            }

            if (sfxSource == null)
            {
                var sfxObj = new GameObject("SFXSource");
                sfxObj.transform.SetParent(transform);
                sfxSource = sfxObj.AddComponent<AudioSource>();
                sfxSource.loop = false;
                sfxSource.playOnAwake = false;
            }

            musicVolume = PlayerPrefs.GetFloat(KEY_MUSIC, 0.7f);
            sfxVolume = PlayerPrefs.GetFloat(KEY_SFX, 1f);
            ApplyVolumes();
        }

        public void PlaySFX(AudioClip clip)
        {
            if (clip != null && sfxSource != null)
                sfxSource.PlayOneShot(clip, sfxVolume);
        }

        public void PlayMusic(AudioClip clip)
        {
            if (clip == null || musicSource == null) return;
            if (musicSource.clip == clip && musicSource.isPlaying) return;

            musicSource.clip = clip;
            musicSource.volume = musicVolume;
            musicSource.Play();
        }

        public void StopMusic()
        {
            if (musicSource != null)
                musicSource.Stop();
        }

        public void SetMusicVolume(float vol)
        {
            musicVolume = Mathf.Clamp01(vol);
            PlayerPrefs.SetFloat(KEY_MUSIC, musicVolume);
            ApplyVolumes();
        }

        public void SetSFXVolume(float vol)
        {
            sfxVolume = Mathf.Clamp01(vol);
            PlayerPrefs.SetFloat(KEY_SFX, sfxVolume);
            ApplyVolumes();
        }

        public float GetMusicVolume() => musicVolume;
        public float GetSFXVolume() => sfxVolume;

        private void ApplyVolumes()
        {
            if (musicSource != null) musicSource.volume = musicVolume;
            if (sfxSource != null) sfxSource.volume = sfxVolume;
        }
    }
}
