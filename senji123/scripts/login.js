// 等待 Supabase 初始化完成（带超时）
function waitForSupabase(callback, retries = 80) {
    if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
        callback();
        return;
    }

    let attempts = 0;
    const tryCheck = () => {
        if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
            callback();
            return;
        } else if (attempts >= retries) {
            console.error('Supabase 初始化超时');
            if (typeof showNotification === 'function') {
                showNotification('系统初始化失败，请刷新页面', 'error');
            }
        } else {
            attempts++;
            setTimeout(tryCheck, 200);
        }
    };
    tryCheck();
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    waitForSupabase(() => {
        checkAuth();
    });
});

async function checkAuth() {
    const client = getSupabase();
    if (!client) return;
    try {
        const { data: { session } } = await client.auth.getSession();
        if (session) {
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('检查登录状态失败:', err);
    }
}

function setButtonLoading(loading) {
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (!submitBtn) return;
    const btnText = submitBtn.querySelector('.btn-text');
    if (loading) {
        submitBtn.dataset.originalText = btnText ? btnText.textContent : '登录';
        if (btnText) btnText.textContent = '登录中...';
        submitBtn.disabled = true;
    } else {
        if (btnText && submitBtn.dataset.originalText) btnText.textContent = submitBtn.dataset.originalText;
        submitBtn.disabled = false;
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const client = getSupabase();
    if (!client) {
        showNotification('系统初始化中，请稍后重试', 'error');
        return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showNotification('请填写邮箱和密码', 'error');
        return;
    }

    setButtonLoading(true);

    try {
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('登录失败:', error);
            showNotification('登录失败：' + (error.message || '邮箱或密码错误'), 'error');
        } else {
            showNotification('登录成功，正在跳转...', 'success');
            
            // 等待会话持久化完成（最多等待 3 秒）
            let waitCount = 0;
            const maxWait = 30; // 最多等待 30 * 100ms = 3 秒
            
            const waitForSession = async () => {
                const { data: { session } } = await client.auth.getSession();
                if (session || waitCount >= maxWait) {
                    if (session) {
                        console.log('会话已持久化，跳转到首页');
                        window.location.href = 'index.html';
                    } else {
                        showNotification('会话保存失败，请重试', 'error');
                    }
                } else {
                    waitCount++;
                    setTimeout(waitForSession, 100);
                }
            };
            
            setTimeout(waitForSession, 300); // 先等待 300ms 让会话开始保存
        }
    } catch (err) {
        console.error('登录异常:', err);
        showNotification('网络错误，请稍后重试', 'error');
    } finally {
        setButtonLoading(false);
    }
}
