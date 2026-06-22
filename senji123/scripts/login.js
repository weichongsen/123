// 等待 Supabase 初始化完成
function waitForSupabase(callback, retries = 10) {
    // 直接使用 global.js 中初始化的 supabase 全局变量
    if (typeof supabase !== 'undefined' && supabase) {
        callback();
    } else if (retries > 0) {
        console.log(`等待 Supabase 初始化，剩余重试次数: ${retries}`);
        setTimeout(() => waitForSupabase(callback, retries - 1), 100);
    } else {
        showNotification('Supabase 初始化失败，请刷新页面', 'error');
        console.error('Supabase SDK 加载超时');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    waitForSupabase(() => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // 检查是否已登录（异步执行）
        checkAuth();
    });
});

async function checkAuth() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // 已登录，跳转到首页
        window.location.href = 'index.html';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    if (!supabase) {
        showNotification('系统初始化中，请稍后重试', 'error');
        return;
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('请填写邮箱和密码', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = '登录中...';
    submitBtn.disabled = true;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            showNotification('登录失败：' + error.message, 'error');
        } else {
            showNotification('登录成功，正在跳转...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (err) {
        showNotification('网络错误，请稍后重试', 'error');
    } finally {
        btnText.textContent = originalText;
        submitBtn.disabled = false;
    }
}