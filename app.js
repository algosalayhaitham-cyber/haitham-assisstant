// app.js - هيثم AI

document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('chatForm');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  // أزرار الأدوات
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', function () {
      input.value = this.dataset.prompt;
      input.focus();
    });
  });

  // التأكد من وجود عناصر المحادثة
  if (!form || !input || !messages) {
    console.error('عناصر المحادثة غير موجودة');
    return;
  }

  // إرسال الرسالة
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const message = input.value.trim();

    if (!message) return;

    // عرض رسالة المستخدم
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';

    userMsg.innerHTML = `
      <b>أنت</b>
      <p>${escapeHtml(message)}</p>
    `;

    messages.appendChild(userMsg);

    // تنظيف مربع الكتابة
    input.value = '';

    // رسالة انتظار
    const loading = document.createElement('div');
    loading.className = 'msg ai';
    loading.innerHTML = `
      <b>هيثم AI</b>
      <p>جاري التفكير... ⏳</p>
    `;

    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;

    try {

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || 'السيرفر لم يرجع استجابة صحيحة');
      }

      // حذف جاري التفكير
      loading.remove();

      if (!response.ok) {
        throw new Error(data.reply || data.error || 'حدث خطأ في الخادم');
      }

      // عرض رد هيثم AI
      const aiMsg = document.createElement('div');
      aiMsg.className = 'msg ai';

      const replyText = data.reply || 'لم يصل رد.';

      // إعداد حاوية النص
      const contentContainer = document.createElement('div');

      // 1. تحويل الماركداون إلى HTML إذا كانت المكتبة متاحة
      if (typeof marked !== 'undefined') {
        contentContainer.innerHTML = marked.parse(replyText);
      } else {
        contentContainer.innerHTML = `<p>${escapeHtml(replyText)}</p>`;
      }

      // 2. تشغيل تنسيق المعادلات الرياضية KaTeX إذا كانت المكتبة متاحة
      if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(contentContainer, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }

      aiMsg.innerHTML = `<b>هيثم AI</b>`;
      aiMsg.appendChild(contentContainer);

      messages.appendChild(aiMsg);

    } catch (error) {

      loading.remove();

      const errorMsg = document.createElement('div');
      errorMsg.className = 'msg ai';

      errorMsg.innerHTML = `
        <b>هيثم AI</b>
        <p>حدث خطأ: ${escapeHtml(error.message)}</p>
      `;

      messages.appendChild(errorMsg);
    }

    messages.scrollTop = messages.scrollHeight;
  });

  // حماية النص من HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

});

