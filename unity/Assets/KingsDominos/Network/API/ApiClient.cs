using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using KingsDominos.Core;

namespace KingsDominos.Network.API
{
    public class ApiClient : MonoBehaviour
    {
        public static ApiClient Instance { get; private set; }

        [Header("API Settings")]
        public string baseUrl = "";

        public string AuthToken { get; set; } = "";

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }

            if (string.IsNullOrEmpty(baseUrl))
            {
                var config = GameConfig.Instance;
                baseUrl = config != null ? config.apiBaseUrl : "http://localhost:3000/api";
            }
        }


        public void Get(
            string endpoint,
            Action<string> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(Request(
                UnityWebRequest.kHttpVerbGET,
                endpoint,
                null,
                onSuccess,
                onError
            ));
        }


        public void Post(
            string endpoint,
            string json,
            Action<string> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(Request(
                UnityWebRequest.kHttpVerbPOST,
                endpoint,
                json,
                onSuccess,
                onError
            ));
        }


        public void Put(
            string endpoint,
            string json,
            Action<string> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(Request(
                UnityWebRequest.kHttpVerbPUT,
                endpoint,
                json,
                onSuccess,
                onError
            ));
        }


        public void Delete(
            string endpoint,
            Action<string> onSuccess,
            Action<string> onError = null)
        {
            StartCoroutine(Request(
                UnityWebRequest.kHttpVerbDELETE,
                endpoint,
                null,
                onSuccess,
                onError
            ));
        }


        private IEnumerator Request(
            string method,
            string endpoint,
            string body,
            Action<string> onSuccess,
            Action<string> onError)
        {
            string url = baseUrl + endpoint;

            UnityWebRequest request = new UnityWebRequest(url, method);

            if (!string.IsNullOrEmpty(body))
            {
                byte[] data = System.Text.Encoding.UTF8.GetBytes(body);

                request.uploadHandler =
                    new UploadHandlerRaw(data);

                request.SetRequestHeader(
                    "Content-Type",
                    "application/json"
                );
            }

            request.downloadHandler =
                new DownloadHandlerBuffer();

            if (!string.IsNullOrEmpty(AuthToken))
            {
                request.SetRequestHeader(
                    "Authorization",
                    $"Bearer {AuthToken}"
                );
            }

            yield return request.SendWebRequest();


            if (request.result == UnityWebRequest.Result.Success)
            {
                onSuccess?.Invoke(
                    request.downloadHandler.text
                );
            }
            else
            {
                onError?.Invoke(
                    request.error
                );
            }
        }
    }
}