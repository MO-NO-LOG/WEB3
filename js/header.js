(() => {
    const API_BASE = "http://127.0.0.1:8000";
    const ACCESS_TOKEN_KEY = "access_token";

    // 기존 코드는 고정 상대경로를 사용했습니다.
    // fetch("../header.html")
    // 실행 경로 차이로 헤더 경로가 깨질 수 있어 web2 루트 기준으로 로드합니다.
    fetch("header.html")
        .then(res => res.text())
        .then(async (html) => {
            const header = document.querySelector("header");
            if (!header) return;

            header.innerHTML = html;

            const userMenu = header.querySelector(".user-menu");
            if (!userMenu) return;

            // 기본 상태(비로그인)
            userMenu.innerHTML = `
                <a href="login.html">濡쒓렇??/a>
                <a href="join.html">?뚯썝媛??/a>
            `;

            const token = localStorage.getItem(ACCESS_TOKEN_KEY);
            if (!token) return;

            // 로그인 상태 확인
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return;
            const user = await res.json();

            userMenu.innerHTML = `
                <a href="mypage.html" class="userBtn">
                    <img src="${user.img ?? 'images/ui/user.png'}" loading="lazy" alt="user">
                    <span class="nickname">${user.nickname}</span>
                </a>
            `;
        })
        .catch((err) => {
            console.error("header load failed:", err);
        });
})();
