// 全局变量
let currentGameId = null;
let currentPlayerID = 1; // 默认为蓝方（玩家1）
let gameState = null;
let availableEntries = [];
let gameInterval = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function () {
    // 从URL获取当前gameId (exampl: localhost:8080/game/411972312594571400)
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'game') {
        currentGameId = pathParts[2];
        console.log('Game ID from URL:', currentGameId);

        // 如果URL中有游戏ID，获取游戏状态
        if (currentGameId) {
            // 获取初始游戏状态
            getGameState();

            // 设置轮询，每2秒更新一次游戏状态
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            gameInterval = setInterval(getGameState, 1000);
        }
    }
    // 初始化事件监听
    switchPlayer();
    document.getElementById('ok').addEventListener('click', switchPlayer);
});

// 切换玩家函数
function switchPlayer() {
    const playerSelect = document.getElementById('player-select');
    currentPlayerID = playerSelect.value === 'blue' ? 1 : 2;

    // 更新UI以突出显示当前玩家
    updateCurrentPlayerUI();

    // 刷新游戏状态
    if (currentGameId) {
        getGameState();
    }
}

// 更新当前玩家UI
function updateCurrentPlayerUI() {
    const blueSection = document.querySelectorAll('.section-blue');
    const redSection = document.querySelectorAll('.section-red');

    if (currentPlayerID === 1) {
        blueSection.forEach(section => section.classList.add('active-section'));
        redSection.forEach(section => section.classList.remove('active-section'));
    } else {
        blueSection.forEach(section => section.classList.remove('active-section'));
        redSection.forEach(section => section.classList.add('active-section'));
    }
}

// 获取游戏状态
async function getGameState() {
    if (!currentGameId) return;
    getEntries();

    try {
        const response = await fetch(`/game/${currentGameId}/status`);
        const data = await response.json();

        if (data.game) {
            gameState = data.game;
            console.log('Game state:', gameState);

            // 更新UI
            updateGameUI();

            // 检查游戏是否结束
            if (gameState.stage0.available_player.id == 0) {
                clearInterval(gameInterval);
                getGameResult();
            }
        } else {
            console.error('Failed to get game state', data);
        }
    } catch (error) {
        console.error('Error getting game state:', error);
    }
}

// 获取可用英雄
async function getEntries() {
    if (!currentGameId) return;

    try {
        const response = await fetch(`/game/${currentGameId}/entries`);
        const data = await response.json();

        if (data.entries) {
            availableEntries = data.entries;
            console.log('Available Entries:', availableEntries);

            // 更新可用英雄列表
            updateEntriesUI();
        } else {
            console.error('Failed to get available heroes', data);
        }
    } catch (error) {
        console.error('Error getting available heroes:', error);
    }
}

// 更新列表UI
function updateEntriesUI() {
    const heroList = document.getElementById('available-heroes');
    heroList.innerHTML = ''; // 清空现有列表

    availableEntries.forEach(en => {
        const li = document.createElement('li');
        li.dataset.id = en.id;

        const img = document.createElement('img');
        img.src = `/static/img/${en.name}.png`;
        img.alt = en.name;
        img.style.borderRadius = '15%';
        img.style.maxWidth = '100%';

        li.appendChild(img);

        if (en.banned || en.picked || gameState.stage0.available_player.id != currentPlayerID) {
            li.style.pointerEvents = 'none'; // 禁用点击事件
            li.style.opacity = '0.5'; // 设置透明度
        } else {
            li.addEventListener('click', function () {
                selectHero(en.id);
            });
        }
        heroList.appendChild(li);
    });
}

