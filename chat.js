// api/chat.js - Vercel Serverless

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      reply: 'Method not allowed'
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: 'اكتب رسالتك أولًا'
      });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        reply: 'خطأ: مفتاح OpenAI غير مضاف في Vercel'
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },

      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'أنت المساعد هيثم AI، مساعد تعليمي ذكي باللغة العربية. قدم إجابات واضحة ومفيدة ومنظمة للطلاب والمعلمين.'
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
      console.error('OpenAI Error:', data);

      return res.status(response.status).json({
        reply:
          data?.error?.message ||
          'حدث خطأ من خدمة الذكاء الاصطناعي'
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        reply: 'وصل رد غير متوقع من الذكاء الاصطناعي'
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error('Server Error:', error);

    return res.status(500).json({
      reply: 'حدث خطأ في الخادم: ' + error.message
    });
  }
}
