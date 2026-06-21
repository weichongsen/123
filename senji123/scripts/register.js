document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('密码长度至少6位', 'error');
        return;
    }
    
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
    btnText.textContent = '注册中...';
    submitBtn.disabled = true;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username
            }
        }
    });
    
    // 恢复按钮状态
    btnText.textContent = originalText;
    submitBtn.disabled = false;
    
    if (error) {
        showNotification('注册失败：' + error.message, 'error');
    } else {
        showNotification('注册成功，请登录', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}