const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

let loadPromise = null;

export function loadKakao() {
  const key = import.meta.env.VITE_KAKAO_JS_KEY;
  if (!key) return Promise.resolve(null);
  if (window.Kakao?.isInitialized()) return Promise.resolve(window.Kakao);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.onload = () => {
      window.Kakao.init(key);
      resolve(window.Kakao);
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Kakao SDK"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
