const API = "http://127.0.0.1:8000";

/* 공통 카드 생성 (rank-card + clip 구조) */
function renderMovieCard(movie, rank = null) {
  return `
    <article class="movie-card ${rank ? "rank-card" : ""}">
      ${rank ? `<span class="rank-num">${rank}</span>` : ""}

      <a href="review.html?movieId=${movie.id}">
        <div class="clip">
          <img src="${movie.posterUrl || "images/no-poster.png"}" alt="${movie.title}">
          <div class="movie-overlay">
            <h4>${movie.title}</h4>
            <div class="text-box">
              <p>${movie.releaseDate || ""}</p>
              <span class="rating">★${movie.averageRating ?? 0}</span>
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
}

/* 트렌드 */
fetch(API + "/api/movies/trend")
  .then(res => res.json())
  .then(movies => {
    document.getElementById("trendList").innerHTML =
      movies.map(m => renderMovieCard(m)).join("");
  });

/* 기존 코드: recommended API를 3번 호출
fetch(API + "/api/movies/recommended")
  .then(res => res.json())
  .then(movies => {
    const top7 = movies
      .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));

    document.getElementById("top7List").innerHTML =
      top7.map((m, i) => renderMovieCard(m, i + 1)).join("");
  });

fetch(API + "/api/movies/recommended")
  .then(res => res.json())
  .then(movies => {
    document.getElementById("ratingList").innerHTML =
      movies.map(m => renderMovieCard(m)).join("");
  });

fetch(API + "/api/movies/recommended")
  .then(res => res.json())
  .then(movies => {
    document.getElementById("endingList").innerHTML =
      movies.map(m => renderMovieCard(m)).join("");
  });
*/

/* recommended 1회 호출 후 재사용 */
fetch(API + "/api/movies/recommended?limit=10")
  .then(res => res.json())
  .then(movies => {
    const sorted = [...movies].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));

    document.getElementById("top7List").innerHTML =
      sorted.slice(0, 7).map((m, i) => renderMovieCard(m, i + 1)).join("");

    document.getElementById("ratingList").innerHTML =
      sorted.map(m => renderMovieCard(m)).join("");

    document.getElementById("endingList").innerHTML =
      movies.map(m => renderMovieCard(m)).join("");
  });
