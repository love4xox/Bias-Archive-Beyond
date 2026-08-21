// public/js/api.js

/**
 * Gemini 백엔드 API 호출
 * @param {string} message - 사용자 입력 내용
 * @param {string} category - 선택한 취향 카테고리
 * @returns {Promise<Object>} { reply, category }
 */
export async function sendChatMessage(message, category = "일반") {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, category }),
      });
  
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP Error: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("API 요청 실패:", error);
      throw error;
    }
  }