const API = "http://127.0.0.1:8000";

// ========================
// 성별 버튼 처리
// ========================
const genderBtns = document.querySelectorAll(".gender-btn");
const genderInput = document.getElementById("gender");

genderBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    genderBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // 백엔드 기준: M / F 로 맞춤
    genderInput.value = btn.dataset.gender === "male" ? "M" : "F";
  });
});

// ========================
// 회원가입 처리
// ========================
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const repassword = document.getElementById("repassword").value;
  const gender = genderInput.value;

  // 아이디 = 닉네임으로 사용 (HTML 구조상 아이디 input이 nickname 역할)
  const nickname = document.querySelector(
    '.input-box input[type="text"]'
  ).value.trim();

  // ===== 유효성 검사 =====
  if (!email || !password || !nickname) {
    alert("필수 항목을 모두 입력하세요.");
    return;
  }

  if (password !== repassword) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (!gender) {
    alert("성별을 선택하세요.");
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        nickname,
        gender
      })
    });

    const data = await res.json();

if (!res.ok) {
  alert(
    typeof data.detail === "string"
      ? data.detail
      : "회원가입 실패"
  );
  return;
}


    alert("회원가입 완료! 로그인 페이지로 이동합니다.");
    location.href = "login.html";

  } catch (err) {
    console.error(err);
    alert("서버 오류가 발생했습니다.");
  }
});
