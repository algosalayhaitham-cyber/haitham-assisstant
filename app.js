// app.js - هيثم AI (نسخة كاملة مع التوجيه التلقائي للشاشة الرئيسية)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Registered!'))
      .catch(err => console.log('SW registration failed: ', err));
  });
}

document.addEventListener('DOMContentLoaded', function () {

  // --- 🌟 إصلاح جذر المشكلة: إخفاء المقالي بالقوة وفتح واجهة هيثم أولاً ---
  forceOpenHomeByDefault();

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
        voiceBtn.setAttribute('aria-label', 'إيقاف التسجيل الصوتي');
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
      voiceBtn.setAttribute('aria-label', 'بدء التسجيل الصوتي');
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

  // تفعيل محرك البحث الداخلي
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

  // --- 7. بدء محادثة جديدة وتصدير نسخة احتياطية ---
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

  // --- 8. إرسال الرسالة (المعدل لاستخدام المعرفة) ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const message = input.value.trim();
    if (!message && !selectedBase64Image) return;

    const knowledgeAnswer = answerFromKnowledge(message);
    
    if (knowledgeAnswer) {
      appendMessage('user', message, selectedBase64Image, currentCategory, false);
      saveChatHistory();
      
      const loading = document.createElement('div');
      loading.className = 'msg ai';
      loading.id = 'loadingMsg';
      loading.innerHTML = `<b>هيثم AI</b><p>⏳ جاري البحث في الملخصات...</p>`;
      messages.appendChild(loading);
      messages.scrollTop = messages.scrollHeight;
      
      setTimeout(() => {
        document.getElementById('loadingMsg')?.remove();
        appendMessage('ai', knowledgeAnswer, null, '📚 معرفة', false);
        saveChatHistory();
        messages.scrollTop = messages.scrollHeight;
      }, 500);
      
      input.value = '';
      selectedBase64Image = null;
      if (imageInput) imageInput.value = '';
      if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
      return;
    }

    appendMessage('user', message, selectedBase64Image, currentCategory, false);
    saveChatHistory();

    const payload = {
      message: message,
      image: selectedBase64Image,
      knowledge: searchKnowledge(message) || ''
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

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("استجابة غير صالحة من الخادم (تأكد من عمل السيرفر)");
      }

      const data = await response.json();
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
      if (image) html += `<img src="${image}" style="max-width:200px; border-radius:8px; display:block; margin-bottom:8px;" alt="صورة مرفقة">`;
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

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'msg-actions';

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

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.innerHTML = '🗑️ حذف';
      deleteBtn.onclick = function () {
        if (confirm('هل تريد حذف هذه الرسالة؟')) {
          chatHistory.splice(itemIndex, 1);
          saveChatHistory();
          renderFromHistory();
        }
      };

      const waBtn = document.createElement('button');
      waBtn.className = 'action-btn whatsapp-btn';
      waBtn.innerHTML = '📲 واتساب';
      waBtn.onclick = function () { shareToWhatsApp(text); };

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
      actionsDiv.appendChild(deleteBtn);
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
    const historyToSave = chatHistory.map(item => ({
      role: item.role,
      text: item.text,
      image: null, 
      category: item.category,
      isFav: item.isFav
    }));
    localStorage.setItem('haitham_chat_history', JSON.stringify(historyToSave));
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
        <p style="color: #718096; font-size: 13px;">📚 لدي معرفة بـ: الرياضيات، الفيزياء، الكيمياء، اللغة العربية، الإنجليزية، التاريخ</p>
      </div>
    `;
    chatHistory = [{ role: 'ai', text: 'مرحبًا 👋\nأنا جاهز لمساعدتك. اكتب طلبك أو تحدث عبر المايك 🎤 أو أرفق صورة.\n📚 لدي معرفة بـ: الرياضيات، الفيزياء، الكيمياء، اللغة العربية، الإنجليزية، التاريخ', category: 'عام', isFav: false }];
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

  // ================================================================
  // ===== دالة قوية جداً لفرض فتح واجهة هيثم وإغلاق المقالي بالقوة =====
  // ================================================================
  function forceOpenHomeByDefault() {
    // إخفاء كل ما يتعلق بالمقالي أو التصحيح بغض النظر عن أسماء الـ IDs
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const id = el.id ? el.id.toLowerCase() : '';
      const cls = el.className && typeof el.className === 'string' ? el.className.toLowerCase() : '';
      
      // إذا كان العنصر يخص قسم المقالي أو التصحيح، قم بإخفائه تلقائياً عند التشغيل
      if (id.includes('essay') || cls.includes('essay') || id.includes('correct') || cls.includes('correct')) {
        if (el.tagName === 'DIV' || el.tagName === 'SECTION') {
          el.style.display = 'none';
        }
      }
    });

    // إظهار الشاشة الرئيسية بفرض العرض
    const chatContainers = document.querySelectorAll('.chat-container, #chatForm, #messages, main, .main-content');
    chatContainers.forEach(sec => {
      sec.style.display = 'block';
    });

    // تصحيح الأزرار في الشريط السفلي (جعل زر هيثم هو النشط فقط)
    const navButtons = document.querySelectorAll('nav button, .nav-btn, footer button, .tab-btn');
    navButtons.forEach(btn => {
      const text = btn.textContent || '';
      if (text.includes('هيثم') || btn.querySelector('.fa-brain, img')) {
        btn.classList.add('active');
      } else if (text.includes('مقالي') || text.includes('تصحيح')) {
        btn.classList.remove('active');
      }
    });
  }

  // ================================================================
  // ===== 11. قاعدة المعرفة المدمجة (الطريقة السريعة) =====
  // ================================================================

  const KNOWLEDGE_BASE = {
    'رياضيات': {
      keywords: ['رياضيات', 'معادلة', 'جبر', 'هندسة', 'تفاضل', 'تكامل', 'حساب', 'مشتقة', 'مثلثات'],
      content: `
📚 **ملخص الرياضيات:**

**المعادلات الخطية:**
- الصيغة العامة: ax + b = 0
- الحل: x = -b/a
- مثال: 2x + 5 = 13 → 2x = 8 → x = 4

**الهندسة:**
- مساحة المربع = الضلع²
- مساحة المستطيل = الطول × العرض
- مساحة المثلث = (القاعدة × الارتفاع) / 2
- محيط الدائرة = 2πr
- مساحة الدائرة = πr²
- حجم المكعب = الضلع³
- حجم الكرة = (4/3)πr³

**التفاضل:**
- مشتقة x^n = n·x^(n-1)
- مشتقة الثابت = 0
- مشتقة sin(x) = cos(x)
- مشتقة cos(x) = -sin(x)

**التكامل:**
- ∫x^n dx = x^(n+1)/(n+1) + C
- ∫sin(x) dx = -cos(x) + C
- ∫cos(x) dx = sin(x) + C
      `
    },
    'فيزياء': {
      keywords: ['فيزياء', 'حركة', 'قوة', 'طاقة', 'نيوتن', 'سرعة', 'تسارع', 'ضغط', 'كثافة'],
      content: `
📚 **ملخص الفيزياء:**

**قوانين الحركة:**
- السرعة = المسافة / الزمن
- التسارع = التغير في السرعة / الزمن
- قانون نيوتن الثاني: F = m × a

**الطاقة:**
- الطاقة الحركية: KE = ½ × m × v²
- طاقة الوضع: PE = m × g × h

**قوانين أخرى:**
- الضغط = القوة / المساحة
- الكثافة = الكتلة / الحجم
- الشغل = القوة × المسافة

**الكهرباء:**
- قانون أوم: V = I × R
- القدرة: P = V × I
      `
    },
    'كيمياء': {
      keywords: ['كيمياء', 'عنصر', 'مركب', 'تفاعل', 'ذرة', 'جزيء', 'حمض', 'قاعدة', 'ملح'],
      content: `
📚 **ملخص الكيمياء:**

**العناصر والمركبات:**
- الماء: H₂O
- ثاني أكسيد الكربون: CO₂
- ملح الطعام: NaCl
- حمض الهيدروكلوريك: HCl
- حمض الكبريتيك: H₂SO₄

**التفاعلات الكيميائية:**
- تفاعل الاتحاد: A + B → AB
- تفاعل الانحلال: AB → A + B

**الأحماض والقواعد:**
- الأس الهيدروجيني (pH): 0-7 حمضي، 7 متعادل، 7-14 قاعدي
- حمض + قاعدة → ملح + ماء
      `
    },
    'لغة عربية': {
      keywords: ['عربية', 'نحو', 'صرف', 'بلاغة', 'قواعد', 'إملاء', 'أدب', 'شعر'],
      content: `
📚 **ملخص اللغة العربية:**

**النحو:**
- أقسام الكلمة: اسم، فعل، حرف
- الجملة الاسمية: مبتدأ + خبر
- الجملة الفعلية: فعل + فاعل + مفعول به

**الصرف:**
- الماضي: كتبَ
- المضارع: يَكتبُ
- الأمر: اُكتُبْ

**البلاغة:**
- التشبيه، الاستعارة، الكناية
      `
    },
    'لغة إنجليزية': {
      keywords: ['انجليزي', 'english', 'grammar', 'vocabulary', 'tenses', 'verbs', 'phrases'],
      content: `
📚 **English Summary:**

**Tenses:**
- Present Simple: I eat / He eats
- Present Continuous: I am eating
- Past Simple: I ate
- Future Simple: I will eat

**Common Phrases:**
- Hello = مرحباً
- Thank you = شكراً
- How are you? = كيف حالك؟
      `
    },
    'تاريخ': {
      keywords: ['تاريخ', 'حضارة', 'إسلام', 'عصر', 'خلافة', 'دولة', 'فرعون', 'رومان'],
      content: `
📚 **ملخص التاريخ:**

**الحضارات القديمة:**
- الحضارة المصرية القديمة: الفراعنة، الأهرامات
- الحضارة اليونانية والإمبراطورية الرومانية

**العصر الإسلامي:**
- الخلافة الراشدة، الدولة الأموية، الدولة العباسية (بيت الحكمة)
      `
    },
    'برمجة': {
      keywords: ['برمجة', 'كمبيوتر', 'حاسوب', 'خوارزمية', 'بيانات', 'كود', 'برنامج', 'تطبيق'],
      content: `
📚 **ملخص البرمجة:**
- المعالج (CPU)، الذاكرة (RAM)، القرص الصلب (Storage)
- الخوارزميات ولغات البرمجة (Python, JavaScript, Java)
      `
    }
  };

  function cleanAndNormalize(text) {
    return text.toLowerCase().replace(/ال/g, '').trim();
  }

  function searchKnowledge(query) {
    if (!query) return null;
    
    const lowerQuery = cleanAndNormalize(query);
    let bestMatch = null;
    let highestScore = 0;

    for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
      let score = 0;
      for (const keyword of data.keywords) {
        const cleanKeyword = cleanAndNormalize(keyword);
        if (lowerQuery.includes(cleanKeyword)) {
          score += 2;
        }
      }
      if (cleanAndNormalize(data.content).includes(lowerQuery)) {
        score += 1;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = data.content;
      }
    }

    if (highestScore < 2) return null;
    return bestMatch;
  }

  function answerFromKnowledge(query) {
    const knowledge = searchKnowledge(query);
    if (knowledge) {
      return `${knowledge}\n\n💡 هذه المعلومات مأخوذة من ملخصات هيثم AI.`;
    }
    return null;
  }

  window.addKnowledge = function(topic, keywords, content) {
    KNOWLEDGE_BASE[topic] = { keywords, content };
    localStorage.setItem('haitham_knowledge', JSON.stringify(KNOWLEDGE_BASE));
    return `✅ تم إضافة "${topic}" بنجاح!`;
  }

  function loadSavedKnowledge() {
    const saved = localStorage.getItem('haitham_knowledge');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(KNOWLEDGE_BASE, parsed);
      } catch(e) {
        console.log('⚠️ خطأ في تحميل المعرفة المحفوظة');
      }
    }
  }

  loadSavedKnowledge();

  // ===== دوال تصحيح الأوراق =====
  window.startCorrection = function() {
    const examFile = document.getElementById('examFile').files[0];
    if (!examFile) {
      alert('❌ الرجاء رفع صورة الورقة أولاً');
      return;
    }

    const resultDiv = document.getElementById('correctionResult');
    resultDiv.innerHTML = '⏳ جاري التصحيح والتحليل...';

    const reader = new FileReader();
    reader.onload = async function(e) {
      const imageBase64 = e.target.result;

      try {
        const response = await fetch('/api/correct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageBase64,
            model: 'llama-3.2-90b-vision-preview'
          })
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("استجابة غير صالحة من الخادم أثناء التصحيح");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'حدث خطأ في التصحيح');
        }

        resultDiv.innerHTML = data.html_result || `
          ✅ تم التصحيح بنجاح!<br>
          📊 النتيجة: ${data.score || 'غير متاحة'}
        `;

        window._lastCorrectionResult = data;

      } catch (error) {
        console.error('❌ خطأ في التصحيح:', error);
        resultDiv.innerHTML = `❌ حدث خطأ: ${error.message}`;
      }
    };

    reader.readAsDataURL(examFile);
  };

  window.estimateGrade = function() {
    const resultDiv = document.getElementById('correctionResult');
    if (!resultDiv) return;
    const resultText = resultDiv.innerText;
    
    const scoreMatch = resultText.match(/(\d+)\s*\/\s*(\d+)/);
    if (!scoreMatch) {
      alert('❌ لم أجد نتيجة التصحيح. قم بالتصحيح أولاً');
      return;
    }

    const score = parseInt(scoreMatch[1]);
    const total = parseInt(scoreMatch[2]);
    const percentage = (score / total) * 100;

    let grade = '';
    let emoji = '';
    let recommendation = '';

    if (percentage >= 90) {
      grade = 'ممتاز';
      emoji = '⭐';
      recommendation = 'أداء رائع، استمر بهذا المستوى!';
    } else if (percentage >= 75) {
      grade = 'جيد جداً';
      emoji = '🌟';
      recommendation = 'أداء مميز، ركز على النقاط التي أخطأت فيها';
    } else if (percentage >= 60) {
      grade = 'جيد';
      emoji = '👍';
      recommendation = 'أداء جيد، أنصحك بمراجعة الأخطاء';
    } else if (percentage >= 45) {
      grade = 'مقبول';
      emoji = '📖';
      recommendation = 'تحتاج إلى مراجعة الدروس مع المعلم';
    } else {
      grade = 'ضعيف';
      emoji = '📚';
      recommendation = 'بحاجة إلى خطة علاجية فورية';
    }

    resultDiv.innerHTML += `
      <div style="background: #f0f8ff; padding: 15px; border-radius: 12px; margin-top: 15px; border-right: 4px solid #4A90D9;">
        <strong style="font-size: 18px;">${emoji} التقدير: ${grade}</strong><br>
        <span style="color: #555;">${score} من ${total} (${Math.round(percentage)}%)</span><br>
        <span style="color: #7f8c8d; font-size: 13px;">💡 ${recommendation}</span>
      </div>
    `;

    if (percentage >= 90) {
      createMiniConfetti();
    }
  };

  function createMiniConfetti() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6'];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: -10px;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        pointer-events: none;
        z-index: 9999;
        animation: confettiFall ${Math.random() * 2 + 1}s linear forwards;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  }

  if (!document.getElementById('confettiStyle')) {
    const style = document.createElement('style');
    style.id = 'confettiStyle';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

});
