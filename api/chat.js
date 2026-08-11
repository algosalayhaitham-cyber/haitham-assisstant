const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  try {
    const { message, image } = req.body || {};

    if (!message && !image) {
      return res.status(400).json({ reply: 'اكتب رسالتك أو أرفق صورة أولاً' });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        reply: 'مفتاح API غير موجود في Vercel'
      });
    }

    // استخدام نموذج الرؤية عند وجود صورة، ونموذج النص السريع عند عدم وجودها
    const modelName = image ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';

    // تجهيز محتوى رسالة المستخدم (نص فقط أو نص + صورة)
    let userContent;

    if (image) {
      userContent = [
        { 
          type: "text", 
          text: message || "اقرأ واشرح هذه الصورة أو احل المسألة الموجودة فيها بالتفصيل." 
        },
        { 
          type: "image_url", 
          image_url: { url: image } 
        }
      ];
    } else {
      userContent = message;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `أنت هيثم AI، معلم رياضيات وعلوم ذكي وتفاعلي ومجيب بصري.
- إذا أرفق الطالب صورة، قم بقراءة وتحليل النص أو المسألة الرياضية فيها بدقة واشرح خطوات الحل بالتفصيل.
- تعامل بمرونة تامة مع الرموز والأرقام:
  1. إذا كتب أو أرفق الطالب بالأرقام والرموز العربية (مثل: س، ص، ١، ٢)، أجب بنفس النمط العربي.
  2. إذا كانت بالأرقام والرموز الإنجليزية (مثل: x, y, 1, 2)، أجب بالنمط الإنجليزي.
- اشرح خطوات الحل بالترتيب وبأسلوب تعليمي مبسط ومحفز.
- استخدم التنسيق الواضح للرموز والمعادلات.`
          },
          {
            role: 'user',
            content: userContent
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

 
