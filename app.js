// app.js - يربط الواجهة بـ API حق Vercel
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const chatBox = document.getElementById('chat-box');

if(form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if(!message) return;

    // نعرض رسالة المستخدم
    chatBox.innerHTML += `<div class="user-msg">${message}</div>`;
    input.value = '';

    // نرسل للـ API
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      chatBox.innerHTML += `<div class="bot-msg">${data.reply}</div>`;
    } catch(err){
      chatBox.innerHTML += `<div class="error">صار خطأ: ${err.message}</div>`;
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
