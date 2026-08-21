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
      3. API MODULE (백엔드 통신)
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
   
   /* ==============================================================
      4. UI & FORMATTING MODULE (marked.js 기반 고도화 파서)
      ============================================================== */
   function formatMarkdown(text) {
     if (!text) return "";
   
     // 1. marked 라이브러리가 로드되어 있는 경우 (권장)
     if (typeof marked !== "undefined" && marked.parse) {
       return marked.parse(text);
     }
   
     // 2. Fallback: marked 미로드 시에도 연속 인용구 및 #### 헤딩 완벽 대응
     let parsed = text
       .replace(/^#### (.*$)/gim, '<h4 style="color:var(--gold-dark); margin-top:20px; font-weight:700;">$1</h4>')
       .replace(/^### (.*$)/gim, '<h4 style="color:var(--gold-dark); margin-top:20px; font-weight:700;">$1</h4>')
       .replace(/^## (.*$)/gim, '<h3 style="color:var(--gold-dark); margin-top:24px; border-left:3px solid var(--gold-accent); padding-left:10px;">$1</h3>')
       .replace(/^# (.*$)/gim, '<h2 style="color:var(--gold-dark); margin-top:28px;">$1</h2>')
       .replace(/^---$/gm, '<hr class="editorial-divider">')
       .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
       .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--gold-dark);">$1</strong>')
       .replace(/\*(.*?)\*/g, '<em>$1</em>')
       .replace(/`([^`]+)`/g, '<span class="critic-tag">$1</span>')
       .replace(/^[•\-\*]\s*(.+)$/gm, '<li style="margin-left:20px; margin-bottom:6px;">$1</li>')
       .replace(/\n\n/g, '<br><br>')
       .replace(/\n/g, '<br/>');
   
     // 인용구(>) 연속 블록 통합 처리
     parsed = parsed.replace(/(<blockquote>[\s\S]*?<\/blockquote>)/gi, (match) => {
       return match.replace(/<\/blockquote><br\/><blockquote>/gi, '<br/>');
     });
   
     return parsed;
   }
   
   const parseMarkdown = formatMarkdown;
   
   function switchTab(tabName) {
     document.querySelectorAll(".tab-content").forEach((el) => el.classList.remove("active"));
     document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
   
     const targetSec = document.getElementById(`${tabName}-section`);
     if (targetSec) targetSec.classList.add("active");
   
     const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
     if (targetBtn) targetBtn.classList.add("active");
   
     // 탭별 우측 페이지 인덱스 라벨 동적 변경
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
     // 테마 초기화
     initTheme();
   
     const themeToggleBtn = document.getElementById("theme-toggle-btn");
     const navBtns = document.querySelectorAll(".nav-btn");
     
     // 1번 탭 (평론 의뢰)
     const analyzeForm = document.getElementById("analyze-form");
     const inputMessage = document.getElementById("input-message");
     const categorySelect = document.getElementById("category-select");
     const resultContainer = document.getElementById("result-container");
     const resultText = document.getElementById("result-text");
     const resultTargetTitle = document.getElementById("result-target-title");
     const saveArchiveBtn = document.getElementById("save-archive-btn");
     const loadingSpinner = document.getElementById("loading-spinner");
   
     // 2번 탭 (AI 실시간 큐레이션)
     const refreshCurationBtn = document.getElementById("refresh-curation-btn");
     const curationCardList = document.getElementById("curation-card-list");
     const curationLoading = document.getElementById("curation-loading");
   
     // 4번 탭 (에세이)
     const essayForm = document.getElementById("essay-form");
   
     // 5번 탭 (AI 무드보드)
     const moodForm = document.getElementById("moodboard-form");
     const moodInput = document.getElementById("mood-keyword");
     const moodLoading = document.getElementById("mood-loading");
     const moodResult = document.getElementById("moodboard-result");
   
     let currentResult = null;
   
     // 태그 클릭 시 1번 탭으로 이동 후 자동 입력
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
   
     // --- 이벤트 바인딩 ---
   
     // 1. 테마 토글 버튼
     if (themeToggleBtn) {
       themeToggleBtn.addEventListener("click", () => {
         toggleTheme();
       });
     }
   
     // 2. 5개 탭 전환 버튼
     navBtns.forEach((btn) => {
       btn.addEventListener("click", (e) => {
         e.preventDefault();
         const tab = btn.dataset.tab;
         switchTab(tab);
       });
     });
   
     // 3. 1번 탭: 평론 발간 의뢰 (분석)
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
   
     // 4. 아카이브 북 편철(저장)
     if (saveArchiveBtn) {
       saveArchiveBtn.addEventListener("click", () => {
         if (!currentResult) return;
         saveRecord(currentResult);
         alert("📖 아카이브 북에 성공적으로 편철되었습니다.");
         switchTab("archive");
       });
     }
   
     // 5. 2번 탭: AI 실시간 큐레이션 새로고침
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
   
     // 6. 4번 탭: 개인 에세이 등록
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
   
     // 7. 5번 탭: AI 시네마틱 무드보드 자동 생성
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
   
     // 초기 큐레이션 칩 이벤트 등록
     bindQuickTagEvents();
   });