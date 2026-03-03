// @ts-nocheck
const API = "http://127.0.0.1:8000";
const ACCESS_TOKEN_KEY = "access_token";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

fetch(API + `/api/movies/detail/${urlParams.get('movieId')}`)
    .then(res => res.json())
    .then(movies => {
        const meta = document.querySelector(".detail-top .meta");
        if (!meta) return;

        movies.genres.forEach(genresArr => {
            meta.innerHTML += `<span>${genresArr}</span>`;
        });

        meta.innerHTML += `<span>${String(movies.releaseDate || "").substring(0, 4)}</span>`;
        document.querySelector(".detail-top .poster img").src = movies.posterUrl;
        document.querySelector(".detail-top .title").textContent = movies.title;
        document.querySelector(".detail-top .score strong").textContent = movies.averageRating;
        document.querySelector(".detail-top .summary p").textContent = movies.description;
    });


// ======================
// 유틸
// ======================
function getMovieId() {
    return new URLSearchParams(location.search).get("movieId");
}

function starText(rating) {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
}

// ======================
// 리뷰 HTML 생성
// ======================
function makeReviewHTML(review) {
    return `
    <article class="review">
      <div class="review-top">
        <img src="${review.userImg || "https://i.pravatar.cc/100"}">
        <span class="user">${review.userNickname}</span>
        <span class="star">${starText(review.rating)}</span>
      </div>
      <p>${review.content}</p>

      <div class="review-actions">
        <div class="action-row">
          <div class="action">
            <img src="images/ui/like.webp">
            <span>0</span>
          </div>
          <div class="action">
            <img src="images/ui/like.webp" class="rotate-180">
            <span>0</span>
          </div>
          <div class="action">
            <img src="images/ui/comment.webp">
          </div>
        </div>
      </div>
    </article>
  `;
}

// ======================
// 리뷰 불러오기
// ======================
async function loadReviews() {
    const movieId = getMovieId();
    if (!movieId) return;

    // 기존 코드: POST /api/reviews/by-movie (body movieId)
    // 백엔드 스펙에 맞게 GET /api/reviews/by-movie/{movieId}로만 수정
    const res = await fetch(`${API}/api/reviews/by-movie/${movieId}`);
    if (!res.ok) return;

    const data = await res.json();
    const container = document.querySelector(".review-list");
    if (!container) return;

    // 기존 리뷰 제거
    container.querySelectorAll(".review").forEach(r => r.remove());

    data.reviews.forEach(r => {
        container.insertAdjacentHTML("beforeend", makeReviewHTML(r));
    });
}

// ======================
// 리뷰 작성
// ======================
async function submitReview() {
    const movieId = getMovieId();
    const content = document.querySelector("#review-form textarea").value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) {
        alert("로그인 후 이용해주세요.");
        location.href = "login.html";
        return;
    }

    if (!rating || !content.trim()) {
        alert("별점과 내용을 입력해주세요.");
        return;
    }

    const res = await fetch(`${API}/api/reviews/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
            movieId: Number(movieId),
            rating: Number(rating),
            content,
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "리뷰 작성 실패");
        return;
    }

    // 입력 초기화
    document.querySelector("#review-form textarea").value = "";
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
    document.getElementById("review-form").classList.remove("show");

    loadReviews();
}

// ======================
// 이벤트 바인딩
// ======================
document.addEventListener("DOMContentLoaded", () => {
    loadReviews();

    const submitBtn = document.querySelector("#review-form button:last-child");
    if (submitBtn) submitBtn.addEventListener("click", submitReview);
});
