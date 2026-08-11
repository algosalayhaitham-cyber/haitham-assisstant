const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: 'اكتب رسالتك أولاً' });
    }

    // هنا يتم قراءة المفتاح الخاص بـ Groq أو OpenAI
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        reply: 'مفتاح API غير موجود في Vercel'
      });
    }

    // تم تغيير الرابط ليعمل مع سيرفرات Groq المجانية
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'أنت هيثم AI، مساعد تعليمي ذكي باللغة العربية.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        reply: data?.error?.message || 'خطأ من مزود الخدمة'
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || 'لم يصل رد من الذكاء الاصطناعي'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: 'خطأ في الخادم: ' + error.message
    });
  }
};

module.exports = handler;
 
