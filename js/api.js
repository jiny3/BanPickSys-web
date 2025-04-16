// 初始化页面
function init() {
    if (!window.wsConnection) {
        // 初始化事件监听
        document.getElementById('ok').addEventListener('click', switchPlayer);
        ws(currentGameId);
    }
    if (!bpInterval) {
        // 每隔0.5秒获取一次游戏状态
        bpInterval = setInterval(updatePhaseUI, 500);
    }
}
// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);

// 页面刷新时关闭WebSocket连接(for chrome)
window.addEventListener('beforeunload', function () {
    if (window.wsConnection) {
        window.wsConnection.close();
    }
});

// 切换玩家函数
function switchPlayer() {
    const playerSelect = document.getElementById('player-select');
    // 更新UI以突出显示当前玩家
    updateCurrentPlayerUI(playerSelect.value);
    // 触发加入游戏事件
    leaveGame().then(() => {
        joinGame(playerSelect.value);
    });

    // 刷新游戏状态
    if (currentGameId) {
        getGameState();
    }
}

// 获取游戏状态
async function getGameState() {
    if (!currentGameId) return;
    try {
        const response = await fetch(`/bp/${currentGameId}/status`);
        const data = await response.json();

        if (data.res) {
            bpState = data.res;
            console.log('bp state:', bpState);

            // 更新UI
            updateGameUI();

            // 检查游戏是否结束
            if (bpState.stage0 && bpState.stage0.role == "end") {
                clearInterval(bpInterval);
                getGameResult();
            }
        } else {
            console.error('Failed to get bp state', data);
        }
    } catch (error) {
        console.error('Error getting bp state:', error);
    }
    getEntries();
}

// 获取可用英雄
async function getEntries() {
    if (!currentGameId) return;

    try {
        const response = await fetch(`/bp/${currentGameId}/entries`);
        const data = await response.json();

        if (data.res) {
            console.log('Available Entries:', data.res);
            const playerSelect = document.getElementById('player-select');
            // 更新可用英雄列表
            updateEntriesUI(data.res, bpState, playerSelect.value);
        } else {
            console.error('Failed to get available heroes', data);
        }
    } catch (error) {
        console.error('Error getting available heroes:', error);
    }
}

// 选择英雄（Ban或Pick）
async function selectHero(entryId) {
    if (!currentGameId || !bpState) return;

    try {
        const response = await fetch(`/bp/${currentGameId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entry_id: entryId.toString(),
                player_id: currentPlayerID
            })
        });

        const data = await response.json();

        if (data.msg == 'ok') {
            console.log('Hero selected successfully');
            showMessage('选择成功！', 'success');
        } else {
            console.error('Failed to select hero', data);
            showMessage(data.error || '选择失败，请重试', 'error');
        }
    } catch (error) {
        console.error('Error selecting hero:', error);
        showMessage('选择英雄时发生错误', 'error');
    }
}

// 加入游戏
async function joinGame(role) {
    if (!currentGameId) return;

    try {
        console.log('Joining game with ID:', currentPlayerID, 'and role:', role);
        const response = await fetch(`/bp/${currentGameId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: currentPlayerID,
                role: role
            })
        });

        const data = await response.json();

        if (data.msg == 'ok') {
            console.log('Joined game successfully');
            showMessage('成功加入游戏！', 'success');
        } else {
            console.error('Failed to join game', data);
            showMessage(data.error || '加入游戏失败，请重试', 'error');
        }
    } catch (error) {
        console.error('Error joining game:', error);
        showMessage('加入游戏时发生错误', 'error');
    }
}

// 离开游戏
async function leaveGame() {
    if (!currentGameId) return;

    try {
        const response = await fetch(`/bp/${currentGameId}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: currentPlayerID
            })
        });

        const data = await response.json();

        if (data.msg == 'ok') {
            console.log('Left game successfully');
            showMessage('成功离开游戏！', 'success');
        }
    } catch (error) {
        console.error('Error leaving game:', error);
        showMessage('离开游戏时发生错误', 'error');
    }
}

// 获取游戏结果
async function getGameResult() {
    if (!currentGameId) return;

    try {
        const response = await fetch(`/bp/${currentGameId}/result`);
        const data = await response.json();

        if (data.res) {
            console.log('Game result:', data.res);
            showGameResult(data.res);
        } else {
            console.error('Failed to get bp result', data);
        }
    } catch (error) {
        console.error('Error getting bp result:', error);
    }
}

// 更新当前阶段
function updatePhaseUI() {
    // 更新当前阶段
    document.getElementById('current-phase').textContent = showPhaseText(bpState);
}

// 更新游戏UI
function updateGameUI() {
    if (!bpState) return;

    if (bpState.results.blue) {
        // 更新蓝队ban位
        updateBanListUI(bpState.results.blue.banned, 'blue-ban-list');
        // 更新蓝队已选英雄
        updatePickedListUI(bpState.results.blue.picked, 'blue-picked-list');
    }
    if (bpState.results.red) {
        // 更新红队ban位
        updateBanListUI(bpState.results.red.banned, 'red-ban-list');
        // 更新红队已选英雄
        updatePickedListUI(bpState.results.red.picked, 'red-picked-list');
    }
}