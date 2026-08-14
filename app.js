// app.js - هيثم AI (نسخة تعمل مع Google Gemini API)

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    if (!form || !input || !messages) {
        console.warn('⚠️ عناصر المحادثة غير موجودة');
        return;
    }

    // ================================================================
    // 🔑 مفتاح Google Gemini API
    // ================================================================
    const GEMINI_API_KEY = 'AQ.Ab8RN6LxsGbUFDuPVBrCKr0VVt8gLsyz7OcMomMcLQMkQhHUWA';
    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;

    // ================================================================
    // 💬 دوال المحادثة
    // ================================================================
    function loadChatHistory() {
        const saved = localStorage.getItem('haitham_chat_history');
        if (saved) {
            try {
                const history = JSON.parse(saved);
                messages.innerHTML = history.map(msg => 
                    `<div class="msg ${msg.role}"><b>${msg.role === 'user' ? 'أنت' : 'هيثم AI'}</b><p>${msg.text}</p></div>`
                ).join('');
            } catch (e) {}
        }
    }
    loadChatHistory();

    function saveChatHistory() {
        const items = [];
        document.querySelectorAll('.msg').forEach(msg => {
            const role = msg.classList.contains('user') ? 'user' : 'ai';
            const text = msg.querySelector('p')?.textContent || '';
            items.push({ role, text });
        });
        localStorage.setItem('haitham_chat_history', JSON.stringify(items));
    }

    // ================================================================
    // 🤖 دالة الاتصال بـ Gemini API
    // ================================================================
    async function getAIResponse(message) {
        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `أنت هيثم AI، مساعد تعليمي ذكي ومتخصص في الرياضيات والمواد الدراسية. أجب عن السؤال التالي بأسلوب مفصل وسهل الفهم:\n\nالسؤال: ${message}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'فشل الاتصال بـ Gemini API');
            }

            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أستطع فهم السؤال.';

            return reply;

        } catch (error) {
            console.error('❌ خطأ في Gemini:', error);
            return `❌ حدث خطأ في الاتصال بالذكاء الاصطناعي: ${error.message}`;
        }
    }

    // ================================================================
    // 💬 إرسال الرسالة
    // ================================================================
    function sendMessage(message) {
        if (!message || !message.trim()) return;
        
        const userMsg = document.createElement('div');
        userMsg.className = 'msg user';
        userMsg.innerHTML = `<b>أنت</b><p>${message}</p>`;
        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;
        saveChatHistory();
        
        const typing = document.createElement('div');
        typing.className = 'msg ai';
        typing.id = 'typing';
        typing.innerHTML = `<b>هيثم AI</b><p>⏳ جاري التفكير...</p>`;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
        
        getAIResponse(message).then(reply => {
            const typingEl = document.getElementById('typing');
            if (typingEl) typingEl.remove();
            
            const aiMsg = document.createElement('div');
            aiMsg.className = 'msg ai';
            aiMsg.innerHTML = `<b>هيثم AI</b><p>${reply.replace(/\n/g, '<br>')}</p>`;
            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;
            saveChatHistory();
        }).catch(error => {
            const typingEl = document.getElementById('typing');
            if (typingEl) typingEl.remove();
            
            const aiMsg = document.createElement('div');
            aiMsg.className = 'msg ai';
            aiMsg.innerHTML = `<b>هيثم AI</b><p>❌ حدث خطأ: ${error.message}</p>`;
            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;
        });
    }

    // ================================================================
    // 🎯 معالجة الإدخال
    // ================================================================
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        input.value = '';
        sendMessage(message);
    });

    const sendBtn = document.querySelector('.btn-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const message = input.value.trim();
            if (!message) return;
            input.value = '';
            sendMessage(message);
        });
    }

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = this.value.trim();
            if (!message) return;
            this.value = '';
            sendMessage(message);
        }
    });

    console.log('✅ هيثم AI جاهز مع Google Gemini API!');
});
