// server.js - خادم هيثم AI البسيط
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ملفات ثابتة
app.use(express.static('.'));

// نقطة نهاية المحادثة
app.use(express.json({ limit: '10mb' }));

app.post('/api/chat', async (req, res) => {
    const { message, image } = req.body;
    
    // ردود بسيطة (دون AI)
    let reply = `📚 شكراً لسؤالك: "${message}"\n\n`;
    reply += `🧠 أنا هيثم AI، مساعدك التعليمي الذكي.\n`;
    reply += `💡 أنصحك بمراجعة الدروس والتدريب المستمر.`;
    
    res.json({ reply: reply });
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`✅ خادم هيثم AI يعمل على المنفذ ${PORT}`);
});
