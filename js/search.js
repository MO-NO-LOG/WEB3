const searchBox = document.querySelector('.search-box');
const searchInput = searchBox?.querySelector('input');
const searchButton = searchBox?.querySelector('button');

function goSearch() {
  if (!searchInput) return;

  const keyword = searchInput.value.trim();
  const url = keyword
    ? `movielist.html?keyword=${encodeURIComponent(keyword)}`
    : 'movielist.html';

  window.location.href = url;
}

if (searchButton) {
  searchButton.addEventListener('click', goSearch);
}

if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goSearch();
    }
  });
}
