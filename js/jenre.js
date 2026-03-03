const genreRow = document.getElementById("genreRow");

genreRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".genre-btn");
    if (!btn) return;

    const isActive = btn.classList.contains("active");
    const activeCount = genreRow.querySelectorAll(".genre-btn.active").length;

    if (isActive) {
        btn.classList.remove("active");
        return;
    }

    if (activeCount >= 3) {
        alert("장르는 최대 3개까지 선택할 수 있어요.");
        return;
    }

    // 그 외 → 선택
    btn.classList.add("active");
});

document.addEventListener("click", (e) => {
    const wishBtn = e.target.closest(".wish-btn");
    if (!wishBtn) return;

    e.preventDefault();
    e.stopPropagation();

    wishBtn.classList.toggle("on");
});