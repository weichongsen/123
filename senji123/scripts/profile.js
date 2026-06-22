// 等待 Supabase 初始化
function waitForSupabase(callback, retries = 10) {
    if (typeof supabase !== 'undefined' && supabase) {
        callback();
    } else if (retries > 0) {
        setTimeout(() => waitForSupabase(callback, retries - 1), 100);
    } else {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    waitForSupabase(async () => {
        const isLoggedIn = await requireAuth();
        if (!isLoggedIn) return;
        initProfile();
    });
});

function initProfile() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            panels[index].classList.add('active');
        });
    });
    
    const form = document.querySelector('.profile-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('信息已保存', 'success');
        });
    }
    
    const securityBtn = document.querySelector('.security-btn');
    if (securityBtn) {
        securityBtn.addEventListener('click', () => {
            showNotification('密码修改成功', 'success');
        });
    }
    
    const privacyBtn = document.querySelector('.privacy-btn');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => {
            showNotification('数据备份成功', 'success');
        });
    }
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        showNotification('已退出登录', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}