// app.js - هيثم AI (مع دعم الصور والمعادلات وتصدير PDF)

document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('chatForm');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const imageInput = document.getElementById('imageInput');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImageBtn');

  let selectedBase64Image = null;

  // أزرار الأدوات السريعة
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', function () {
      input.value = this.dataset.prompt;
      input.focus();
    });
  });

  // معالجة اختيار صورة من جهاز المستخدم
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

  // التأكد من وجود عناصر المحادثة الأساسية
  if (!form || !input || !messages) {
    console.error('عناصر المحادثة غير موجودة');
    return;
  }

  // إرسال الرسالة
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const message = input.value.trim();

    if (!message && !selectedBase64Image) return;

    // عرض رسالة المستخدم
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';

    let userContentHtml = '';
    if (selectedBase64Image) {
      userContentHtml += `<img src="${selectedBase64Image}" style="max-width:200px; border-radius:8px; display:block; margin-bottom:8px;">`;
    }
    if (message) {
      userContentHtml += `<p>${escapeHtml(message)}</p>`;
    }

    userMsg.innerHTML = `
      <b>أنت</b>
      ${userContentHtml}
    `;

    messages.appendChild(userMsg);

    // تجهيز البيانات لإرسالها
    const payload = {
      message: message,
      image: selectedBase64Image
    };

    // تنظيف المداخلات
    input.value = '';
    selectedBase64Image = null;
    if (imageInput) imageInput.value = '';
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';

    // رسالة انتظار
    const loading = document.createElement('div');
    loading.className = 'msg ai';
    loading.innerHTML = `
      <b>هيثم AI</b>
      <p>جاري التحليل والتفكير... ⏳</p>
    `;

    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;

    try {

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || 'السيرفر لم يرجع استجابة صحيحة');
      }

      loading.remove();

      if (!response.ok) {
        throw new Error(data.reply || data.error || 'حدث خطأ في الخادم');
      }

      // عرض رد هيثم AI
      const aiMsg = document.createElement('div');
      aiMsg.className = 'msg ai';

      const replyText = data.reply || 'لم يصل رد.';
      const contentContainer = document.createElement('div');
      contentContainer.className = 'pdf-export-content';

      // 1. تحويل الماركداون إلى HTML
      if (typeof marked !== 'undefined') {
        contentContainer.innerHTML = marked.parse(replyText);
      } else {
        contentContainer.innerHTML = `<p>${escapeHtml(replyText)}</p>`;
      }

      // 2. تشغيل تنسيق المعادلات الرياضية KaTeX
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

      // 3. إضافة زر تحميل الـ PDF
      const pdfBtn = document.createElement('button');
      pdfBtn.className = 'pdf-download-btn';
      pdfBtn.innerHTML = '📄 تحميل PDF';
      pdfBtn.onclick = function () {
        exportToPDF(contentContainer);
      };

      aiMsg.appendChild(pdfBtn);
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

  // دالة تصدير العنصر إلى PDF
  function exportToPDF(element) {
    if (typeof html2pdf === 'undefined') {
      alert('مكتبة التصدير غير متحملة بعد، يرجى المحاولة بعد لحظات.');
      return;
    }

    const opt = {
      margin:       10,
      filename:     'هيثم_AI_مستند.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  }

  // حماية النص من HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

});
