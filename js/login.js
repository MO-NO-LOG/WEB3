const API = "http://127.0.0.1:8000";
const ACCESS_TOKEN_KEY = "access_token";

const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
fetch(`${API}/api/auth/me`, {
    credentials: "include",
    headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {}
})
    .then(res => {
        if (res.ok) {
            // 이미 로그인됨
            location.href = "index.html";
        }
    });

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    try {
        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email,
                password,
                remember_me: rememberMe
            })
        });

        if (!res.ok) {
            alert("아이디 또는 비밀번호가 올바르지 않습니다.");
            return;
        }

        const data = await res.json();
        if (data?.access_token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        }

        // 로그인 성공 후 메인으로
        location.href = "index.html";

    } catch (err) {
        console.error(err);
        alert("서버 오류가 발생했습니다.");
    }
});
