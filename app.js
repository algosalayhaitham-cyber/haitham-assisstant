// app.js - هيثم AI (شامل الميزة رقم 4: تفضيل وأرشيف السجل وتصدير النسخ الاحتياطي + الواتساب + الطباعة + البحث)

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
  const exportBackupBtn = document.getElementById('exportBackupBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const searchInput = document.getElementById('searchInput');

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

  // أزرار تبويب الفلترة للأقسام والمفضلة
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeFilter = this.dataset.filter;
      filterAndSearchMessages();
    });
  });

  // تفعيل محرك البحث الداخلي (الميزة رقم 3)
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filterAndSearchMessages();
    });
  }

  function filterAndSearchMessages() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const allMsgs = messages.querySelectorAll('.msg');

    allMsgs.forEach(msg => {
      const cat = msg.dataset.category;
      const isFav = msg.dataset.fav === 'true';
      const text = msg.textContent.toLowerCase();

      let matchesCat = false;
      if (activeFilter === 'all') matchesCat = true;
      else if (activeFilter === 'fav') matchesCat = isFav;
      else matchesCat = (cat === activeFilter);

      const matchesSearch = (!query || text.includes(query));

      if (matchesCat && matchesSearch) {
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

  // --- 7. بدء محادثة جديدة وتصدير نسخة احتياطية (الميزة رقم 4) ---
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', function () {
      if (confirm('هل تريد بدء محادثة جديدة ومسح السجل غير المفضّل؟')) {
        chatHistory = chatHistory.filter(item => item.isFav);
        saveChatHistory();
        renderFromHistory();
      }
    });
  }

  if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', function () {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatHistory, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "haitham_ai_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  if (!form || !input || !messages) return;

  // --- 8. إرسال الرسالة ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const message = input.value.trim();
    if (!message && !selectedBase64Image) return;

    appendMessage('user', message, selectedBase64Image, currentCategory, false);
    saveChatHistory();

    const payload = {
      message: message,
      image: selectedBase64Image
    };

    const sentCat = currentCategory;
    currentCategory = 'عام';
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
      appendMessage('ai', replyText, null, sentCat, false);
      saveChatHistory();

    } catch (error) {
      document.getElementById('loadingMsg')?.remove();
      appendMessage('ai', `حدث خطأ: ${error.message}`, null, sentCat, false);
    }

    messages.scrollTop = messages.scrollHeight;
  });

  // --- 9. بناء وإضافة الرسائل للمستند ---
  function appendMessage(role, text, image = null, category = 'عام', isFav = false, index = null) {
    const itemIndex = index !== null ? index : chatHistory.length;
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    msgDiv.dataset.category = category;
    msgDiv.dataset.fav = isFav ? 'true' : 'false';

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

      // أزرار الإجراءات
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'msg-actions';

      // الميزة رقم 4: زر المفضلة/الحفظ
      const favBtn = document.createElement('button');
      favBtn.className = `action-btn fav-btn ${isFav ? 'is-fav' : ''}`;
      favBtn.innerHTML = isFav ? '⭐ مَفَضَّلَة' : '☆ تفضيل';
      favBtn.onclick = function () {
        const newFavStatus = !chatHistory[itemIndex].isFav;
        chatHistory[itemIndex].isFav = newFavStatus;
        saveChatHistory();
        favBtn.className = `action-btn fav-btn ${newFavStatus ? 'is-fav' : ''}`;
        favBtn.innerHTML = newFavStatus ? '⭐ مَفَضَّلَة' : '☆ تفضيل';
        msgDiv.dataset.fav = newFavStatus ? 'true' : 'false';
        filterAndSearchMessages();
      };

      // الميزة رقم 1: زر مشاركة الواتساب
      const waBtn = document.createElement('button');
      waBtn.className = 'action-btn whatsapp-btn';
      waBtn.innerHTML = '📲 واتساب';
      waBtn.onclick = function () { shareToWhatsApp(text); };

      // الميزة رقم 2: زر الطباعة المباشرة
      const printBtn = document.createElement('button');
      printBtn.className = 'action-btn print-btn';
      printBtn.innerHTML = '🖨️ طباعة';
      printBtn.onclick = function () { printMessage(contentContainer); };

      const copyBtn = document.createElement('button');
      copyBtn.className = 'action-btn';
      copyBtn.innerHTML = '📋 نسخ';
      copyBtn.onclick = function () { copyToClipboard(text, copyBtn); };

      const pdfBtn = document.createElement('button');
      pdfBtn.className = 'action-btn';
      pdfBtn.innerHTML = '📄 PDF';
      pdfBtn.onclick = function () { exportToPDF(contentContainer); };

      const wordBtn = document.createElement('button');
      wordBtn.className = 'action-btn';
      wordBtn.innerHTML = '📝 Word';
      wordBtn.onclick = function () { exportToWord(text); };

      actionsDiv.appendChild(favBtn);
      actionsDiv.appendChild(waBtn);
      actionsDiv.appendChild(printBtn);
      actionsDiv.appendChild(copyBtn);
      actionsDiv.appendChild(pdfBtn);
      actionsDiv.appendChild(wordBtn);
      msgDiv.appendChild(actionsDiv);
    }

    messages.appendChild(msgDiv);
    filterAndSearchMessages();
    messages.scrollTop = messages.scrollHeight;

    if (index === null) {
      chatHistory.push({ role, text, image, category, isFav });
    }
  }

  // --- 10. الأدوات المساعدة ---

  function shareToWhatsApp(text) {
    const cleanText = text.replace(/[*#`]/g, '');
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanText)}`;
    window.open(waUrl, '_blank');
  }

  function printMessage(contentElement) {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة مستند - هيثم AI</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; padding: 20px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 8px; text-align: right; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div>${contentElement.innerHTML}</div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        <\/script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  function copyToClipboard(text, btnElement) {
    const cleanText = text.replace(/[*#`]/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = '✅ تم!';
      setTimeout(() => { btnElement.innerHTML = originalHTML; }, 2000);
    });
  }

  function saveChatHistory() {
    localStorage.setItem('haitham_chat_history', JSON.stringify(chatHistory));
  }

  function loadChatHistory() {
    const saved = localStorage.getItem('haitham_chat_history');
    if (saved) {
      try {
        chatHistory = JSON.parse(saved);
        renderFromHistory();
      } catch (e) {
        renderWelcomeMessage();
      }
    } else {
      renderWelcomeMessage();
    }
  }

  function renderFromHistory() {
    messages.innerHTML = '';
    if (chatHistory.length === 0) {
      renderWelcomeMessage();
      return;
    }
    chatHistory.forEach((item, index) => {
      appendMessage(item.role, item.text, item.image, item.category || 'عام', item.isFav || false, index);
    });
  }

  function renderWelcomeMessage() {
    messages.innerHTML = `
      <div class="msg ai" data-category="عام">
        <b>هيثم AI</b>
        <p>مرحبًا 👋<br>أنا جاهز لمساعدتك. اكتب طلبك أو تحدث عبر المايك 🎤 أو أرفق صورة.</p>
      </div>
    `;
    chatHistory = [{ role: 'ai', text: 'مرحبًا 👋\nأنا جاهز لمساعدتك. اكتب طلبك أو تحدث عبر المايك 🎤 أو أرفق صورة.', category: 'عام', isFav: false }];
  }

  function exportToPDF(element) {
    if (typeof html2pdf === 'undefined') return;
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
// ===== دوال التصحيح والتقدير =====
function startCorrection() {
    const examFile = document.getElementById('examFile').files[0];
    if (!examFile) {
        alert('❌ الرجاء رفع صورة الورقة أولاً');
        return;
    }

    const resultDiv = document.getElementById('correctionResult');
    resultDiv.innerHTML = '⏳ جاري التصحيح والتحليل...';

    // محاكاة (استبدلها بـ API حقيقي)
    setTimeout(() => {
        resultDiv.innerHTML = `
            ✅ تم التصحيح بنجاح!<br>
            • السؤال 1: ✅ صحيح (5/5)<br>
            • السؤال 2: ❌ خطأ (2/5)<br>
            • السؤال 3: ⚠️ ناقص (3/5)<br>
            <br>
            <strong>📊 المجموع: 10 / 15</strong>
        `;
    }, 2000);
}

function estimateGrade() {
    const resultDiv = document.getElementById('correctionResult');
    const resultText = resultDiv.innerText;
    const match = resultText.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) {
        alert('❌ لازم تصحح الورقة أولاً');
        return;
    }
    const score = parseInt(match[1]);
    const total = parseInt(match[2]);
    const percentage = (score / total) * 100;

    let grade = '';
    if (percentage >= 90) grade = '⭐ ممتاز';
    else if (percentage >= 75) grade = '🌟 جيد جداً';
    else if (percentage >= 60) grade = '👍 جيد';
    else if (percentage >= 45) grade = '📖 مقبول';
    else grade = '📚 ضعيف';

    resultDiv.innerHTML += `
        <div style="background:#f0f8ff;padding:15px;border-radius:12px;margin-top:15px;">
            <strong>التقدير: ${grade}</strong> (${score}/${total})
        </div>
    `;
}
