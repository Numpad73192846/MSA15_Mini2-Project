// 사용자 정의 자바스크립트

let accessTokenMemory = null;

function setAccessToken(token) {
    accessTokenMemory = token || null;
    if (token) {
        localStorage.setItem('accessToken', token);
    }
}

function getAccessToken() {
    // 먼저 메모리에서 확인
    if (accessTokenMemory) return accessTokenMemory;
    
    // 메모리에 없으면 localStorage에서 가져오기
    const stored = localStorage.getItem('accessToken');
    if (stored) {
        accessTokenMemory = stored;  // 메모리에도 저장
    }
    return accessTokenMemory;
}

function buildAuthHeaders() {
    const token = getAccessToken();
    console.log("[Auth] 현재 토큰:", token ? "있음" : "없음");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function refreshAccessToken() {
    try {
        console.log("[RefreshToken] 토큰 갱신 시작");
        const refreshToken = localStorage.getItem('refreshToken');
        
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refreshToken: refreshToken }),
            credentials: "include"
        });

        if (!response.ok) {
            console.log("[RefreshToken] 응답 실패:", response.status);
            return false;
        }

        const data = await response.json();
        console.log("[RefreshToken] 응답 데이터:", data);
        
        if (data && data.success && data.data && data.data.accessToken) {
            setAccessToken(data.data.accessToken);
            // refreshToken도 갱신된 경우 저장
            if (data.data.refreshToken) {
                localStorage.setItem('refreshToken', data.data.refreshToken);
            }
            console.log("[RefreshToken] 토큰 저장 성공");
            return true;
        }

        console.log("[RefreshToken] 토큰 데이터 없음");
        return false;
    } catch (error) {
        console.error("[RefreshToken] 에러:", error);
        return false;
    }
}

function clearTokens() {
    accessTokenMemory = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

function setNavState(isAuth, authList) {
    const navGuestArea = document.getElementById("navGuestArea");
    const navUserArea = document.getElementById("navUserArea");
    const navUserMyPageBtn = document.getElementById("navUserMyPageBtn");
    const navTutorDashboardBtn = document.getElementById("navTutorDashboardBtn");
    const navTutorMyPageBtn = document.getElementById("navTutorMyPageBtn");

    if ( !navGuestArea || !navUserArea ) {
        return;
    }

    if ( !Array.isArray(authList) ) {
        authList = [];
    }

    if ( isAuth ) {
        navGuestArea.style.display = "none";
        navUserArea.style.display = "flex";

        const isTutor = authList.some(a => a.auth === "ROLE_TUTOR" || a === "ROLE_TUTOR");
        const isTutorPending = authList.some(a => a.auth === "ROLE_TUTOR_PENDING" || a === "ROLE_TUTOR_PENDING");
        const isAdmin = authList.some(a => a.auth === "ROLE_ADMIN" || a === "ROLE_ADMIN");

        if ( isTutor || isTutorPending || isAdmin ) {
            navUserMyPageBtn.style.display = "none";

            if (isTutorPending) {
                navTutorDashboardBtn.style.display = "none";
                navTutorMyPageBtn.style.display = "inline-block";
                navTutorMyPageBtn.textContent = "추가 정보 작성";
                navTutorMyPageBtn.onclick = () => { location.href = "/tutor/register"; };
            }

            else if ( isAdmin ) {
                navTutorDashboardBtn.style.display = "none";
                navTutorMyPageBtn.style.display = "inline-block";
                navTutorMyPageBtn.textContent = "관리자 페이지";
                navTutorMyPageBtn.onclick = () => { location.href = "/admin"; };
            }

            else {
                navTutorDashboardBtn.style.display = "inline-block";
                navTutorMyPageBtn.style.display = "inline-block";
            }
        }
        
        else {
            navUserMyPageBtn.style.display = "inline-block";
            navTutorDashboardBtn.style.display = "none";
            navTutorMyPageBtn.style.display = "none";
        }
    }

    else {
        navGuestArea.style.display = "flex";
        navUserArea.style.display = "none";
    }

}

function fetchUserInfo() {
    console.log("[FetchUserInfo] 시작");
    fetch("/api/users/me", {
        method: "GET",
        headers: buildAuthHeaders(),
        credentials: "include"
    })
    .then(response => {
        console.log("[FetchUserInfo] 응답 상태:", response.status);
        if (response.ok) {
            return response.json();
        }

        return refreshAccessToken()
            .then((refreshed) => {
                console.log("[FetchUserInfo] 토큰 갱신 결과:", refreshed);
                if (!refreshed) {
                    throw new Error("토큰 갱신에 실패했습니다.");
                }
                return fetch("/api/users/me", {
                    method: "GET",
                    headers: buildAuthHeaders(),
                    credentials: "include"
                });
            })
            .then((res) => {
                console.log("[FetchUserInfo] 재시도 응답 상태:", res.status);
                if (res.ok) {
                    return res.json();
                }
                throw new Error("토큰 갱신 후 사용자 정보를 불러오지 못했습니다.");
            });
    })
    .then((data) => {
        console.log("[FetchUserInfo] 사용자 데이터:", data);
        if (data && data.success && data.data) {
            const authList = data.data.authList || [];
            setNavState(true, authList);

            const isTutorPending = Array.isArray(authList) && authList.some(a => a.auth === "ROLE_TUTOR_PENDING" || a === "ROLE_TUTOR_PENDING");
            const isRegisterPage = location.pathname.startsWith("/tutor/register");
            const isAdmin = Array.isArray(authList) && authList.some(a => a.auth === "ROLE_ADMIN" || a === "ROLE_ADMIN");
            const isAdminPage = location.pathname.startsWith("/admin");
            if (isTutorPending && !isRegisterPage) {
                location.href = "/tutor/register";
            }

            if (isAdmin && !isAdminPage) {
                location.href = "/admin";
            }

        } 
        else {
            setNavState(false);
        }
    })
    .catch((error) => {
        console.error("사용자 정보 조회 실패:", error);
        setNavState(false);
    });
}


function setupLogoutButton() {
    const logoutBtn = document.getElementById("navLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            const refreshToken = localStorage.getItem('refreshToken');
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ refreshToken: refreshToken }),
                credentials: "include"
            });

            clearTokens();
            setNavState(false);
            window.location.href = "/";
        });
    }
}

// Top Button Functionality
function setupTopButton() {
    const topBtn = document.getElementById('topBtn');
    
    if (!topBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 100) {
            topBtn.classList.add('show');
        } else {
            topBtn.classList.remove('show');
        }
    });

    // Smooth scroll to top
    topBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await refreshAccessToken();
    fetchUserInfo();
    setupLogoutButton();
    setupTopButton();
});
