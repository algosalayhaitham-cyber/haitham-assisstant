// app.js - تشغيل واجهة هيثم AI

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

if (form && input && messages) {

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = input.value.trim();

    if (!message) return;

    // عرض رسالة المستخدم
    const userMessage = document.createElement('div');
    userMessage.className = 'msg user';

    const userName = document.createElement('b');
    userName.textContent = 'أنت';

    const userText = document.createElement('p');
    userText.textContent = message;

    userMessage.appendChild(userName);
    userMessage.appendChild(userText);
    messages.appendChild(userMessage);

    // تفريغ مربع الكتابة
    input.value = '';

    // رسالة انتظار
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'msg ai';
    loadingMessage.id = 'loading';

    const loadingName = document.createElement('b');
    loadingName.textContent = 'هيثم AI';

    const loadingText = document.createElement('p');
    loadingText.textContent = 'جاري التفكير...';

    loadingMessage.appendChild(loadingName);
    loadingMessage.appendChild(loadingText);
    messages.appendChild(loadingMessage);

    messages.scrollTop = messages.scrollHeight;

    try {

      const res = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      });

      if (!res.ok) {
        throw new Error('الخادم لم يستجب بشكل صحيح');
      }

      const data = await res.json();

      // حذف رسالة الانتظار
      loadingMessage.remove();

      // عرض الرد
      const botMessage = document.createElement('div');
      botMessage.className = 'msg ai';

      const botName = document.createElement('b');
      botName.textContent = 'هيثم AI';

      const botText = document.createElement('p');
      botText.textContent = data.reply || 'لم يصل رد من الذكاء الاصطناعي.';

      botMessage.appendChild(botName);
      botMessage.appendChild(botText);

      messages.appendChild(botMessage);

    } catch (err) {

      loadingMessage.remove();

      const errorMessage = document.createElement('div');
      errorMessage.className = 'msg ai';

      const errorName = document.createElement('b');
      errorName.textContent = 'هيثم AI';

      const errorText = document.createElement('p');
      errorText.textContent =
        'حدث خطأ في الاتصال بالخادم: ' + err.message;

      errorMessage.appendChild(errorName);
      errorMessage.appendChild(errorText);

      messages.appendChild(errorMessage);
    }

    messages.scrollTop = messages.scrollHeight;
  });
}
