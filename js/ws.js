function ws(gid) {
    // ws连接
    if (window.wsReconnectTimer) {
        clearTimeout(window.wsReconnectTimer);
    }
    const ws = new WebSocket(`ws://${window.location.host}/bp/${gid}/ws`);
    ws.onopen = function () {
        console.log('WebSocket连接已打开');
        window.wsReconnectAttempts = 0;
    };
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.event == 'heartbeat') {
            ws.send(JSON.stringify({
                event: 'heartbeat',
            }));
            return;
        }
        console.log('WebSocket消息:', data);
        if (data.event == 'init') {
            currentPlayerID = data.data.player_id;
            console.log('player id:', currentPlayerID);
        }
        getGameState();
    };
    ws.onclose = function () {
        console.log('WebSocket连接已关闭');
    };
    ws.onerror = function (error) {
        console.error('WebSocket错误:', error);
        attemptReconnect(gid);
    };
    window.wsConnection = ws;
}
function attemptReconnect(gid) {
    // Initialize reconnect attempts counter if it doesn't exist
    if (typeof window.wsReconnectAttempts === 'undefined') {
        window.wsReconnectAttempts = 0;
    }
    
    // Maximum reconnection attempts
    const MAX_RECONNECT_ATTEMPTS = 5;
    
    // Increase reconnection attempts
    window.wsReconnectAttempts++;
    
    if (window.wsReconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const reconnectDelay = Math.min(1000 * Math.pow(2, window.wsReconnectAttempts - 1), 30000);
        
        console.log(`Attempting to reconnect WebSocket in ${reconnectDelay/1000} seconds... (Attempt ${window.wsReconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        window.wsReconnectTimer = setTimeout(() => {
            ws(gid);
        }, reconnectDelay);
        
    } else {
        console.error('Maximum WebSocket reconnection attempts reached');
        showMessage('无法连接到服务器，请刷新页面重试', 'error');
    }
}