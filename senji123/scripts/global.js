// Supabase 配置 - 请替换为您自己的值
const SUPABASE_URL = 'https://kltgecxywsajonxjsawz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3C8V8U4lPZUQ0xDYFzBLWA_2I_yR6q8';

let supabase = null;

// 等待 DOM 加载完成后初始化 Supabase
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase 已连接');
    } else {
        console.error('Supabase SDK 未加载');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}

function getRandomNumbers(min, max, count) {
    const numbers = [];
    while (numbers.length < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers.sort((a, b) => a - b);
}

function animateNumberBalls(balls) {
    balls.forEach((ball, index) => {
        setTimeout(() => {
            ball.classList.add('rolling');
            let current = 0;
            const target = parseInt(ball.textContent);
            const interval = setInterval(() => {
                current = Math.floor(Math.random() * 35) + 1;
                ball.textContent = current.toString().padStart(2, '0');
            }, 50);
            
            setTimeout(() => {
                clearInterval(interval);
                ball.textContent = target.toString().padStart(2, '0');
                ball.classList.remove('rolling');
            }, 1500 + index * 200);
        }, index * 500);
    });
}

function generateLottoNumbers() {
    const front = getRandomNumbers(1, 35, 5);
    const back = getRandomNumbers(1, 12, 2);
    return { front, back };
}

function generateDoubleColorNumbers() {
    const red = getRandomNumbers(1, 33, 6);
    const blue = getRandomNumbers(1, 16, 1);
    return { red, blue };
}

function calculateAIRating(numbers) {
    const score = Math.random() * 30 + 70;
    if (score >= 95) return { rating: 'SSS', score: score.toFixed(1) };
    if (score >= 90) return { rating: 'SS', score: score.toFixed(1) };
    if (score >= 85) return { rating: 'S', score: score.toFixed(1) };
    if (score >= 80) return { rating: 'A', score: score.toFixed(1) };
    return { rating: 'B', score: score.toFixed(1) };
}

function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

function exportNumbers(numbers, type) {
    const data = JSON.stringify(numbers, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_numbers_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 需要登录验证 - 保护需要登录才能访问的页面
async function requireAuth() {
    if (!supabase) {
        window.location.href = 'login.html';
        return false;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 退出登录
async function logout() {
    if (supabase) {
        await supabase.auth.signOut();
    }
    window.location.href = 'login.html';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

async function saveFavorite(numbers, type) {
    if (!supabase) return;
    const { data, error } = await supabase
        .from('favorites')
        .insert({ numbers, type, created_at: new Date().toISOString() });
    if (error) {
        showNotification('保存失败', 'error');
    } else {
        showNotification('收藏成功');
    }
}

async function getFavorites() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false });
    return error ? [] : data;
}

async function deleteFavorite(id) {
    if (!supabase) return;
    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);
    if (error) {
        showNotification('删除失败', 'error');
    } else {
        showNotification('删除成功');
    }
}

async function savePrediction(numbers, type, rating, score) {
    if (!supabase) return;
    const { data, error } = await supabase
        .from('predictions')
        .insert({ 
            numbers, 
            type, 
            rating, 
            score,
            created_at: new Date().toISOString() 
        });
    if (error) {
        showNotification('保存失败', 'error');
    } else {
        showNotification('预测记录已保存');
    }
}

async function getPredictions(limit = 50) {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    return error ? [] : data;
}

async function deletePrediction(id) {
    if (!supabase) return;
    const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id);
    if (error) {
        showNotification('删除失败', 'error');
    } else {
        showNotification('删除成功');
    }
}

async function getUserProfile() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
    
    return profileError ? null : profile;
}

document.addEventListener('DOMContentLoaded', () => {
    const particles = document.querySelector('.particle-background');
    if (particles) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.width = particle.style.height = `${Math.random() * 3 + 1}px`;
            particles.appendChild(particle);
        }
    }
});

document.addEventListener('mousemove', (e) => {
    const aura = document.createElement('div');
    aura.className = 'mouse-aura';
    aura.style.left = `${e.clientX}px`;
    aura.style.top = `${e.clientY}px`;
    document.body.appendChild(aura);
    
    setTimeout(() => {
        aura.classList.add('fade');
        setTimeout(() => {
            document.body.removeChild(aura);
        }, 1000);
    }, 10);
});