// public/js/youtube.js

/**
 * 키워드로 유튜브 검색 링크 생성
 * @param {string} query 
 * @returns {string} YouTube Search URL
 */
export function getYoutubeSearchUrl(query) {
    const encoded = encodeURIComponent(query);
    return `https://www.youtube.com/results?search_query=${encoded}`;
  }
  
  /**
   * YouTube 영상 ID 추출 (일반 URL, 단축 URL 대응)
   * @param {string} url 
   * @returns {string|null}
   */
  export function extractYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }