// app.js - هيثم AI (دعم الصور + المعادلات + PDF + حفظ سجل المحادثة)

document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('chatForm');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const imageInput = document.getElementById('imageInput');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');

  let selectedBase64Image = null;
  let chatHistory = [];

  // 1. تحميل سجل المحادثة المخزن عند بدء التشغيل
  loadChatHistory();

  // أزرار الأدوات السريعة
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', function () {
      input.value = this.dataset.prompt;
      input.focus();
    });
  });

  // معالجة اختيار صورة
  if (imageInput) {
    imageInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          selectedBase64Image = evt.target.result;
          if (imagePreview) imagePreview.src = selectedBase64Image;
          if (imagePreviewContainer) imagePreviewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // إلغاء تحديد الصورة
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', function () {
      selectedBase64Image = null;
      if (imageInput) imageInput.value = '';
      if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    });
  }

  // مسح السجل وبدء محادثة جديدة
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', function () {
      if (confirm('هل تريد بدء محادثة جديدة ومسح السجل الحالي؟')) {
        localStorage.removeItem('haitham_chat_history');
        chatHistory = [];
        messages.innerHTML = '';
        renderWelcomeMessage();
      }
    });
  }

  if (!form || !input || !messages) return;

  // إرسال الرسالة
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const message = input.value.trim();
    if (!message && !selectedBase64Image) return;

    // إضافة رسالة المستخدم للسجل والمستند
    appendMessage('user', message, selectedBase64Image);
    saveChatHistory();

    const payload = {
      message: message,
      image: selectedBase64Image
    };

    // تنظيف المدخلات
    input.value = '';
    selectedBase64Image = null;
    if (imageInput) imageInput.value = '';
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';

    // رسالة انتظار
    const loading = document.createElement('div');
    loading.className = 'msg ai';
    loading.id = 'loadingMsg';
    loading.innerHTML = `<b>هيثم AI</b><p>جاري التحليل والتفكير... ⏳</p>`;
    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('استجابة غير صحيحة من السيرفر'); }

      document.getElementById('loadingMsg')?.remove();

      if (!response.ok) throw new Error(data.reply || data.error || 'حدث خطأ في الخادم');

      const replyText = data.reply || 'لم يصل رد.';
      
      // إضافة رد المساعد للسجل
      appendMessage('ai', replyText);
      saveChatHistory();

    } catch (error) {
      document.getElementById('loadingMsg')?.remove();
      appendMessage('ai', `حدث خطأ: ${error.message}`);
    }

    messages.scrollTop = messages.scrollHeight;
  });

  // دالة عرض رسالة في الصفحة
  function appendMessage(role, text, image = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;

    if (role === 'user') {
      let html = '';
      if (image) html += `<img src="${image}" style="max-width:200px; border-radius:8px; display:block; margin-bottom:8px;">`;
      if (text) html += `<p>${escapeHtml(text)}</p>`;
      msgDiv.innerHTML = `<b>أنت</b>${html}`;
    } else {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'pdf-export-content';

      if (typeof marked !== 'undefined') {
        contentContainer.innerHTML = marked.parse(text);
      } else {
        contentContainer.innerHTML = `<p>${escapeHtml(text)}</p>`;
      }

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

      msgDiv.innerHTML = `<b>هيثم AI</b>`;
      msgDiv.appendChild(contentContainer);

      // زر تحميل PDF
      const pdfBtn = document.createElement('button');
      pdfBtn.className = 'pdf-download-btn';
      pdfBtn.innerHTML = '📄 تحميل PDF';
      pdfBtn.onclick = function () { exportToPDF(contentContainer); };
      msgDiv.appendChild(pdfBtn);
    }

    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;

    // إضافة للكائن الداخلي للحفظ
    chatHistory.push({ role, text, image });
  }

  // حفظ السجل في LocalStorage
  function saveChatHistory() {
    localStorage.setItem('haitham_chat_history', JSON.stringify(chatHistory));
  }

  // تحميل السجل من LocalStorage
  function loadChatHistory() {
    const saved = localStorage.getItem('haitham_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        messages.innerHTML = '';
        parsed.forEach(item => {
          appendMessage(item.role, item.text, item.image);
        });
        chatHistory = parsed; // إعادة ضبط السجل
      } catch (e) {
        renderWelcomeMessage();
      }
    } else {
      renderWelcomeMessage();
    }
  }

  function renderWelcomeMessage() {
    messages.innerHTML = `
      <div class="msg ai">
        <b>هيثم AI</b>
        <p>مرحبًا 👋<br>أنا جاهز لمساعدتك. اكتب طلبك مباشرة أو صور المسألة وأرفقها.</p>
      </div>
    `;
    chatHistory = [{ role: 'ai', text: 'مرحبًا 👋\nأنا جاهز لمساعدتك. اكتب طلبك مباشرة أو صور المسألة وأرفقها.' }];
  }

  // دالة تصدير PDF
  function exportToPDF(element) {
    if (typeof html2pdf === 'undefined') {
      alert('مكتبة التصدير غير متحملة بعد.');
      return;
    }
    const opt = {
      margin: 10,
      filename: 'هيثم_AI_مستند.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
