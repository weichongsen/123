// 等待 Supabase 初始化完成
function waitForSupabase(callback, retries = 10) {
    // 检查全局的 supabase 变量是否已初始化
    if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined') {
        // 如果全局的 supabase 已经存在但我们的局部变量还未初始化
        if (!window._supabaseInitialized) {
            window._supabaseInitialized = true;
            supabase = window.supabase.createClient('https://kltgecxywsajonxjsawz.supabase.co', 'sb_publishable_3C8V8U4lPZUQ0xDYFzBLWA_2I_yR6q8');
            console.log('Supabase 通过备用路径初始化');
        }
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