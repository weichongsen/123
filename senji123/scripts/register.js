// 等待 Supabase 初始化完成
function waitForSupabase(callback, retries = 10) {
    if (supabase) {
        callback();
    } else if (retries > 0) {
        setTimeout(() => waitForSupabase(callback, retries - 1), 100);
    } else {
        showNotification('Supabase 初始化失败，请刷新页面', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    waitForSupabase(() => {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // 检查是否已登录
        checkAuth();
    });
});

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // 已登录，跳转到首页
        window.location.href = 'index.html';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !email || !password || !confirmPassword) {
        showNotification('请填写所有字段', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('密码长度至少6位', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = '注册中...';
    submitBtn.disabled = true;
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                }
            }
        });
        
        if (error) {
            showNotification('注册失败：' + error.message, 'error');
        } else {
            showNotification('注册成功，请登录', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    } catch (err) {
        showNotification('网络错误，请稍后重试', 'error');
    } finally {
        btnText.textContent = originalText;
        submitBtn.disabled = false;
    }
}