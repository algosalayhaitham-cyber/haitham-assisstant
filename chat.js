// api/chat.js
// هيثم AI - Gemini API
// Vercel Serverless Function

export default async function handler(req, res) {

    // السماح بالـ POST فقط
    if (req.method !== "POST") {
        return res.status(405).json({
            reply: "الطريقة غير مسموحة"
        });
    }

    try {

        const { message, image, knowledge } = req.body || {};

        // التأكد من وجود طلب
        if (!message && !image) {
            return res.status(400).json({
                reply: "اكتب رسالتك أو أرفق صورة أولًا."
            });
        }

        // =========================================================
        // مفتاح Gemini من Vercel Environment Variables
        // =========================================================

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {

            return res.status(500).json({
                reply:
                    "❌ مفتاح Gemini غير موجود في Vercel.\n\n" +
                    "أضف متغيرًا باسم GEMINI_API_KEY في Environment Variables."
            });

        }

        // =========================================================
        // إعداد النص
        // =========================================================

        let finalMessage = message || "";

        if (knowledge) {
            finalMessage =
                "معلومات مساعدة مسبقة:\n" +
                knowledge +
                "\n\n" +
                "طلب المستخدم:\n" +
                finalMessage;
        }

        // =========================================================
        // تعليمات هيثم AI
        // =========================================================

        const systemInstruction = `
أنت "هيثم AI"، المساعد التعليمي الذكي الخاص بالأستاذ هيثم القصلي.

مهمتك مساعدة المعلمين والطلاب في:
- الرياضيات
- العلوم
- اللغة العربية
- اللغة الإنجليزية
- الدراسات الاجتماعية
- القرآن الكريم
- إعداد الاختبارات
- حل المسائل
- شرح الدروس
- إعداد الخطط والتحاضير
- إنشاء الأسئلة ونماذج الإجابة
- تحليل الصور التعليمية وأوراق الأسئلة

قواعد الإجابة:
1. أجب باللغة العربية ما لم يطلب المستخدم لغة أخرى.
2. اجعل الإجابة واضحة ومنظمة وسهلة الفهم.
3. عند حل المسائل الرياضية، اشرح الخطوات بالتفصيل.
4. عند إنشاء اختبار، اجعله مناسبًا للصف والموضوع وعدد الأسئلة المطلوب.
5. لا تخترع معلومات إذا لم تكن متأكدًا منها.
6. تعامل مع المستخدم باحترام وود.
7. إذا كان السؤال غامضًا، اطلب توضيحًا مناسبًا.
8. إذا أرسل المستخدم صورة، حلل محتواها وأجب عن طلبه.
`;

        // =========================================================
        // تجهيز أجزاء الطلب
        // =========================================================

        const parts = [];

        if (finalMessage) {
            parts.push({
                text: systemInstruction + "\n\n" + finalMessage
            });
        } else {
            parts.push({
                text: systemInstruction
            });
        }

        // =========================================================
        // دعم الصور
        // =========================================================

        if (image) {

            let base64Image = image;
            let mimeType = "image/jpeg";

            // إذا كانت الصورة Data URL
            if (image.startsWith("data:")) {

                const match = image.match(
                    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
                );

                if (match) {
                    mimeType = match[1];
                    base64Image = match[2];
                }

            }

            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64Image
                }
            });
        }

        // =========================================================
        // الاتصال بـ Gemini
        // =========================================================

        const MODEL = "gemini-2.5-flash";

        const GEMINI_URL =
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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
                        parts: parts
                    }
                ],

                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4000
                }

            })

        });

        // =========================================================
        // قراءة رد Gemini
        // =========================================================

        const data = await response.json();

        if (!response.ok) {

            console.error("Gemini API Error:", data);

            return res.status(response.status).json({

                reply:
                    data?.error?.message ||
                    "حدث خطأ أثناء الاتصال بخدمة Gemini."

            });
        }

        // =========================================================
        // استخراج الإجابة
        // =========================================================

        const reply =
            data?.candidates?.[0]?.content?.parts
                ?.filter(part => part.text)
                ?.map(part => part.text)
                ?.join("\n")
            || "";

        if (!reply) {

            console.error("Gemini Empty Response:", data);

            return res.status(500).json({
                reply: "❌ لم يصل رد نصي من Gemini."
            });

        }

        // =========================================================
        // إرسال الإجابة للواجهة
        // =========================================================

        return res.status(200).json({
            reply: reply
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
