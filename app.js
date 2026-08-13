// app.js - هيثم AI (نسخة تعمل بدون خادم - للجوال)

document.addEventListener('DOMContentLoaded', function () {
    // --- 1. عناصر الصفحة ---
    const form = document.getElementById('chatForm');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    if (!form || !input || !messages) {
        console.warn('⚠️ عناصر المحادثة غير موجودة في الصفحة');
        return;
    }

    // --- 2. تحميل المحادثات المحفوظة ---
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

    // --- 3. حفظ المحادثات ---
    function saveChatHistory() {
        const items = [];
        document.querySelectorAll('.msg').forEach(msg => {
            const role = msg.classList.contains('user') ? 'user' : 'ai';
            const text = msg.querySelector('p')?.textContent || '';
            items.push({ role, text });
        });
        localStorage.setItem('haitham_chat_history', JSON.stringify(items));
    }

    // --- 4. ردود هيثم الذكية (محاكاة) ---
    function getHaithamReply(message) {
        const lower = message.toLowerCase();
        
        // كلمات مفتاحية
        if (lower.includes('السلام') || lower.includes('مرحب')) {
            return '👋 وعليكم السلام! كيف يمكنني مساعدتك اليوم؟';
        }
        if (lower.includes('رياضيات') || lower.includes('معادلة') || lower.includes('حساب')) {
            return '📐 الرياضيات ممتعة! اكتب لي المسألة وسأحلها لك خطوة بخطوة.';
        }
        if (lower.includes('فيزياء') || lower.includes('قوة') || lower.includes('طاقة')) {
            return '⚡ الفيزياء عالم رائع! اسألني عن أي قانون أو ظاهرة.';
        }
        if (lower.includes('كيمياء') || lower.includes('عنصر') || lower.includes('تفاعل')) {
            return '🧪 الكيمياء مليئة بالاكتشافات! أخبرني ما الذي تريد معرفته.';
        }
        if (lower.includes('عربي') || lower.includes('نحو') || lower.includes('قواعد')) {
            return '📖 اللغة العربية بحر واسع! اسأل عن النحو، الصرف، أو البلاغة.';
        }
        if (lower.includes('شكر')) {
            return '🌟 العفو! أنا هنا لمساعدتك دائماً.';
        }
        if (lower.includes('كيف حال')) {
            return '😊 أنا بخير، شكراً لسؤالك! كيف يمكنني مساعدتك اليوم؟';
        }
        if (lower.includes('اختبار') || lower.includes('سؤال')) {
            return '📝 أنا جاهز لمساعدتك في الاختبارات! اكتب السؤال وسأجيبك.';
        }
        if (lower.includes('hello') || lower.includes('hi')) {
            return '👋 Hello! How can I help you today?';
        }
        if (lower.includes('اسم')) {
            return '🧠 أنا هيثم AI، مساعدك التعليمي الذكي!';
        }
        
        // ردود عامة
        const generalReplies = [
            '📚 شكراً لسؤالك! دعني أفكر في الإجابة...\n\n💡 أنصحك بمراجعة الدرس جيداً، وستجد الإجابة بإذن الله.',
            '🧠 فكرة رائعة! هذا السؤال يدل على ذكاءك.\n\n📝 استمر في التعلم والتطوير، أنت في الطريق الصحيح.',
            '🌟 سؤال جميل! الإجابة تحتاج إلى تركيز.\n\n💪 تذكر أن الممارسة المستمرة هي مفتاح النجاح.',
            '📖 هذا السؤال مهم جداً!\n\n🔍 ابحث في المصادر الموثوقة وستجد المعلومات الدقيقة.',
            '💡 نصيحتي لك: قسم السؤال إلى أجزاء صغيرة، وحل كل جزء على حدة.',
            '🚀 أنت تسأل بذكاء! استمر في طرح الأسئلة، هذا هو طريق التعلم الصحيح.'
        ];
        return generalReplies[Math.floor(Math.random() * generalReplies.length)];
    }

    // --- 5. إرسال الرسالة ---
    function sendMessage(message) {
        if (!message || !message.trim()) return;
        
        // عرض رسالة المستخدم
        const userMsg = document.createElement('div');
        userMsg.className = 'msg user';
        userMsg.innerHTML = `<b>أنت</b><p>${message}</p>`;
        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;
        
        // حفظ المحادثة
        saveChatHistory();
        
        // عرض مؤشر الكتابة
        const typing = document.createElement('div');
        typing.className = 'msg ai';
        typing.id = 'typing';
        typing.innerHTML = `<b>هيثم AI</b><p>⏳ جاري التفكير...</p>`;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
        
        // رد هيثم بعد تأخير (محاكاة)
        setTimeout(() => {
            const typingEl = document.getElementById('typing');
            if (typingEl) typingEl.remove();
            
            const reply = getHaithamReply(message);
            const aiMsg = document.createElement('div');
            aiMsg.className = 'msg ai';
            aiMsg.innerHTML = `<b>هيثم AI</b><p>${reply.replace(/\n/g, '<br>')}</p>`;
            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;
            
            saveChatHistory();
        }, 800 + Math.random() * 700);
    }

    // --- 6. معالجة إرسال النموذج ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        input.value = '';
        sendMessage(message);
    });

    // --- 7. زر الإرسال ---
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

    // --- 8. إدخال عبر Enter ---
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = this.value.trim();
            if (!message) return;
            this.value = '';
            sendMessage(message);
        }
    });

    console.log('✅ هيثم AI جاهز! (نسخة بدون خادم)');
});
