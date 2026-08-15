export default async function handler(req, res) {
  // السماح بالطلبات من الموقع
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // طلب OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // نسمح فقط بـ POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "الطلب يجب أن يكون POST"
    });
  }

  try {
    // مفتاح Gemini من Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "مفتاح GEMINI_API_KEY غير موجود في Vercel"
      });
    }

    // قراءة البيانات القادمة من الموقع
    const body = req.body || {};

    // دعم أكثر من طريقة لإرسال الرسالة
    let message = "";

    if (typeof body.message === "string") {
      message = body.message;
    } else if (typeof body.prompt === "string") {
      message = body.prompt;
    } else if (Array.isArray(body.messages)) {
      const lastMessage = body.messages[body.messages.length - 1];

      if (lastMessage) {
        message =
          lastMessage.content ||
          lastMessage.text ||
          lastMessage.message ||
          "";
      }
    }

    message = String(message).trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "لم يتم إرسال السؤال"
      });
    }

    // تعليمات هيثم AI
    const systemInstruction = `
أنت هيثم AI، المساعد التعليمي الذكي للأستاذ هيثم القصلي.

مهمتك مساعدة الطلاب والمعلمين باللغة العربية.

أجب بطريقة:
- واضحة
- دقيقة
- سهلة الفهم
- مناسبة للطلاب
- منظمة
- بدون حشو

في الرياضيات:
اشرح الحل خطوة بخطوة، ثم اذكر الإجابة النهائية بوضوح.

عند إنشاء اختبار:
أنشئ أسئلة مناسبة للصف والمادة والمستوى المطلوب.
لا تضع إجابات خاطئة.
اجعل الأسئلة متنوعة ومنظمة.

إذا طلب المستخدم إنشاء اختبار، فأعطه الاختبار بشكل مرتب وواضح.
`;

    // استخدام Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
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
                text: systemInstruction
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ],

          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000
          }
        })
      }
    );

    // قراءة الرد
    const data = await response.json();

    // إذا كان هناك خطأ من Gemini
    if (!response.ok) {
      console.error("Gemini API Error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "حدث خطأ أثناء الاتصال بـ Gemini"
      });
    }

    // استخراج النص
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    if (!text) {
      return res.status(500).json({
        success: false,
        error: "تم الاتصال بـ Gemini ولكن لم يصل رد نصي"
      });
    }

    // إرسال النتيجة للموقع
    return res.status(200).json({
      success: true,
      reply: text,
      message: text
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "حدث خطأ في الخادم"
    });
  }
}
