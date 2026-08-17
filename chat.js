export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed"
    });
  }

  try {
    const { message, image, knowledge } = req.body || {};

    if (!message && !image) {
      return res.status(400).json({
        reply: "اكتب رسالتك أو أرفق صورة أولًا"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        reply: "❌ مفتاح GEMINI_API_KEY غير موجود في Vercel."
      });
    }

    // تجهيز نص المستخدم مع معلومات البحث إن وجدت
    let userText = message || "";

    if (knowledge) {
      userText =
        `سياق معلومات تم العثور عليه من البحث:\n\n` +
        knowledge +
        `\n\nسؤال المستخدم:\n` +
        userText;
    }

    const parts = [];

    if (userText) {
      parts.push({
        text: userText
      });
    }

    // دعم الصور المرسلة من الموقع
    if (image) {
      let imageData = image;

      if (imageData.startsWith("data:")) {
        const match = imageData.match(
          /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
        );

        if (match) {
          parts.push({
            inline_data: {
              mime_type: match[1],
              data: match[2]
            }
          });
        }
      }
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `
أنت "هيثم AI"، المساعد التعليمي الذكي للأستاذ هيثم القصلي.

أنت مساعد تعليمي باللغة العربية، وتساعد في:
- الإجابة عن أسئلة المستخدم.
- البحث وفهم المعلومات التي يتم تمريرها إليك.
- الرياضيات وحل المسائل خطوة بخطوة.
- إعداد الاختبارات.
- إعداد الدروس والتحاضير.
- شرح المناهج للطلاب والمعلمين.

قواعد مهمة:
1. أجب باللغة العربية ما لم يطلب المستخدم غير ذلك.
2. كن واضحًا ودقيقًا ومنظمًا.
3. إذا أرسل المستخدم معلومات من البحث، استفد منها وأجب بناءً عليها.
4. في الرياضيات اشرح الحل خطوة بخطوة.
5. إذا طلب المستخدم إنشاء اختبار، أنشئ اختبارًا كاملًا ومنظمًا حسب المادة والصف وعدد الأسئلة والصعوبة ونوع الأسئلة التي يحددها.
6. لا تقل للمستخدم إنك لا تستطيع إنشاء الاختبارات.
7. لا تذكر مفاتيح API أو تفاصيل الخادم للمستخدم.
                `
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: parts
            }
          ],

          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 5000
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);

      return res.status(response.status).json({
        reply:
          data?.error?.message ||
          "❌ حدث خطأ أثناء الاتصال بخدمة Gemini."
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(500).json({
        reply: "❌ لم يصل رد من Gemini."
      });
    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      reply: "❌ حدث خطأ في الخادم: " + error.message
    });
  }
}
