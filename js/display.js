// 更新当前玩家UI
function updateCurrentPlayerUI(role) {
    const blueSection = document.querySelectorAll('.section-blue');
    const redSection = document.querySelectorAll('.section-red');

    if (role === "blue") {
        blueSection.forEach(section => section.classList.add('active-section'));
        redSection.forEach(section => section.classList.remove('active-section'));
    } else {
        blueSection.forEach(section => section.classList.remove('active-section'));
        redSection.forEach(section => section.classList.add('active-section'));
    }
}

// 更新列表UI
function updateEntriesUI(entries, state, role) {
    const heroList = document.getElementById('available-heroes');
    heroList.innerHTML = ''; // 清空现有列表

    entries.forEach(en => {
        const li = document.createElement('li');
        li.dataset.id = en.id;

        const img = document.createElement('img');
        img.src = `/bp/static/img/${en.name}.png`;
        img.alt = en.name;
        img.style.borderRadius = '15%';
        img.style.maxWidth = '100%';

        li.appendChild(img);

        if (en.banned || en.picked || state.stage0.role != role) {
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

// 更新ban列表UI
function updateBanListUI(bannedHeroes, elementId) {
    const banList = document.getElementById(elementId);
    banList.innerHTML = '';

    bannedHeroes.forEach(en => {
        const li = document.createElement('li');
        li.dataset.id = en.id;

        const img = document.createElement('img');
        img.src = `/bp/static/img/${en.name}.png`;
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
        img.src = `/bp/static/img/${en.name}.png`;
        img.alt = en.name;
        img.style.borderRadius = '15%';
        img.style.maxWidth = '100%';

        li.appendChild(img);

        pickedList.appendChild(li);
    });
}

// 显示当前阶段文本
function showPhaseText(data) {
    if (!data) return "加载中...";
    if (data.stage0.role == 'end') {
        return "bp结束";
    }
    // 解析开始时间
    const startTime = new Date(data.stage0.start).getTime();

    // 将持续时间从纳秒转换为毫秒 (1毫秒 = 1000000纳秒)
    const durationMs = data.stage0.duration / 1000000;

    // 计算结束时间和剩余时间
    const endTime = startTime + durationMs;
    const currentTime = new Date().getTime();
    const remainingTime = Math.max(0, endTime - currentTime);

    // 将剩余时间转换为分:秒格式
    const remainingMinutes = Math.floor(remainingTime / 60000);
    const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);
    const timeString = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;

    return `${data.stage0.name} (${timeString})`;
}

// 显示游戏结果
function showGameResult(player) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-modal';

    let resultHTML = `
        <div class="result-content">
            <h2 style="text-align:center; padding-bottom: 10px;">本次bp结果(只保留10分钟)</h2>
            <div class="result-players">
                <div class="result-player">
                    <h3 style="color: #1976D2;">蓝方 (${player.blue.name})</h3>
                    <div class="result-selections">
                        <div class="result-banned">
                            <h4>已禁用</h4>
                            <ul style="list-style-type:none;">
    `;
    player.blue.banned.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/bp/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px; opacity: 0.5;" />
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
    player.blue.picked.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/bp/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px;" />
                                </li>
        `;
    });
    resultHTML += `
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="result-player">
                    <h3 style="color: #D32F2F;">红方 (${player.red.name})</h3>
                    <div class="result-selections">
                        <div class="result-banned">
                            <h4>已禁用</h4>
                            <ul style="list-style-type:none;">
    `;
    player.red.banned.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/bp/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px; opacity: 0.5;" />
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
    player.red.picked.forEach(en => {
        resultHTML += `
                                <li>
                                    <img src="/bp/static/img/${en.name}.png" alt="${en.name}" style="border-radius: 15%; max-width: 100px;" />
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
