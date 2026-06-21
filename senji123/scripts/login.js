document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // 检查是否已配置 Supabase
    if (!supabase || SUPABASE_URL === 'https://your-supabase-url.supabase.co') {
        showNotification('请先配置 Supabase 数据库连接！', 'error');
        showNotification('编辑 scripts/global.js 填入您的 Supabase URL 和 Key', 'info');
        return;
    }
    
    // 显示加载状态
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = '登录中...';
    submitBtn.disabled = true;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    // 恢复按钮状态
    btnText.textContent = originalText;
    submitBtn.disabled = false;
    
    if (error) {
        showNotification('登录失败：' + error.message, 'error');
    } else {
        showNotification('登录成功，正在跳转...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}