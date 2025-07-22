import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [nickname, setNickname] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    // 根据环境选择 WebSocket 地址
    const wsUrl = import.meta.env.DEV ? `ws://${window.location.host}/ws` : `wss://${window.location.host}/ws`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket 连接已打开');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket 连接已关闭');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket 出错: ', error);
    };

    // 组件卸载时关闭连接
    return () => {
      ws.current.close();
    };
  }, []);

  // 发送消息
  const sendMessage = () => {
    if (input.trim() && nickname.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        nickname,
        content: input,
      };
      ws.current.send(JSON.stringify(message));
      setInput('');
    }
  };

  return (
    <div className="App">
      {/* 标题 */}
      <h1>研发 聊天室</h1>
      {/* 昵称输入区 */}
      <div className="nickname-area">
        <input
          type="text"
          placeholder="输入你的昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={16}
        />
      </div>
      {/* 消息显示区 */}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.nickname}:</strong> {msg.content}
          </div>
        ))}
      </div>
      {/* 输入区 */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          placeholder="输入聊天内容，回车或点击发送"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          maxLength={200}
        />
        <button onClick={sendMessage}>发送</button>
      </div>
    </div>
  );
}

export default App;
