// public/js/ui.js
import { getRecords, deleteRecord } from "./storage.js";
import { getYoutubeSearchUrl } from "./youtube.js";

export function switchTab(tabName) {
  // 1. 모든 탭 숨기기
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.remove("active");
  });
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // 2. 대상 탭 활성화
  const targetSec = document.getElementById(`${tabName}-section`);
  if (targetSec) targetSec.classList.add("active");

  const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (targetBtn) targetBtn.classList.add("active");

  // 3. 아카이브 탭일 때 목록 렌더링
  if (tabName === "archive") {
    renderArchiveList();
  }
}

export function renderArchiveList() {
  const container = document.getElementById("archive-list");
  if (!container) return;

  const records = getRecords();

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 style="font-family: var(--font-serif-title); font-size: 1.3rem; margin-bottom: 8px;">ARCHIVE IS EMPTY</h3>
        <p>편철된 평론이나 에세이가 없습니다. 1번 또는 4번 탭에서 기록을 남겨보세요.</p>
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
        const ytUrl = getYoutubeSearchUrl(`${item.category} ${item.title || item.message}`);

        return `
          <div class="archive-entry" data-id="${item.id}">
            <div class="entry-top">
              <span class="entry-category">${item.category}</span>
              <span class="entry-date">${date}</span>
            </div>
            <h3 class="entry-title">${item.title || item.message}</h3>
            <div class="markdown-body">${formatMarkdown(item.reply)}</div>
            <div class="entry-bottom">
              <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="yt-link">
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

export function formatMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n/gim, '<br/>');
}

export function toggleLoading(show) {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    spinner.style.display = show ? "flex" : "none";
  }
}