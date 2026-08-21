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
   
     let parsed = text;
   
     // 불필요한 백틱 코드 블록 기호 제거
     parsed = parsed.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
   
     // 1. [유튜브 버튼 주입]: 대괄호 태그가 포함된 항목을 감지하여 버튼 HTML 생성
     parsed = parsed.replace(/^[ \t]*(?:[①-⑨0-9]+\.?)?\s*(?:[•\-\*]?\s*)?(?:[\p{Emoji}\u2600-\u27BF]\s*)*((?:\[[^\]]+\])\s*[^《<\n]+(?:'[^']+'|[《<][^》>]+[》>])?[^\n]*)/gim, (match, lineContent) => {
       if (/연관\s*콘텐츠|추천\s*콘텐츠|분석\s*리포트|영업\s*한마디/i.test(lineContent)) {
         return match;
       }
   
       let keyword = lineContent;
       const quoteMatch = lineContent.match(/'([^']+)'/);
       const bracketMatch = lineContent.match(/[《<]([^》>]+)[》>]/);
       
       if (quoteMatch) {
         keyword = quoteMatch[1];
       } else if (bracketMatch) {
         keyword = bracketMatch[1];
       }
   
       const cleanKeyword = keyword.replace(/\[.*?\]/g, "").replace(/[🎬🎤📱💻📦①②③④⑤⑥⑦⑧⑨🎞️📺📀]/g, "").trim();
       const ytUrl = getYoutubeSearchUrl(cleanKeyword);
   
       return `<div class="content-recommend-item">
                 <div>
                   <span class="recommend-main-title">${match.trim()}</span>
                 </div>
                 <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="recommend-yt-btn">▶ YouTube 영상 보기</a>
               </div>`;
     });
   
     // 2. 일반 마크다운 포맷팅 적용
     let parsedMarkdown = parsed
       .replace(/^\s*####\s*(.*$)/gim, '<h4 class="editorial-h4">$1</h4>')
       .replace(/^\s*###\s*(.*$)/gim, '<h3 class="editorial-h3">$1</h3>')
       .replace(/^\s*##\s*(.*$)/gim, '<h2 class="editorial-h2">$1</h2>')
       .replace(/^\s*#\s*(.*$)/gim, '<h2 class="editorial-h2">$1</h2>')
       .replace(/^\s*---\s*$/gm, '<hr class="editorial-divider">')
       .replace(/^\s*>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
       .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
       .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--gold-dark);">$1</strong>')
       .replace(/\*(.*?)\*/g, '<em>$1</em>')
       .replace(/`([^`]+)`/g, '<span class="critic-tag">$1</span>');
   
     // 3. 소제목(✦) 정돈 및 일반 본문 처리 (이미 HTML 태그로 변환된 항목들은 건너뜀)
     let finalParsed = parsedMarkdown.replace(/^\s*[•\-\*]?\s*(.+)$/gm, (match, content) => {
       if (content.includes('content-recommend-item') || content.includes('recommend-yt-btn') || content.includes('<blockquote>')) {
         return match;
       }
       if (content.includes(':') && content.length <= 40) {
         return `<p class="editorial-point">✦ ${content}</p>`;
       }
       return `<p class="editorial-text">${content}</p>`;
     });
   
     // 4. 줄바꿈 정리
     finalParsed = finalParsed
       .replace(/\n{2,}/g, '\n')
       .replace(/\n/g, '<br>');
   
     finalParsed = finalParsed.replace(/<\/blockquote>(?:\s*<br\s*\/?>\s*)*<blockquote>/gi, '<br>');
   
     return finalParsed;
   }
   
   const parseMarkdown = formatMarkdown;
   
   function switchTab(tabName) {
     document.querySelectorAll(".tab-content").forEach((el) => el.classList.remove("active"));
     document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
   
     const targetSec = document.getElementById(`${tabName}-section`);
     if (targetSec) targetSec.classList.add("active");
   
     const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
     if (targetBtn) targetBtn.classList.add("active");
   
     const sideLabel = document.getElementById("page-side-label");
     if (sideLabel) {
       const tabTitles = {
         chat: "PAGE 01 · CRITIC EDITION ◆",
         curation: "PAGE 02 · SELECTION ◆",
         archive: "PAGE 03 · ARCHIVE BOOK ◆",
         essay: "PAGE 04 · ESSAY NOTE ◆",
         moodboard: "PAGE 05 · MOODBOARD ◆",
       };
       sideLabel.textContent = tabTitles[tabName] || "PAGE 01 · EDITORIAL ◆";
     }
   
     if (tabName === "archive") {
       renderArchiveList();
     }
   }
   
   function renderArchiveList() {
     const container = document.getElementById("archive-list");
     if (!container) return;
   
     const records = getRecords();
   
     if (records.length === 0) {
       container.innerHTML = `
         <div class="empty-state">
           <h3 style="font-family: var(--font-serif-title); font-size: 1.3rem; margin-bottom: 8px;">ARCHIVE IS EMPTY</h3>
           <p>편철된 평론이나 에세이가 없습니다. 01번 또는 04번 지면에서 기록을 남겨보세요.</p>
         </div>
       `;
       return;
     }
   
     container.innerHTML = `
       <div class="archive-stack">
         ${records.map((item) => {
           const date = new Date(item.createdAt).toLocaleDateString("ko-KR", {
             year: "numeric",
             month: "short",
             day: "numeric",
           });
           const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.category + ' ' + (item.title || item.message))}`;
   
           return `
             <div class="archive-entry">
               <div class="entry-top">
                 <span class="entry-category">${item.category}</span>
                 <span class="entry-date">${date}</span>
               </div>
               <h3 class="entry-title">${item.title || item.message}</h3>
               <div class="markdown-body">${parseMarkdown(item.reply)}</div>
               <div class="entry-bottom">
                 <a href="${ytSearch}" target="_blank" rel="noopener noreferrer" class="yt-link">
                   ▶ 관련 아카이브 영상 탐색
                 </a>
                 <button class="btn-delete" data-action="delete" data-id="${item.id}">기록 삭제</button>
               </div>
             </div>
           `;
         }).join("")}
       </div>
     `;
   
     container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
       btn.addEventListener("click", (e) => {
         const id = e.target.dataset.id;
         if (confirm("이 아카이브 기록을 삭제하시겠습니까?")) {
           deleteRecord(id);
           renderArchiveList();
         }
       });
     });
   }
   
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
         console.log("발간 의뢰 버튼이 클릭되었습니다!");
   
         const message = inputMessage ? inputMessage.value.trim() : "";
         const category = categorySelect ? categorySelect.value : "일반";
   
         if (!message) {
           alert("키워드를 입력해 주세요.");
           return;
         }
   
         try {
           if (loadingSpinner) loadingSpinner.style.display = "flex";
           if (resultContainer) resultContainer.style.display = "none";
   
           console.log("API 통신 시작...", message, category);
           const data = await sendChatMessage(message, category);
           console.log("API 통신 성공:", data);
   
           if (!data || !data.reply) {
             throw new Error("서버로부터 올바른 응답을 받지 못했습니다.");
           }
   
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
           console.error("평론 작성 중 상세 오류:", error);
           alert("평론 작성 중 오류가 발생했습니다: " + error.message);
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