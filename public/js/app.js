// public/js/app.js

/* ==============================================================
   1. STORAGE MODULE (로컬스토리지 관리)
   ============================================================== */
   const STORAGE_KEY = "bias_archive_records";

   function getRecords() {
     const data = localStorage.getItem(STORAGE_KEY);
     return data ? JSON.parse(data) : [];
   }
   
   function saveRecord(record) {
     const records = getRecords();
     const newRecord = {
       id: Date.now().toString(),
       createdAt: new Date().toISOString(),
       ...record,
     };
     records.unshift(newRecord);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
     return newRecord;
   }
   
   function deleteRecord(id) {
     const records = getRecords().filter((item) => item.id !== id);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
     return records;
   }
   
   /* ==============================================================
      2. THEME MODULE (다크 / 라이트 모드)
      ============================================================== */
   const THEME_KEY = "bias_archive_theme";
   
   function initTheme() {
     const savedTheme = localStorage.getItem(THEME_KEY) || "light";
     applyTheme(savedTheme);
   }
   
   function toggleTheme() {
     const current = document.documentElement.getAttribute("data-theme") || "light";
     const nextTheme = current === "light" ? "dark" : "light";
     applyTheme(nextTheme);
     localStorage.setItem(THEME_KEY, nextTheme);
     return nextTheme;
   }
   
   function applyTheme(theme) {
     document.documentElement.setAttribute("data-theme", theme);
     const btn = document.getElementById("theme-toggle-btn");
     if (btn) {
       btn.innerHTML = theme === "dark" ? "🌙 DARK EDITION" : "☀️ LIGHT EDITION";
     }
   }
   
   /* ==============================================================
      3. API & YOUTUBE MODULE (백엔드 통신 및 유튜브 링크)
      ============================================================== */
   async function sendChatMessage(message, category = "일반") {
     const response = await fetch("/api/chat", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ message, category }),
     });
   
     if (!response.ok) {
       const errData = await response.json().catch(() => ({}));
       throw new Error(errData.error || `HTTP 오류: ${response.status}`);
     }
   
     return await response.json();
   }
   
   function getYoutubeSearchUrl(query) {
     return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
   }
   
   /* ==============================================================
   4. UI & FORMATTING MODULE (마크다운 파서 및 유튜브 버튼 주입)
   ============================================================== */
