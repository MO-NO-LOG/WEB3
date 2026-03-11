const API = "http://127.0.0.1:8000";
const moviesPerPage = 24;
let currentPage = 1;
let totalPages = 1;
let currentMovies = [];

const params = new URLSearchParams(window.location.search);
const keyword = (params.get("keyword") || "").trim();

function toGenre(movie) {
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres[0];
  }
  return "ETC";
}

function toDateText(movie) {
  if (!movie.releaseDate) return "-";
  return String(movie.releaseDate).replaceAll("-", ".");
}

function renderMovies() {
  const grid = document.getElementById("movieGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (currentMovies.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#666;">검색 결과가 없습니다.</p>`;
    return;
  }

  currentMovies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="card-poster">
        <img src="${movie.posterUrl || "images/no-poster.png"}" alt="${movie.title}">
        <button class="wish-btn" type="button" aria-label="위시리스트">
          <span class="wish-icon"></span>
        </button>
      </div>

      <div class="card-info">
        <div class="card-top">
          <span class="genre">${toGenre(movie)}</span>
          <span class="rating">★${movie.averageRating ?? 0}</span>
        </div>
        <div class="title">${movie.title}</div>
        <div class="date">${toDateText(movie)}</div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".wish-btn")) return;
      window.location.href = `review.html?movieId=${movie.id}`;
    });

    grid.appendChild(card);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.onclick = () => {
      currentPage = i;
      loadMovies();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    pagination.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.className = "arrow-btn";
  nextBtn.textContent = ">";

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadMovies();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  pagination.appendChild(nextBtn);
}

async function loadMovies() {
  try {
    const page = Math.max(currentPage - 1, 0);
    const url = `${API}/api/movies/search?keyword=${encodeURIComponent(keyword)}&searchType=TITLE&page=${page}&size=${moviesPerPage}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const rawMovies = Array.isArray(data.movies) ? data.movies : [];

    // 동일 제목 중복 영화가 많은 DB 상태를 보정: 제목 기준으로 1개만 노출
    const titleSeen = new Set();
    currentMovies = rawMovies.filter((m) => {
      const key = String(m.title || "").trim().toLowerCase();
      if (!key || titleSeen.has(key)) return false;
      titleSeen.add(key);
      return true;
    });
    totalPages = Math.max(data.totalPages ?? 1, 1);

    const pageTitle = document.querySelector('.page-title');
    if (pageTitle && keyword) {
      pageTitle.textContent = `"${keyword}" 검색 결과`;
    }

    renderMovies();
    renderPagination();
  } catch (err) {
    console.error("영화 목록 로드 실패:", err);
  }
}

loadMovies();

document.addEventListener("click", (e) => {
  const wishBtn = e.target.closest(".wish-btn");
  if (!wishBtn) return;

  e.preventDefault();
  e.stopPropagation();
  wishBtn.classList.toggle("on");
});
