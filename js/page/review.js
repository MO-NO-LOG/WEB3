const API = "http://127.0.0.1:8000";
const ACCESS_TOKEN_KEY = "access_token";

function getMovieId() {
  return new URLSearchParams(location.search).get("movieId");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function starText(rating) {
  const n = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function actionIcons() {
  return `
    <div class="action"><img src="images/ui/like.webp"><span>0</span></div>
    <div class="action"><img src="images/ui/like.webp" class="rotate-180"><span>0</span></div>
    <div class="action"><img src="images/ui/comment.webp"></div>
  `;
}

function makeReplyHTML(comment) {
  return `
    <div class="reply">
      <img src="images/default-user.png" class="reply-profile" alt="reply-user">
      <div class="reply-content">
        <span class="reply-user">${escapeHtml(comment.userNickname || "익명")}</span>
        <div class="reply-body">${escapeHtml(comment.content || "")}</div>
      </div>
      <div class="reply-actions">
        ${actionIcons()}
      </div>
    </div>
  `;
}

function makeReviewHTML(review) {
  return `
    <article class="review" data-review-id="${review.reviewId}">
      <div class="review-top">
        <img src="images/default-user.png" alt="User">
        <span class="user">${escapeHtml(review.userNickname || "익명")}</span>
        <span class="star">${starText(review.rating)}</span>
      </div>
      <p>${escapeHtml(review.content || "")}</p>

      <div class="review-actions">
        <div class="action-row">
          ${actionIcons()}
        </div>

        <div class="action comment-btn" onclick="toggleReplies(this)" data-count="0">
          <span class="reply-count">답글 0개</span>
          <img src="images/ui/up.png" class="reply-arrow" alt="toggle">
        </div>
      </div>

      <div class="replies" style="display:none;">
        <div class="reply-form">
          <img src="images/default-user.png" class="reply-profile" alt="me">
          <input type="text" class="reply-input" placeholder="댓글을 입력하세요">
          <button type="button" class="cancel-btn">취소</button>
          <button type="button" class="reply-submit-btn">답글</button>
        </div>
        <div class="replies-list"></div>
      </div>
    </article>
  `;
}

async function loadMovieDetail() {
  const movieId = getMovieId();
  if (!movieId) return;

  const res = await fetch(`${API}/api/movies/detail/${movieId}`);
  if (!res.ok) return;

  const movie = await res.json();

  const meta = document.querySelector(".detail-top .meta");
  if (meta) {
    meta.innerHTML = "";
    (movie.genres || []).forEach((g) => {
      meta.innerHTML += `<span>${escapeHtml(g)}</span>`;
    });
    if (movie.releaseDate) {
      meta.innerHTML += `<span>${String(movie.releaseDate).slice(0, 4)}</span>`;
    }
  }

  const poster = document.querySelector(".detail-top .poster img");
  if (poster) poster.src = movie.posterUrl || "images/no-poster.png";

  const title = document.querySelector(".detail-top .title");
  if (title) title.textContent = movie.title || "";

  const score = document.querySelector(".detail-top .score strong");
  if (score) score.textContent = String(movie.averageRating ?? 0);

  const summary = document.querySelector(".detail-top .summary p");
  if (summary) summary.textContent = movie.description || "";
}

async function loadReviews() {
  const movieId = getMovieId();
  if (!movieId) return;

  const container = document.querySelector(".review-list");
  if (!container) return;

  const res = await fetch(`${API}/api/reviews/by-movie/${movieId}`);
  if (!res.ok) {
    container.innerHTML = `<p>리뷰를 불러오지 못했습니다.</p>`;
    return;
  }

  const data = await res.json();
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  if (reviews.length === 0) {
    container.innerHTML = `<p>아직 작성된 리뷰가 없습니다.</p>`;
    return;
  }

  container.innerHTML = reviews.map((r) => makeReviewHTML(r)).join("");
}

function renderLocalReplies(reviewEl) {
  const list = reviewEl.querySelector(".replies-list");
  const localReplies = reviewEl.__localReplies || [];

  if (!list) return;
  if (localReplies.length === 0) {
    list.innerHTML = `<div class="reply"><div class="reply-content"><div class="reply-body">아직 답글이 없습니다.</div></div></div>`;
    return;
  }

  list.innerHTML = localReplies.map(makeReplyHTML).join("");
}

async function submitComment(reviewEl) {
  const reviewId = reviewEl.dataset.reviewId;
  const input = reviewEl.querySelector(".reply-input");
  const content = input?.value?.trim();

  if (!reviewId) return;
  if (!content) {
    alert("답글 내용을 입력하세요.");
    return;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    alert("로그인 후 답글 작성이 가능합니다.");
    return;
  }

  const res = await fetch(`${API}/api/reviews/comment/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reviewId: Number(reviewId), content }),
  });

  if (!res.ok) {
    let msg = "답글 작성 실패";
    try {
      const err = await res.json();
      if (typeof err.detail === "string") msg = err.detail;
    } catch {}
    alert(msg);
    return;
  }

  const created = await res.json();

  if (!reviewEl.__localReplies) reviewEl.__localReplies = [];
  reviewEl.__localReplies.push({
    userNickname: created.userNickname,
    content: created.content,
  });

  const btn = reviewEl.querySelector(".comment-btn");
  if (btn) {
    const count = reviewEl.__localReplies.length;
    btn.dataset.count = String(count);
    const txt = btn.querySelector(".reply-count");
    if (txt && btn.classList.contains("open")) {
      txt.innerText = "답글 접기";
    } else if (txt) {
      txt.innerText = `답글 ${count}개`;
    }
  }

  if (input) input.value = "";
  renderLocalReplies(reviewEl);
}

async function submitReview() {
  const movieId = getMovieId();
  const content = document.querySelector("#review-form textarea")?.value?.trim();
  const rating = document.querySelector('input[name="rating"]:checked')?.value;

  if (!movieId) return;
  if (!rating || !content) {
    alert("별점과 내용을 입력하세요.");
    return;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    alert("로그인 후 리뷰 작성이 가능합니다.");
    return;
  }

  const res = await fetch(`${API}/api/reviews/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movieId: Number(movieId),
      rating: Number(rating),
      content,
    }),
  });

  if (!res.ok) {
    let msg = "리뷰 작성 실패";
    try {
      const err = await res.json();
      if (typeof err.detail === "string") msg = err.detail;
    } catch {}
    alert(msg);
    return;
  }

  const textarea = document.querySelector("#review-form textarea");
  if (textarea) textarea.value = "";
  document.querySelectorAll('input[name="rating"]').forEach((r) => {
    r.checked = false;
  });
  document.getElementById("review-form")?.classList.remove("show");

  await loadReviews();
}