function formatMarkdown(text) {
  if (!text) return "";

  // 1️⃣ 백틱 제거 (파란줄 방지)
  let parsed = text.replace(/```/g, "").replace(/`/g, "");

  // 2️⃣ 줄 단위로 처리 → 유튜브 버튼 주입
  const lines = parsed.split("\n");
  const processedLines = lines.map((line) => {
    const bracketMatch = line.match(/《([^》]+)》/);
    const quoteMatch = line.match(/'([^']+)'/);

    // 제목/설명 줄은 그대로
    if (/추천\s*이유|킬링\s*포인트|콘텐츠\s*\d+선/.test(line)) {
      return line;
    }

    // 《》 또는 '' 있으면 → 유튜브 버튼!
    if (bracketMatch || quoteMatch) {
      const keyword = bracketMatch ? bracketMatch[1] : quoteMatch[1];
      const ytUrl = getYoutubeSearchUrl(keyword);
      return `
        <div class="content-recommend-item">
          <div>
            <span class="recommend-main-title">${line.trim()}</span>
          </div>
          <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" 
             class="recommend-yt-btn">▶ YouTube 영상 보기</a>
        </div>`;
    }

    return line;
  });

  parsed = processedLines.join("\n");

  // 3️⃣ 일반 마크다운 포맷팅 적용
  let parsedMarkdown = parsed
    .replace(/^\s*####\s*(.*$)/gim, '<h4 class="editorial-h4">$1</h4>')
    .replace(/^\s*###\s*(.*$)/gim, '<h3 class="editorial-h3">$1</h3>')
    .replace(/^\s*##\s*(.*$)/gim, '<h2 class="editorial-h2">$1</h2>')
    .replace(/^\s*#\s*(.*$)/gim, '<h2 class="editorial-h2">$1</h2>')
    .replace(/^\s*---\s*$/gm, '<hr class="editorial-divider">')
    .replace(/^\s*>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--gold-dark);">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 4️⃣ 소제목(✦) 정돈 및 본문 처리
  let finalParsed = parsedMarkdown.replace(/^\s*[•\-\*]?\s*(.+)$/gm, (match, content) => {
    // 유튜브 버튼/HTML 태그는 건드리지 않음!
    if (content.includes('content-recommend-item') || 
        content.includes('YouTube 영상 보기') ||
        content.includes('recommend-yt-btn') ||
        content.includes('<')) {
      return match;
    }
    if (content.includes(':') && content.length <= 40) {
      return `<p class="editorial-point">✦ ${content}</p>`;
    }
    return `<p class="editorial-text">${content}</p>`;
  });

  // 5️⃣ 줄바꿈 정리
  finalParsed = finalParsed
    .replace(/\n{2,}/g, '\n')
    .replace(/\n/g, '<br>');

  finalParsed = finalParsed.replace(/<\/blockquote>(?:\s*<br\s*\/?>\s*)*<blockquote>/gi, '<br>');

  return finalParsed;
}

const parseMarkdown = formatMarkdown;
   
   /* ==============================================================
      5. EVENT INITIALIZATION
      ============================================================== */
   document.addEventListener("DOMContentLoaded", () => {
     initTheme();
   
     const themeToggleBtn = document.getElementById("theme-toggle-btn");
     const navBtns = document.querySelectorAll(".nav-btn");
   
     const analyzeForm = document.getElementById("analyze-form");
     const inputMessage = document.getElementById("input-message");
     const categorySelect = document.getElementById("category-select");
     const resultContainer = document.getElementById("result-container");
     const resultText = document.getElementById("result-text");
     const resultTargetTitle = document.getElementById("result-target-title");
     const saveArchiveBtn = document.getElementById("save-archive-btn");
     const loadingSpinner = document.getElementById("loading-spinner");
   
     const refreshCurationBtn = document.getElementById("refresh-curation-btn");
     const curationCardList = document.getElementById("curation-card-list");
     const curationLoading = document.getElementById("curation-loading");
   
     const essayForm = document.getElementById("essay-form");
   
     const moodForm = document.getElementById("moodboard-form");
     const moodInput = document.getElementById("mood-keyword");
     const moodLoading = document.getElementById("mood-loading");
     const moodResult = document.getElementById("moodboard-result");
   
     let currentResult = null;
   
     function bindQuickTagEvents() {
       document.querySelectorAll(".quick-tag").forEach((tag) => {
         tag.onclick = () => {
           const text = tag.getAttribute("data-value");
           const cat = tag.getAttribute("data-cat");
           if (text && inputMessage) {
             inputMessage.value = text;
             if (categorySelect && cat) categorySelect.value = cat;
             switchTab("chat");
           }
         };
       });
     }
   
     if (themeToggleBtn) {
       themeToggleBtn.addEventListener("click", () => {
         toggleTheme();
       });
     }
   
     navBtns.forEach((btn) => {
       btn.addEventListener("click", (e) => {
         e.preventDefault();
         const tab = btn.dataset.tab;
         switchTab(tab);
       });
     });
   
     if (analyzeForm) {
       analyzeForm.addEventListener("submit", async (e) => {
         e.preventDefault();
         const message = inputMessage.value.trim();
         const category = categorySelect ? categorySelect.value : "일반";
   
         if (!message) {
           alert("키워드를 입력해 주세요.");
           return;
         }
   
         try {
           if (loadingSpinner) loadingSpinner.style.display = "flex";
           if (resultContainer) resultContainer.style.display = "none";
   
           const data = await sendChatMessage(message, category);
   
           currentResult = {
             title: message,
             message: message,
             category: data.category || category,
             reply: data.reply,
           };
   
           if (resultTargetTitle) {
             resultTargetTitle.textContent = `[${category}] ${message} : 서사 평론`;
           }
           if (resultText) {
             resultText.innerHTML = parseMarkdown(data.reply);
           }
           if (resultContainer) {
             resultContainer.style.display = "block";
             resultContainer.scrollIntoView({ behavior: "smooth" });
           }
         } catch (error) {
           alert("평론 작성 중 오류: " + error.message);
         } finally {
           if (loadingSpinner) loadingSpinner.style.display = "none";
         }
       });
     }
   
     if (saveArchiveBtn) {
       saveArchiveBtn.addEventListener("click", () => {
         if (!currentResult) return;
         saveRecord(currentResult);
         alert("📖 아카이브 북에 성공적으로 편철되었습니다.");
         switchTab("archive");
       });
     }
   
     if (refreshCurationBtn) {
       refreshCurationBtn.addEventListener("click", async () => {
         try {
           if (curationLoading) curationLoading.style.display = "flex";
           if (curationCardList) curationCardList.style.opacity = "0.4";
   
           const prompt = `현재 가장 인기 있거나 미학적 가치가 높은 3가지 대상(1.배우/영화, 2.K-POP 아티스트, 3.도서/작품)을 골라줘. 
   각 대상마다:
   - 분야 및 대상 이름
   - 한 줄 평론 요약 (시네마틱한 문체)
   - 태그 3개
   형식으로 한국어로 추천해줘.`;
   
           const data = await sendChatMessage(prompt, "실시간 에디터 큐레이션");
   
           if (curationCardList) {
             curationCardList.innerHTML = `
               <div class="curation-column" style="border-left: 4px solid var(--gold-accent);">
                 <div class="markdown-body">
                   ${parseMarkdown(data.reply)}
                 </div>
               </div>
             `;
           }
         } catch (err) {
           alert("큐레이션을 불러오는 중 오류가 발생했습니다: " + err.message);
         } finally {
           if (curationLoading) curationLoading.style.display = "none";
           if (curationCardList) curationCardList.style.opacity = "1";
           bindQuickTagEvents();
         }
       });
     }
   
     if (essayForm) {
       essayForm.addEventListener("submit", (e) => {
         e.preventDefault();
         const title = document.getElementById("essay-title").value.trim();
         const content = document.getElementById("essay-content").value.trim();
   
         if (!title || !content) return;
   
         saveRecord({
           title: title,
           message: title,
           category: "개인 에세이 / 감상 노트",
           reply: content,
         });
   
         alert("✍️ 개인 에세이가 아카이브 북에 저장되었습니다.");
         essayForm.reset();
         switchTab("archive");
       });
     }
   
     if (moodForm) {
       moodForm.addEventListener("submit", async (e) => {
         e.preventDefault();
         const keyword = moodInput.value.trim();
         if (!keyword) return;
   
         try {
           if (moodLoading) moodLoading.style.display = "flex";
   
           const prompt = `[${keyword}]의 시네마틱 비주얼 무드보드를 작성해줘. 상징하는 분위기 타이틀, 1줄 서사 설명, 그리고 어울리는 대표 색상 3가지(헥스코드 예: #191919)를 추천해줘.`;
           const data = await sendChatMessage(prompt, "시네마틱 무드보드");
   
           const newCard = document.createElement("div");
           newCard.className = "curation-column";
           newCard.innerHTML = `
             <h4>✦ ${keyword} : Aesthetic Mood</h4>
             <div class="markdown-body" style="font-size: 0.95rem; margin-top: 8px;">
               ${parseMarkdown(data.reply)}
             </div>
           `;
   
           if (moodResult) {
             moodResult.prepend(newCard);
           }
           moodForm.reset();
         } catch (err) {
           alert("무드보드 생성 중 오류: " + err.message);
         } finally {
           if (moodLoading) moodLoading.style.display = "none";
         }
       });
     }
   
     bindQuickTagEvents();
   });