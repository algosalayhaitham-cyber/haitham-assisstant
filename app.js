// app.js - هيثم AI (النسخة النهائية - قاعدة معرفة شاملة)

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    if (!form || !input || !messages) {
        console.warn('⚠️ عناصر المحادثة غير موجودة');
        return;
    }

    // ================================================================
    // 📚 قاعدة المعرفة الشاملة للرياضيات
    // ================================================================
    const KNOWLEDGE_BASE = {
        'معادلات من الدرجة الثانية': {
            keywords: ['معادلة من الدرجة الثانية', 'معادلة تربيعية', 'جذور معادلة', 'المميز', 'دلتا', 'ax²+bx+c', 'حل معادلة تربيعية'],
            content: `
📚 **المعادلات التربيعية (من الدرجة الثانية):**

**الصيغة العامة:** ax² + bx + c = 0

**طريقة الحل باستخدام المميز (Δ):**
1. احسب المميز: Δ = b² - 4ac
2. إذا كان Δ > 0 → جذران حقيقيان مختلفان
3. إذا كان Δ = 0 → جذران حقيقيان متساويان
4. إذا كان Δ < 0 → جذران مركبان (لا يوجد حل حقيقي)

**قانون الجذرين:**
x = (-b ± √Δ) / 2a

**طريقة التحليل:**
- ابحث عن عددين حاصل ضربهما = ac ومجموعهما = b
- مثال: x² - 5x + 6 = 0 → (x-2)(x-3) = 0 → x = 2 أو x = 3

💡 **نصيحة:** استخدم المميز أولاً لتحديد نوع الجذور قبل الحل.
            `
        },
        'معادلات من الدرجة الأولى': {
            keywords: ['معادلة من الدرجة الأولى', 'معادلة خطية', 'حل معادلة', 'ax+b=0', 'متغير واحد'],
            content: `
📚 **المعادلات الخطية (من الدرجة الأولى):**

**الصيغة العامة:** ax + b = 0

**خطوات الحل:**
1. انقل الحدود المتغيرة إلى طرف (x).
2. انقل الأعداد الثابتة إلى الطرف الآخر.
3. اقسم الطرفين على معامل x.

**مثال:**
2x + 5 = 13
2x = 13 - 5
2x = 8
x = 4

✅ **تحقق:** 2×4 + 5 = 8 + 5 = 13 ✓

💡 **نصيحة:** تأكد دائماً من صحة الحل بالتعويض في المعادلة الأصلية.
            `
        },
        'الهندسة والمساحات': {
            keywords: ['مساحة', 'محيط', 'هندسة', 'مساحة مربع', 'مساحة مستطيل', 'مساحة مثلث', 'مساحة دائرة', 'حجم'],
            content: `
📚 **قوانين المساحات والمحيطات:**

**المربع:**
- المساحة = الضلع²
- المحيط = 4 × الضلع

**المستطيل:**
- المساحة = الطول × العرض
- المحيط = 2 × (الطول + العرض)

**المثلث:**
- المساحة = (القاعدة × الارتفاع) / 2
- المحيط = مجموع الأضلاع

**الدائرة:**
- المساحة = π × نصف القطر²
- المحيط = 2 × π × نصف القطر

**متوازي الأضلاع:**
- المساحة = القاعدة × الارتفاع

💡 **نصيحة:** احفظ هذه القوانين الأساسية في الهندسة.
            `
        },
        'نظرية فيثاغورس': {
            keywords: ['فيثاغورس', 'نظرية فيثاغورس', 'مثلث قائم', 'وتر', 'a²+b²=c²'],
            content: `
📚 **نظرية فيثاغورس:**

**النص:** في المثلث القائم الزاوية، مربع الوتر يساوي مجموع مربعي الضلعين الآخرين.

**الصيغة:** a² + b² = c²

حيث c هو الوتر (الضلع الأطول).

**مثال:**
مثلث أضلاعه: 3، 4، 5
3² + 4² = 9 + 16 = 25 = 5²
إذن المثلث قائم الزاوية.

💡 **نصيحة:** تستخدم النظرية فقط في المثلثات القائمة الزاوية.
            `
        },
        'قواعد الاشتقاق': {
            keywords: ['اشتقاق', 'مشتقة', 'تفاضل', 'قواعد الاشتقاق', 'مشتقة دالة', 'derivative'],
            content: `
📚 **قواعد الاشتقاق الأساسية:**

**1. مشتقة الثابت:** d/dx(c) = 0

**2. مشتقة x^n:** d/dx(x^n) = n·x^(n-1)

**3. مشتقة الجمع:** d/dx(f+g) = f' + g'

**4. مشتقة الضرب:** d/dx(f·g) = f'·g + f·g'

**5. مشتقة القسمة:** d/dx(f/g) = (f'·g - f·g') / g²

**مشتقات الدوال المثلثية:**
- d/dx(sin x) = cos x
- d/dx(cos x) = -sin x
- d/dx(tan x) = sec² x

💡 **نصيحة:** احفظ هذه القواعد، فهي أساس التفاضل والتكامل.
            `
        },
        'التكامل': {
            keywords: ['تكامل', 'قواعد التكامل', 'تكامل غير محدود', 'تكامل محدود', '∫'],
            content: `
📚 **قواعد التكامل الأساسية:**

**1. تكامل x^n:** ∫x^n dx = x^(n+1)/(n+1) + C

**2. تكامل الثابت:** ∫c dx = cx + C

**3. تكامل الجمع:** ∫(f+g) dx = ∫f dx + ∫g dx

**4. تكامل الدوال المثلثية:**
- ∫sin x dx = -cos x + C
- ∫cos x dx = sin x + C
- ∫sec² x dx = tan x + C

**التكامل المحدود:**
∫[a,b] f(x) dx = F(b) - F(a)

💡 **نصيحة:** التكامل هو العملية العكسية للاشتقاق.
            `
        },
        'الإحصاء والاحتمالات': {
            keywords: ['وسط حسابي', 'متوسط', 'وسيط', 'منوال', 'احتمال', 'إحصاء'],
            content: `
📚 **مقاييس النزعة المركزية:**

**الوسط الحسابي:**
x̄ = (x₁ + x₂ + ... + x_n) / n

**الوسيط:**
- رتب البيانات تصاعدياً.
- إذا كان العدد فردياً: الوسيط هو القيمة الوسطى.
- إذا كان العدد زوجياً: الوسيط = متوسط القيمتين الوسطيتين.

**المنوال:** القيمة الأكثر تكراراً.

**الاحتمال:**
P(حدث) = عدد النواتج المواتية / عدد النواتج الممكنة

💡 **نصيحة:** استخدم هذه المقاييس لتحليل البيانات.
            `
        },
        'المتتاليات': {
            keywords: ['متتالية حسابية', 'متتالية هندسية', 'حد عام', 'مجموع متتالية', 'المتسلسلات'],
            content: `
📚 **المتتاليات الحسابية والهندسية:**

**المتتالية الحسابية:**
- الحد العام: a_n = a₁ + (n-1)d
- مجموع أول n حد: S_n = n/2 × (2a₁ + (n-1)d)

**المتتالية الهندسية:**
- الحد العام: a_n = a₁ × r^(n-1)
- مجموع أول n حد: S_n = a₁(1-r^n)/(1-r)

💡 **نصيحة:** حدد نوع المتتالية أولاً (حسابية أم هندسية).
            `
        },
        'المصفوفات': {
            keywords: ['مصفوفة', 'جمع مصفوفات', 'ضرب مصفوفات', 'محدد مصفوفة', 'معكوس مصفوفة'],
            content: `
📚 **المصفوفات:**

**جمع المصفوفات:** اجمع العناصر المتناظرة (نفس الأبعاد).

**ضرب المصفوفات:**
- الشرط: عدد أعمدة الأولى = عدد صفوف الثانية.
- الناتج: (م×ن) × (ن×ل) = (م×ل)

**محدد المصفوفة (2×2):**
|a b| = ad - bc
|c d|

**معكوس المصفوفة (2×2):**
A⁻¹ = 1/(ad-bc) × [d, -b; -c, a]

💡 **نصيحة:** المصفوفات تستخدم في حل أنظمة المعادلات.
            `
        }
    };

    // ================================================================
    // 🔍 البحث في قاعدة المعرفة
    // ================================================================
    function searchKnowledge(query) {
        if (!query) return null;
        const lowerQuery = query.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        for (const [topic, data] of Object.entries(KNOWLEDGE_BASE)) {
            let score = 0;
            for (const keyword of data.keywords) {
                if (lowerQuery.includes(keyword)) {
                    score += 2;
                }
            }
            if (data.content.toLowerCase().includes(lowerQuery)) {
                score += 1;
            }
            if (score > highestScore) {
                highestScore = score;
                bestMatch = data.content;
            }
        }

        return highestScore >= 2 ? bestMatch : null;
    }

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

    function getHaithamReply(message) {
        // البحث في قاعدة المعرفة
        const knowledge = searchKnowledge(message);
        if (knowledge) {
            return knowledge + '\n\n💡 هذه المعلومات مأخوذة من ملخصات هيثم AI.';
        }

        const lower = message.toLowerCase();
        if (lower.includes('السلام') || lower.includes('مرحب')) {
            return '👋 وعليكم السلام! كيف يمكنني مساعدتك اليوم؟';
        }
        if (lower.includes('شكر')) {
            return '🌟 العفو! أنا هنا لمساعدتك دائماً.';
        }
        if (lower.includes('كيف حال')) {
            return '😊 أنا بخير، شكراً لسؤالك! كيف يمكنني مساعدتك اليوم؟';
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

    console.log('✅ هيثم AI جاهز! قاعدة المعرفة تشمل جميع فروع الرياضيات.');
});
