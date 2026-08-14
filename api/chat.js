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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        reply: '❌ مفتاح OPENAI_API_KEY غير موجود في Vercel. أضفه من Settings → Environment Variables ثم أعد النشر.'
      });
    }

    const content = [];

    if (message) {

      content.push({
        type: 'text',
        text: knowledge
          ? `سياق معلومة مسبقة:
${knowledge}

سؤال المستخدم:
${message}`
          : message
      });

    }

    if (image) {

      content.push({
        type: 'image_url',
        image_url: {
          url: image
        }
      });

    }

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },

        body: JSON.stringify({

          model: 'gpt-4o-mini',

          messages: [

            {
              role: 'system',

              content:
                'أنت هيثم AI، مساعد تعليمي ذكي باللغة العربية. قدم إجابات واضحة ودقيقة ومنظمة ومناسبة للطلاب والمعلمين.'
            },

            {
              role: 'user',

              content:
                content.length === 1 &&
                content[0].type === 'text'
                  ? content[0].text
                  : content

            }

          ],

          max_tokens: 2000

        })

      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error('OpenAI Error:', data);

      return res.status(response.status).json({
        reply:
          data?.error?.message ||
          'حدث خطأ من خدمة الذكاء الاصطناعي'
      });

    }

    const reply =
      data?.choices?.[0]?.message?.content;

    if (!reply) {

      return res.status(500).json({
        reply:
          'وصل رد غير متوقع من الذكاء الاصطناعي'
      });

    }

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error('Server Error:', error);

    return res.status(500).json({
      reply:
        'حدث خطأ في الخادم: ' +
        error.message
    });

  }

}
