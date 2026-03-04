// 1️⃣ 헤더 HTML 먼저 즉시 삽입
fetch("../header.html")
    .then(res => res.text())
    .then(html => {
        const header = document.querySelector("header");
        if (!header) return;

        header.innerHTML = html;

        const userMenu = header.querySelector(".user-menu");

        // 기본 상태 (비로그인)
        userMenu.innerHTML = `
            <a href="login.html">로그인</a>
            <a href="join.html">회원가입</a>
        `;

        // 2️⃣ 로그인 상태 비동기 확인
        fetch("http://127.0.0.1:8000/api/auth/me", {
            credentials: "include"
        })
        .then(res => res.status === 401 ? null : res.json())
        .then(user => {
            if (!user) return;

            userMenu.innerHTML = `
                <a href="mypage.html" class="userBtn">
                    <img src="${user.img ?? '/images/ui/default-user.png'}" loading="lazy">
                    ${user.nickname}

                    <ul>
                        <li><a href="mypage.html">
                            <img src="images/ui/user-1.png" alt="mypage">
                            <span>마이페이지</span>
                        </a></li>
                        <li>
                            <img src="images/ui/exit.png" alt="logout">
                            <span>로그아웃</span>
                        </li>
                    </ul>
                </a>
            `;
        });
    });
