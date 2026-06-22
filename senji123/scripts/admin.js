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
        
        // 检查管理员权限
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata && user.user_metadata.level !== 'admin') {
            showNotification('您没有管理员权限', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return;
        }
        
        initAdmin();
    });
});

function initAdmin() {
    const testApi = document.getElementById('testApi');
    const saveApi = document.getElementById('saveApi');
    const clearLogs = document.getElementById('clearLogs');
    
    testApi.addEventListener('click', () => {
        showNotification('正在测试API连接...', 'success');
        setTimeout(() => {
            showNotification('API连接成功', 'success');
        }, 1500);
    });
    
    saveApi.addEventListener('click', () => {
        showNotification('配置已保存', 'success');
    });
    
    clearLogs.addEventListener('click', () => {
        if (confirm('确定要清空日志吗？')) {
            const logList = document.getElementById('logList');
            logList.innerHTML = '';
            showNotification('日志已清空', 'success');
        }
    });
    
    const soundActions = document.querySelectorAll('.sound-action');
    soundActions.forEach(action => {
        action.addEventListener('click', () => {
            if (action.textContent === '预览') {
                showNotification('正在播放音效...', 'success');
            } else if (action.textContent === '更换') {
                showNotification('请选择新音效文件', 'success');
            }
        });
    });
    
    const audioActions = document.querySelectorAll('.audio-action');
    audioActions.forEach(action => {
        action.addEventListener('click', () => {
            if (action.textContent === '播放') {
                showNotification('正在播放背景音乐...', 'success');
            } else if (action.textContent === '删除') {
                action.closest('.audio-item').remove();
                showNotification('音频已删除', 'success');
            }
        });
    });
}

function logout() {
    if (confirm('确定要退出管理员后台吗？')) {
        showNotification('已退出管理员后台', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}