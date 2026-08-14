// app.js - هيثم AI (نسخة معدلة للبحث في المحتوى)

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    if (!form || !input || !messages) {
        console.warn('⚠️ عناصر المحادثة غير موجودة');
        return;
    }

    // ================================================================
    // 📚 قاعدة المعرفة (نفسها لكن مع توسيع الكلمات المفتاحية)
    // ================================================================
    const KNOWLEDGE_BASE = {
        // ... ضع هنا جميع المواضيع القديمة والجديدة ...
        // (يمكنك نسخها من الكود السابق)
    };

    // ================================================================
    // 🔍 دالة البحث المعدلة (تبحث في المحتوى أيضاً)
    // ================================================================
    function searchKnowledge(query) {
        if (!query) return null;
        const lowerQuery = query.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
            let score = 0;

            // 1. البحث في الكلمات المفتاحية
            for (const keyword of data.keywords) {
                if (lowerQuery.includes(keyword)) {
                    score += 3;
                }
            }

            // 2. البحث في محتوى الإجابة
            const contentLines = data.content.split('\n');
            for (const line of contentLines) {
                if (line.toLowerCase().includes(lowerQuery)) {
                    score += 1;
                }
            }

            // 3. كلمات رئيسية عامة
            const importantWords = ['معادلة', 'جذر', 'مشتقة', 'تكامل', 'مساحة', 'محيط', 'نظرية', 'قانون', 'متجه', 'مصفوفة', 'متتالية', 'احتمال', 'وسط', 'تباين'];
            for (const word of importantWords) {
                if (lowerQuery.includes(word) && data.content.includes(word)) {
                    score += 2;
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = data.content;
            }
        }

        return highestScore >= 2 ? bestMatch : null;
    }

    // ================================================================
    // 💬 دوال المحادثة (نفسها)
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

    function getHaithamReply(message) {
        const knowledge = searchKnowledge(message);
        if (knowledge) {
            return knowledge + '\n\n📖 هذه المعلومات مأخوذة من ملخصات هيثم AI.';
        }

        const lower = message.toLowerCase();
        if (lower.includes('السلام') || lower.includes('مرحب')) {
            return '👋 وعليكم السلام! كيف يمكنني مساعدتك اليوم؟';
        }
        if (lower.includes('شكر')) {
            return '🌟 العفو! أنا هنا لمساعدتك دائماً.';
        }
        if (lower.includes('اسم')) {
            return '🧠 أنا هيثم AI، مساعدك التعليمي الذكي!';
        }
        
        return '📚 شكراً لسؤالك! أنا هنا لمساعدتك.\n\n💡 ما الذي تريد معرفته بالضبط؟';
    }

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

    console.log('✅ هيثم AI جاهز! (يبحث في المحتوى أيضاً)');
});
