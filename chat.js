// api/chat.js
// هيثم AI - Gemini Backend
// جميع طلبات الذكاء الاصطناعي تمر من هنا

export default async function handler(req, res) {
    // السماح بـ POST فقط
    if (req.method !== "POST") {
        return res.status(405).json({
            reply: "طريقة الطلب غير مسموحة"
        });
    }

    try {
        const {
            message,
            knowledge = "",
            image = null
        } = req.body || {};

        if (!message && !image) {
            return res.status(400).json({
                reply: "اكتب رسالتك أو أرفق صورة أولًا"
            });
        }

        // مفتاح Gemini محفوظ في Vercel Environment Variables
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                reply:
                    "❌ مفتاح Gemini غير مضاف في إعدادات Vercel.\n\n" +
                    "أضف متغيرًا باسم GEMINI_API_KEY ثم أعد نشر المشروع."
            });
        }

        // النموذج
        const MODEL = "gemini-2.5-flash";

        const GEMINI_URL =
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

        // تعليمات هيثم AI
        const systemInstruction = `
أنت هيثم AI، المساعد التعليمي الذكي الخاص بالأستاذ هيثم القصلي.

أنت مساعد متخصص في التعليم والمناهج الدراسية، وخاصة الرياضيات.

مهمتك:
- الإجابة باللغة العربية.
- تقديم إجابات واضحة ومنظمة.
- شرح المسائل خطوة بخطوة.
- مساعدة المعلمين في إعداد الاختبارات والتحضير والأنشطة.
- مراعاة مستوى الطالب والصف الدراسي.
- عند إنشاء اختبار، اجعله جاهزًا للطباعة.
- لا تخترع معلومات عندما تكون غير متأكد.
- إذا كان السؤال رياضيًا، تحقق من الحل قبل تقديمه.
`;

        let textPrompt = message || "";

        if (knowledge) {
            textPrompt =
                `المعلومات الإضافية المتاحة:\n${knowledge}\n\n` +
                `طلب المستخدم:\n${textPrompt}`;
        }

        const parts = [];

        if (textPrompt) {
            parts.push({
                text: `${systemInstruction}\n\n${textPrompt}`
            });
        } else {
            parts.push({
                text: systemInstruction
            });
        }

        // دعم الصور إذا أرسلها التطبيق
        if (image) {
            let imageData = image;

            // إذا كانت الصورة Data URL
            if (imageData.startsWith("data:")) {
                const match = imageData.match(
                    /^data:(.*?);base64,(.*)$/
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

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 4000
                }
            })
        });

        const data = await response.json();

        console.log("Gemini status:", response.status);

        if (!response.ok) {
            console.error("Gemini Error:", data);

            return res.status(response.status).json({
                reply:
                    data?.error?.message ||
                    "حدث خطأ أثناء الاتصال بخدمة Gemini"
            });
        }

        const reply =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();

        if (!reply) {
            return res.status(500).json({
                reply: "❌ لم يصل رد من الذكاء الاصطناعي."
            });
        }

        return res.status(200).json({
            reply
        });

    } catch (error) {

        console.error("Server Error:", error);

        return res.status(500).json({
            reply:
                "❌ حدث خطأ في الخادم:\n" +
                error.message
        });
    }
}
