const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const url = require('url');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// 存放所有连接的客户端
const clients = new Set();

// 消息存储文件路径
const MESSAGES_FILE = path.join(__dirname, 'database', 'chat.json');

// 确保数据库目录存在
if (!fs.existsSync(path.dirname(MESSAGES_FILE))) {
  fs.mkdirSync(path.dirname(MESSAGES_FILE), { recursive: true });
  console.log('创建数据库目录:', path.dirname(MESSAGES_FILE));
}

// 如果文件不存在，创建一个空的消息数组
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages: [] }, null, 2));
  console.log('创建新的消息存储文件');
}

// 读取消息历史
function readMessages() {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    const messages = JSON.parse(data).messages;
    console.log(`读取了 ${messages.length} 条历史消息`);
    return messages;
  } catch (error) {
    console.error('读取消息历史失败:', error);
    return [];
  }
}

// 保存新消息
function saveMessage(message) {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    const json = JSON.parse(data);
    json.messages.push(message);
    // 只保留最近的1000条消息
    if (json.messages.length > 1000) {
      json.messages = json.messages.slice(-1000);
    }
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(json, null, 2));
    console.log('成功保存新消息:', message);
    return true;
  } catch (error) {
    console.error('保存消息失败:', error);
    return false;
  }
}

wss.on('connection', (ws) => {
  console.log('客户端已连接');
  clients.add(ws);

  // 发送历史消息给新连接的客户端
  const messages = readMessages();
  ws.send(JSON.stringify({ type: 'history', messages }));

  ws.on('message', (message) => {
    const messageString = message.toString();
    console.log('收到消息:', messageString);

    // 解析JSON消息。如果有效，则广播给所有客户端并保存。
    try {
      const messageData = JSON.parse(messageString);
      // 只处理普通消息，忽略其他类型的消息
      if (!messageData.type) {
        if (saveMessage(messageData)) {
          // 只有保存成功才广播
          for (const client of clients) {
            if (client.readyState === ws.OPEN) {
              client.send(messageString);
            }
          }
        }
      }
    } catch (e) {
      console.error('收到的消息不是有效的JSON，不进行广播:', e);
    }
  });

  ws.on('close', () => {
    console.log('客户端已断开');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket 出错:', error);
  });
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = url.parse(request.url);

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// 托管静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 其他所有请求都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器正在监听端口 ${PORT}`);
  console.log('消息存储路径:', MESSAGES_FILE);
});