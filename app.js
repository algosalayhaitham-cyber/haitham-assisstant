// app.js - هيثم AI (شامل ومكتمل العناصر)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Registered!'))
      .catch(err => console.log('SW registration failed: ', err));
  });
}

document.addEventListener('DOMContentLoaded', function () {

  // --- 1. إدارة الثيم (الوضع الداكن / الفاتح) ---
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('haitham_theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggle) themeToggle.innerHTML = '☀️';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      themeToggle.innerHTML = isLight ? '☀️' : '🌙';
      localStorage.setItem('haitham_theme', isLight ? 'light' : 'dark');
    });
  }

  // --- 2. إعداد العناصر الأساسية ---
  const form = document.getElementById('chatForm');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const imageInput = document.getElementById('imageInput');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const voiceBtn = document.getElementById('voiceBtn');

  let selectedBase64Image = null;
  let chatHistory = [];
  let currentCategory = 'عام';
  let activeFilter = 'all';
  let isRecording = false;
  let recognition = null;

  // --- 3. تفعيل أزرار لوحة الرموز الرياضية ---
  document.querySelectorAll('.math-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const symbol = this.dataset.symbol;
      if (!input || !symbol) return;

      const startPos = input.selectionStart;
      const endPos = input.selectionEnd;
      const textBefore = input.value.substring(0, startPos);
      const textAfter = input.value.substring(endPos);

      input.value = textBefore + symbol + textAfter;
      input.focus();
      input.selectionStart = input.selectionEnd = startPos + symbol.length;
    });
  });

  // --- 4. إعداد الإملاء الصوتي ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;

    recognition.onstart = function () {
      isRecording = true;
      if (voiceBtn) {
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = '🛑';
      }
    };

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      input.value = (input.value ? input.value + ' ' : '') + transcript;
    };

    recognition.onerror = function (event) {
      console.error('خطأ في الصوت:', event.error);
      stopRecording();
    };

    recognition.onend = function () {
      stopRecording();
    };
  } else {
    if (voiceBtn) voiceBtn.style.display = 'none';
  }

  function stopRecording() {
    isRecording = false;
    if (voiceBtn) {
      voiceBtn.classList.remove('recording');
      voiceBtn.innerHTML = '🎤';
    }
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', function () {
      if (!recognition) return;
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  // تحميل المحادثات المحفوظة
  loadChatHistory();

  // --- 5. أزرار القوالب والأقسام ---
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', function () {
      input.value = this.dataset.prompt;
      currentCategory = this.dataset.category || 'عام';
      input.focus();
    });
  });

  // أزرار تبويب الفلترة للأقسام
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeFilter = this.dataset.filter;
      filterMessages(activeFilter);
    });
  });

  function filterMessages(filter) {
    const allMsgs = messages.querySelectorAll('.msg');
    allMsgs.forEach(msg => {
      const cat = msg.dataset.category;
      if (filter === 'all' || cat === filter || !cat) {
        msg.style.display = 'block';
      } else {
        msg.style.display = 'none';
      }
    });
  }

  // --- 6. معالجة اختيار وإلغاء الصور ---
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

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', function () {
      selectedBase64Image = null;
      if (imageInput) imageInput.value = '';
      if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    });
  }

  // --- 7. بدء محادثة جديدة ---
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

  // --- 8. إرسال الرسالة ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const message = input.value.trim();
    if (!message && !selectedBase64Image) return;

    appendMessage('user', message, selectedBase64Image, currentCategory);
    saveChatHistory();

    const payload = {
      message: message,
      image: selectedBase64Image
    };

    const sentCat = currentCategory;
    currentCategory = 'عام'; // إعادة الضبط بعد الإرسال
    input.value = '';
    selectedBase64Image = null;
    if (imageInput) imageInput.value = '';
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';

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
      appendMessage('ai', replyText, null, sentCat);
      saveChatHistory();

    } catch (error) {
      document.getElementById('loadingMsg')?.remove();
      appendMessage('ai', `حدث خطأ: ${error.message}`, null, sentCat);
    }

    messages.scrollTop = messages.scrollHeight;
  });

  // --- 9. بناء وإضافة الرسائل للمستند ---
  function appendMessage(role, text, image = null, category = 'عام') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    msgDiv.dataset.category = category;

    const catBadge = (category && category !== 'عام') ? `<span class="category-badge">${category}</span>` : '';

    if (role === 'user') {
      let html = '';
      if (image) html += `<img src="${image}" style="max-width:200px; border-radius:8px; display:block; margin-bottom:8px;">`;
      if (text) html += `<p>${escapeHtml(text)}</p>`;
      msgDiv.innerHTML = `<b>أنت ${catBadge}</b>${html}`;
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

      msgDiv.innerHTML = `<b>هيثم AI ${catBadge}</b>`;
      msgDiv.appendChild(contentContainer);

      // أزرار الإجراءات (نسخ + PDF + Word + قراءة صوتية)
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'msg-actions';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'action-btn';
      copyBtn.innerHTML = '📋 نسخ النص';
      copyBtn.onclick = function () { copyToClipboard(text, copyBtn); };

      const pdfBtn = document.createElement('button');
      pdfBtn.className = 'action-btn';
      pdfBtn.innerHTML = '📄 تحميل PDF';
      pdfBtn.onclick = function () { exportToPDF(contentContainer); };

      const wordBtn = document.createElement('button');
      wordBtn.className = 'action-btn';
      wordBtn.innerHTML = '📝 تحميل Word';
      wordBtn.onclick = function () { exportToWord(text); };

      const speakBtn = document.createElement('button');
      speakBtn.className = 'action-btn';
      speakBtn.innerHTML = '🔊 قراءة صوتية';
      speakBtn.onclick = function () { speakText(text); };

      actionsDiv.appendChild(copyBtn);
      actionsDiv.appendChild(pdfBtn);
      actionsDiv.appendChild(wordBtn);
      actionsDiv.appendChild(speakBtn);
      msgDiv.appendChild(actionsDiv);
    }

    messages.appendChild(msgDiv);
    filterMessages(activeFilter);
    messages.scrollTop = messages.scrollHeight;

    chatHistory.push({ role, text, image, category });
  }

  // --- 10. الأدوات المساعدة ---
  function copyToClipboard(text, btnElement) {
    const cleanText = text.replace(/[*#`]/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = '✅ تم النسخ!';
      btnElement.style.borderColor = '#10b981';
      btnElement.style.color = '#10b981';
      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.style.borderColor = '';
        btnElement.style.color = '';
      }, 2000);
    }).catch(() => {
      alert('تعذر النسخ تلقائياً، يرجى تحديد النص ونسخه يدويًا.');
    });
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#$`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('متصفحك لا يدعم خاصية القراءة الصوتية.');
    }
  }

  function saveChatHistory() {
    localStorage.setItem('haitham_chat_history', JSON.stringify(chatHistory));
  }

  function loadChatHistory() {
    const saved = localStorage.getItem('haitham_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        messages.innerHTML = '';
        parsed.forEach(item => appendMessage(item.role, item.text, item.image, item.category || 'عام'));
        chatHistory = parsed;
      } catch (e) {
        renderWelcomeMessage();
      }
    } else {
      renderWelcomeMessage();
    }
  }

  function renderWelcomeMessage() {
    messages.innerHTML = `
      <div class="msg ai" data-category="عام">
        <b>هيثم AI</b>
        <p>مرحبًا 👋<br>أنا جاهز لمساعدتك. اكتب طلبك أو تحدث عبر المايك 🎤 أو أرفق صورة.</p>
      </div>
    `;
    chatHistory = [{ role: 'ai', text: 'مرحبًا 👋\nأنا جاهز لمساعدتك. اكتب طلبك أو تحدث عبر المايك 🎤 أو أرفق صورة.', category: 'عام' }];
  }

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

  function exportToWord(text) {
    const cleanText = text.replace(/[*#`]/g, '');
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
      "xmlns:w='urn:schemas-microsoft-com:office:word' "+
      "xmlns='http://www.w3.org/TR/REC-html40'>"+
      "<head><meta charset='utf-8'><title>مستند هيثم AI</title>"+
      "<style>body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; }</style>"+
      "</head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + "<div>" + cleanText.replace(/\n/g, "<br>") + "</div>" + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'هيثم_AI_مستند.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
