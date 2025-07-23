// request.js
export const request = (url, method = 'GET', data = null, options = {}) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 规范化请求方法
      const normalizedMethod = method.toUpperCase();
      
      // 打开请求，异步为 true
      xhr.open(normalizedMethod, url, true);
  
      // 设置默认请求头
      if (normalizedMethod === 'POST' || normalizedMethod === 'PUT') {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }
  
      // 合并默认选项和传入选项
      const { headers = {}, withCredentials = false } = options;
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      xhr.withCredentials = withCredentials;
  
      // 请求超时（可选，单位毫秒）
      xhr.timeout = options.timeout || 10000;
  
      // 日志调试
      console.log(`🚀 ~ request ~ ${normalizedMethod} ${url}:`, data);
  
      // 发送数据
      if (data && (normalizedMethod === 'POST' || normalizedMethod === 'PUT')) {
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send();
      }
  
      // 状态变化处理
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              // 尝试解析 JSON
              const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              resolve(response);
            } else {
              reject(new Error(`请求失败: ${xhr.status} ${xhr.statusText}`));
            }
          } catch (error) {
            reject(new Error(`响应解析失败: ${error.message}`));
          }
        }
      };
  
      // 错误处理
      xhr.onerror = () => reject(new Error('网络错误，请检查网络连接'));
      xhr.ontimeout = () => reject(new Error('请求超时'));
    });
  };