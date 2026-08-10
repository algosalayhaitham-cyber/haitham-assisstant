ج// api/chat.js - هذا يشتغل على Vercel Serverless
async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // بنضيفه بعدين في Vercel

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ reply: 'خطأ: مفتاح OpenAI غير مضاف' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
       model: 'gpt-4o', // رخيص وسريع
        messages: [
          { role: 'system', content: 'انت المساعد هيثم، مساعد تعليمي ذكي باللغة العربية. اجاباتك واضحة ومفيدة للطلاب.' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: 'صار خطأ في الاتصال مع الذكاء الاصطناعي' });
  }
}
module.exports = handler;
