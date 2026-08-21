// public/js/youtube.js

/**
 * 키워드로 유튜브 검색 링크 생성
 * @param {string} query
 * @returns {string} YouTube Search URL
 */
function getYoutubeSearchUrl(query) {
  if (!query) return "https://www.youtube.com";
  const encoded = encodeURIComponent(query.trim());
  return `https://www.youtube.com/results?search_query=${encoded}`;
}

/**
 * YouTube 영상 ID 추출 (일반 URL, 단축 URL 대응)
 * @param {string} url
 * @returns {string|null}
 */
function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// 브라우저 전역 객체(window)에 등록하여 app.js 어디서든 바로 사용 가능하도록 처리
if (typeof window !== "undefined") {
  window.getYoutubeSearchUrl = getYoutubeSearchUrl;
  window.extractYoutubeId = extractYoutubeId;
}