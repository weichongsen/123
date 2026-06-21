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
        initVIP();
    });
});

function initVIP() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            answer.classList.toggle('active');
        });
    });
    
    const cardBtns = document.querySelectorAll('.card-btn:not(:disabled)');
    
    cardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('正在跳转支付页面...', 'success');
        });
    });
}