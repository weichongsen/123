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
        initFavorites();
    });
});

function initFavorites() {
    const lotteryType = document.getElementById('lotteryType');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    lotteryType.addEventListener('change', filterFavorites);
    exportBtn.addEventListener('click', exportFavorites);
    clearBtn.addEventListener('click', clearAllFavorites);
}

function filterFavorites() {
    const type = document.getElementById('lotteryType').value;
    const cards = document.querySelectorAll('.favorite-card');
    
    cards.forEach(card => {
        const cardType = card.querySelector('.lottery-type').textContent;
        const typeMap = {
            'all': true,
            'lotto': cardType === '大乐透',
            'double-color': cardType === '双色球'
        };
        
        card.style.display = typeMap[type] ? 'block' : 'none';
    });
}

function removeFavorite(btn) {
    const card = btn.closest('.favorite-card');
    card.remove();
    
    checkEmptyState();
    showNotification('已取消收藏', 'success');
}

function checkEmptyState() {
    const list = document.getElementById('favoritesList');
    const emptyState = document.getElementById('emptyState');
    
    if (list.children.length === 0) {
        emptyState.style.display = 'block';
    }
}

function exportFavorites() {
    const cards = document.querySelectorAll('.favorite-card');
    const data = [];
    
    cards.forEach(card => {
        const balls = card.querySelectorAll('.ball');
        const ballNumbers = [];
        
        balls.forEach(ball => {
            ballNumbers.push({
                number: ball.textContent,
                color: ball.classList.contains('red') ? 'red' : 'blue'
            });
        });
        
        data.push({
            type: card.querySelector('.lottery-type').textContent,
            date: card.querySelector('.favorite-date').textContent,
            balls: ballNumbers,
            score: card.querySelector('.ai-score').textContent
        });
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('收藏数据已导出', 'success');
}

function clearAllFavorites() {
    if (confirm('确定清空所有收藏吗？')) {
        const list = document.getElementById('favoritesList');
        list.innerHTML = '';
        checkEmptyState();
        showNotification('已清空所有收藏', 'success');
    }
}