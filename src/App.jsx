import React, { useState } from 'react';
import './App.css';

// 表情数组，后续可扩展
const EMOJIS = ['😀', '😂', '🥳', '😎', '🤩', '😜', '🤔', '🥶', '😱', '👻', '🐶', '🐱', '🐼', '🦄', '🍕', '🍔', '🍟', '🍉', '🍓', '🍺'];

function App() {
  // 用于保存当前显示的表情
  const [emoji, setEmoji] = useState('😀');

  // 点击按钮时随机选择一个表情
  const handleClick = () => {
    const randomIndex = Math.floor(Math.random() * EMOJIS.length);
    setEmoji(EMOJIS[randomIndex]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>要开心哦！！！当前时间：{new Date().toLocaleString()}</div>
        <div style={{ fontSize: '5rem', margin: '20px' }}>{emoji}</div>
        <button onClick={handleClick} style={{ fontSize: '1.2rem', padding: '10px 20px', cursor: 'pointer' }}>
          随机表情
        </button>
      </header>
    </div>
  );
}

export default App;
