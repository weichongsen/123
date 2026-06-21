document.addEventListener('DOMContentLoaded', () => {
    initVIP();
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