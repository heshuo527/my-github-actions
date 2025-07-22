const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const url = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// 存放所有连接的客户端
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('客户端已连接');
  clients.add(ws);

  ws.on('message', (message) => {
    const messageString = message.toString();
    console.log('收到消息: %s', messageString);

    // 解析JSON消息。如果有效，则广播给所有客户端。
    try {
      JSON.parse(messageString);
      for (const client of clients) {
        if (client.readyState === ws.OPEN) {
          client.send(messageString);
        }
      }
    } catch (e) {
      console.error('收到的消息不是有效的JSON，不进行广播。');
    }
  });

  ws.on('close', () => {
    console.log('客户端已断开');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket 出错: ', error);
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

// // 托管静态文件
// app.use(express.static(path.join(__dirname, 'dist')));

// // 其他所有请求都返回 index.html
// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器正在监听端口 ${PORT}`);
});