// 选择英雄（Ban或Pick）
async function selectHero(entryId) {
    if (!currentGameId || !gameState) return;

    try {
        const response = await fetch(`/game/${currentGameId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entry_id: entryId,
                player_id: currentPlayerID
            })
        });

        const data = await response.json();

        if (data.msg == 'ok') {
            console.log('Hero selected successfully');
            showMessage('选择成功！', 'success');

            // 立即更新游戏状态
            getGameState();
        } else {
            console.error('Failed to select hero', data);
            showMessage(data.error || '选择失败，请重试', 'error');
        }
    } catch (error) {
        console.error('Error selecting hero:', error);
        showMessage('选择英雄时发生错误', 'error');
    }
}

// 获取游戏结果
async function getGameResult() {
    if (!currentGameId) return;

    try {
        const response = await fetch(`/game/${currentGameId}/result`);
        const data = await response.json();

        if (data.res) {
            console.log('Game result:', data.res);
            showGameResult(data.res);
        } else {
            console.error('Failed to get game result', data);
        }
    } catch (error) {
        console.error('Error getting game result:', error);
    }
}

// 显示游戏结果
function showGameResult(players) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-modal';

    let resultHTML = `
        <div class="result-content">
            <h2 style="text-align:center; padding-bottom: 10px;">本次bp结果(只保留10分钟)</h2>
            <div class="result-players">
                <div class="result-player">
                    <h3 style="color: #1976D2;">蓝方 (${players[0].name})</h3>
                    <div class="result-selections">
                        <div class="result-banned">
                            <h4>已禁用</h4>
                            <ul style="list-style-type:none;">
    `;
    players[0].banned.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px; opacity: 0.5;" />
                                </li>
        `;
    });
    resultHTML += `
                            </ul>
                        </div>
                        <div class="result-picked">
                            <h4>已选择</h4>
                            <ul style="list-style-type:none;">
    `;
    players[0].picked.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px;" />
                                </li>
        `;
    });
    resultHTML += `
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="result-player">
                    <h3 style="color: #D32F2F;">红方 (${players[1].name})</h3>
                    <div class="result-selections">
                        <div class="result-banned">
                            <h4>已禁用</h4>
                            <ul style="list-style-type:none;">
    `;
    players[1].banned.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px; opacity: 0.5;" />
                                </li>
        `;
    });
    resultHTML += `
                            </ul>
                        </div>
                        <div class="result-picked">
                            <h4>已选择</h4>
                            <ul style="list-style-type:none;">
    `;
    players[1].picked.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px;" />
                                </li>
        `;
    });
    resultHTML += `
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    resultDiv.innerHTML = resultHTML;
    document.body.appendChild(resultDiv);
}

// 更新游戏UI
function updateGameUI() {
    if (!gameState) return;

    // 更新当前阶段
    document.getElementById('current-phase').textContent = getPhaseText();

    // 更新蓝队ban位
    updateBanListUI(gameState.players[0].banned, 'blue-ban-list');

    // 更新红队ban位
    updateBanListUI(gameState.players[1].banned, 'red-ban-list');

    // 更新蓝队已选英雄
    updatePickedListUI(gameState.players[0].picked, 'blue-picked-list');

    // 更新红队已选英雄
    updatePickedListUI(gameState.players[1].picked, 'red-picked-list');
}

// 更新ban列表UI
function updateBanListUI(bannedHeroes, elementId) {
    const banList = document.getElementById(elementId);
    banList.innerHTML = '';

    bannedHeroes.forEach(en => {
        const li = document.createElement('li');
        li.dataset.id = en.id;

        const img = document.createElement('img');
        img.src = `/static/img/${en.name}.png`;
        img.alt = en.name;
        img.style.borderRadius = '15%';
        img.style.width = '100%';
        img.style.maxWidth = '100px';
        li.appendChild(img);

        banList.appendChild(li);
    });
}

// 更新已选列表UI
function updatePickedListUI(pickedHeroes, elementId) {
    const pickedList = document.getElementById(elementId);
    pickedList.innerHTML = '';

    pickedHeroes.forEach(en => {
        const li = document.createElement('li');
        li.dataset.id = en.id;

        const img = document.createElement('img');
        img.src = `/static/img/${en.name}.png`;
        img.alt = en.name;
        img.style.borderRadius = '15%';
        img.style.maxWidth = '100%';

        li.appendChild(img);

        pickedList.appendChild(li);
    });
}

// 获取当前阶段文本
function getPhaseText() {
    if (!gameState) return "加载中...";
    if (gameState.stage0.available_player.id === 0) {
        return "bp结束";
    }
    // 解析开始时间
    const startTime = new Date(gameState.stage0.start).getTime();

    // 将持续时间从纳秒转换为毫秒 (1毫秒 = 1000000纳秒)
    const durationMs = gameState.stage0.duration / 1000000;

    // 计算结束时间和剩余时间
    const endTime = startTime + durationMs;
    const currentTime = new Date().getTime();
    const remainingTime = Math.max(0, endTime - currentTime);

    // 将剩余时间转换为分:秒格式
    const remainingMinutes = Math.floor(remainingTime / 60000);
    const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);
    const timeString = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;

    return `${gameState.stage0.name} (${timeString})`;
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.position = 'fixed';
    messageElement.style.top = '20px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.padding = '10px 20px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.zIndex = '1000';

    if (type === 'success') {
        messageElement.style.backgroundColor = '#4CAF50';
        messageElement.style.color = 'white';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#F44336';
        messageElement.style.color = 'white';
    } else {
        messageElement.style.backgroundColor = '#2196F3';
        messageElement.style.color = 'white';
    }

    document.body.appendChild(messageElement);

    // 3秒后自动移除消息
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}