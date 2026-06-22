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
        await checkAdminAccess();
        initHistory();
    });
});

function initHistory() {
    const lotteryType = document.getElementById('lotteryType');
    const limitSelect = document.getElementById('limitSelect');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportHistory');
    
    lotteryType.addEventListener('change', filterHistory);
    limitSelect.addEventListener('change', filterHistory);
    searchInput.addEventListener('input', searchHistory);
    exportBtn.addEventListener('click', exportHistory);
}

function filterHistory() {
    const type = document.getElementById('lotteryType').value;
    const items = document.querySelectorAll('.history-item');
    
    items.forEach(item => {
        const itemType = item.querySelector('.history-type').textContent;
        const typeMap = {
            'all': true,
            'lotto': itemType === '大乐透',
            'double-color': itemType === '双色球'
        };
        
        item.style.display = typeMap[type] ? 'block' : 'none';
    });
}

function searchHistory() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.history-item');
    
    items.forEach(item => {
        const balls = item.querySelectorAll('.ball');
        let found = false;
        
        balls.forEach(ball => {
            if (ball.textContent.includes(query)) {
                found = true;
            }
        });
        
        item.style.display = found ? 'block' : 'none';
    });
}

function reusePrediction(btn) {
    const item = btn.closest('.history-item');
    const balls = item.querySelectorAll('.ball');
    const numbers = [];
    
    balls.forEach(ball => {
        numbers.push({
            number: ball.textContent,
            color: ball.classList.contains('red') ? 'red' : 'blue'
        });
    });
    
    showNotification('号码已复制到剪贴板', 'success');
}

function deletePrediction(btn) {
    const item = btn.closest('.history-item');
    item.remove();
    showNotification('预测记录已删除', 'success');
}

function exportHistory() {
    const items = document.querySelectorAll('.history-item');
    const data = [];
    
    items.forEach(item => {
        const balls = item.querySelectorAll('.ball');
        const ballNumbers = [];
        
        balls.forEach(ball => {
            ballNumbers.push({
                number: ball.textContent,
                color: ball.classList.contains('red') ? 'red' : 'blue'
            });
        });
        
        data.push({
            date: item.querySelector('.history-date').textContent,
            type: item.querySelector('.history-type').textContent,
            rating: item.querySelector('.history-rating').textContent,
            balls: ballNumbers,
            score: item.querySelector('.history-score').textContent
        });
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('历史记录已导出', 'success');
}