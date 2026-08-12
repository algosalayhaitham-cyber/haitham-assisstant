// api/chat.js - Vercel Serverless (نسخة محسنة تدعم النصوص والصور والمعرفة)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      reply: 'Method not allowed'
    });
  }

  try {
    const { message, image, knowledge } = req.body || {};

    if (!message && !image) {
      return res.status(400).json({
        reply: 'اكتب رسالتك أو أرفق صورة أولًا'
      });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        reply: 'خطأ: مفتاح OpenAI غير مضاف في إعدادات Vercel'
      });
    }

    // بناء رسالة المستخدم (تدعم النصوص المباشرة أو الصور)
    let userContent = [];
    
    if (message) {
      userContent.push({
        type: 'text',
        text: knowledge ? `سياق معلومة مسبقة:\n${knowledge}\n\nسؤال المستخدم: ${message}` : message
      });
    }

    if (image) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: image
        }
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
            content: 'أنت المساعد هيثم AI، مساعد تعليمي ذكي باللغة العربية متخصص في المواد الدراسية (الرياضيات، العلوم، وغيرها). قدم إجابات واضحة، دقيقة، ومفيدة ومنظمة للطلاب والمعلمين.'
          },
          {
            role: 'user',
            content: userContent.length === 1 && userContent[0].type === 'text' ? userContent[0].text : userContent
          }
        ],
        max_tokens: 1500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI Error:', data);
      return res.status(response.status).json({
        reply: data?.error?.message || 'حدث خطأ من خدمة الذكاء الاصطناعي'
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
