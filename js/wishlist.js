const movieGrid = document.getElementById("movieGrid");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");

function updateCountAndEmpty() {
    const cards = [...movieGrid.querySelectorAll(".movie-card")];
    totalCount.textContent = cards.length;

    if (cards.length === 0) {
        emptyState.classList.add("show");
        movieGrid.style.display = "none";
    } else {
        emptyState.classList.remove("show");
        movieGrid.style.display = "grid";
    }
}

document.addEventListener("click", (e) => {
    const wishBtn = e.target.closest(".wish-btn");
    if (!wishBtn) return;

    e.preventDefault();
    e.stopPropagation();

    // on → off 되면 카드 삭제
    if (wishBtn.classList.contains("on")) {
        wishBtn.classList.remove("on");
        const card = wishBtn.closest(".movie-card");
        card.remove();
        updateCountAndEmpty();
    } else {
        // off → on (필요하면)
        wishBtn.classList.add("on");
    }
});

const sortBox = document.getElementById("sortBox");
const sortLabel = document.getElementById("sortLabel");
const sortList = document.getElementById("sortList");

sortBox.addEventListener("click", (e) => {
    sortBox.classList.toggle("open");

    const item = e.target.closest(".sort-item");
    if (!item) return;

    [...sortList.querySelectorAll(".sort-item")].forEach(li => li.classList.remove("active"));
    item.classList.add("active");
    sortLabel.textContent = item.textContent;

    sortMovies(item.dataset.sort);
});

document.addEventListener("click", (e) => {
    if (!sortBox.contains(e.target)) sortBox.classList.remove("open");
});

function sortMovies(type) {
    const cards = [...movieGrid.querySelectorAll(".movie-card")];

    cards.sort((a, b) => {
        if (type === "kor") {
            return a.dataset.title.localeCompare(b.dataset.title, "ko");
        }
        if (type === "latest") {
            return new Date(b.dataset.added) - new Date(a.dataset.added);
        }
        if (type === "year") {
            return Number(b.dataset.year) - Number(a.dataset.year);
        }
        if (type === "rating") {
            return Number(b.dataset.rating) - Number(a.dataset.rating);
        }
        return 0;
    });

    cards.forEach(card => movieGrid.appendChild(card));
}

updateCountAndEmpty();
