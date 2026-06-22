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
        initAnalysis();
    });
});

function initAnalysis() {
    initSumChart();
    initSpanChart();
    
    const applyBtn = document.querySelector('.apply-btn');
    applyBtn.addEventListener('click', applyFilter);
}

function initSumChart() {
    const chartDom = document.getElementById('sumChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        backgroundColor: 'transparent',
        grid: {
            top: 10,
            right: 10,
            bottom: 20,
            left: 40
        },
        xAxis: {
            type: 'category',
            data: ['1-20', '21-40', '41-60', '61-80', '81-100', '101-120'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [{
            data: [5, 12, 28, 35, 15, 5],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#00F5FF' },
                    { offset: 1, color: '#6E00FF' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    };
    
    myChart.setOption(option);
}

function initSpanChart() {
    const chartDom = document.getElementById('spanChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        backgroundColor: 'transparent',
        grid: {
            top: 10,
            right: 10,
            bottom: 20,
            left: 40
        },
        xAxis: {
            type: 'category',
            data: ['10-15', '16-20', '21-25', '26-30', '31-35'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [{
            data: [8, 15, 28, 22, 12],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#00FF9D' },
                    { offset: 1, color: '#00F5FF' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    };
    
    myChart.setOption(option);
}

function applyFilter() {
    const lotteryType = document.getElementById('lotteryType').value;
    const dataRange = document.getElementById('dataRange').value;
    
    showNotification(`已应用筛选：${lotteryType === 'lotto' ? '大乐透' : '双色球'} - 近${dataRange === 'all' ? '全部历史' : dataRange + '期'}`, 'success');
}