// app.js - هيثم AI
// الاتصال يكون عبر Vercel /api/chat وليس مباشرة من المتصفح

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    if (!form || !input || !messages) {
        console.warn('⚠️ عناصر المحادثة غير موجودة');
        return;
    }

    function loadChatHistory() {
        const saved = localStorage.getItem('haitham_chat_history');

        if (saved) {
            try {
                const history = JSON.parse(saved);

                messages.innerHTML = history.map(msg =>
                    `<div class="msg ${msg.role}">
                        <b>${msg.role === 'user' ? 'أنت' : 'هيثم AI'}</b>
                        <p>${escapeHtml(msg.text)}</p>
                    </div>`
                ).join('');
            } catch (e) {
                console.warn('تعذر تحميل سجل المحادثة');
            }
        }
    }

    loadChatHistory();

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function saveChatHistory() {
        const items = [];

        document.querySelectorAll('.msg').forEach(msg => {
            const role = msg.classList.contains('user') ? 'user' : 'ai';
            const text = msg.querySelector('p')?.textContent || '';

            items.push({
                role,
                text
            });
        });

        localStorage.setItem(
            'haitham_chat_history',
            JSON.stringify(items)
        );
    }

    async function getAIResponse(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            })
        });

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error(
                'الخادم أعاد استجابة غير صالحة'
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.reply || 'حدث خطأ في الاتصال بالخادم'
            );
        }

        return data?.reply || 'لم يصل رد من الذكاء الاصطناعي';
    }

    async function sendMessage(message) {
        if (!message || !message.trim()) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'msg user';

        const userText = document.createElement('p');
        userText.textContent = message;

        userMsg.innerHTML = '<b>أنت</b>';
        userMsg.appendChild(userText);

        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;

        saveChatHistory();

        const typing = document.createElement('div');
        typing.className = 'msg ai';
        typing.id = 'typing';
        typing.innerHTML =
            '<b>هيثم AI</b><p>⏳ جاري التفكير...</p>';

        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;

        try {
            const reply = await getAIResponse(message);

            const typingEl = document.getElementById('typing');

            if (typingEl) {
                typingEl.remove();
            }

            const aiMsg = document.createElement('div');
            aiMsg.className = 'msg ai';

            const title = document.createElement('b');
            title.textContent = 'هيثم AI';

            const replyText = document.createElement('p');
            replyText.innerHTML = escapeHtml(reply)
                .replace(/\n/g, '<br>');

            aiMsg.appendChild(title);
            aiMsg.appendChild(replyText);

            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;

            saveChatHistory();

        } catch (error) {
            const typingEl = document.getElementById('typing');

            if (typingEl) {
                typingEl.remove();
            }

            const aiMsg = document.createElement('div');
            aiMsg.className = 'msg ai';

            aiMsg.innerHTML =
                `<b>هيثم AI</b>
                 <p>❌ ${escapeHtml(error.message)}</p>`;

            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const message = input.value.trim();

        if (!message) return;

        input.value = '';

        sendMessage(message);
    });

    const sendBtn = document.querySelector('.btn-send');

    if (sendBtn) {
        sendBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const message = input.value.trim();

            if (!message) return;

            input.value = '';

            sendMessage(message);
        });
    }

    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            const message = this.value.trim();

            if (!message) return;

            this.value = '';

            sendMessage(message);
        }
    });

    console.log('✅ هيثم AI جاهز ويستخدم /api/chat');
});