window.toggleReplies = function toggleReplies(btn) {
  const review = btn.closest(".review");
  const replies = review?.querySelector(".replies");
  const text = btn.querySelector(".reply-count");

  if (!review || !replies || !text) return;

  const opened = replies.style.display === "block";

  if (opened) {
    replies.style.display = "none";
    text.innerText = `답글 ${btn.dataset.count || 0}개`;
    btn.classList.remove("open");
  } else {
    replies.style.display = "block";
    text.innerText = "답글 접기";
    btn.classList.add("open");
    renderLocalReplies(review);
  }
};

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("cancel-btn")) {
    const replies = e.target.closest(".replies");
    const review = replies?.closest(".review");
    const btn = review?.querySelector(".comment-btn");

    if (!replies || !review || !btn) return;

    replies.style.display = "none";
    btn.querySelector(".reply-count").innerText = `답글 ${btn.dataset.count || 0}개`;
    btn.classList.remove("open");
  }

  if (e.target.classList.contains("reply-submit-btn")) {
    const review = e.target.closest(".review");
    if (!review) return;
    submitComment(review);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await loadMovieDetail();
  await loadReviews();

  const submitBtn = document.querySelector("#review-form .form-actions button:last-child");
  if (submitBtn) {
    submitBtn.addEventListener("click", submitReview);
  }
});
