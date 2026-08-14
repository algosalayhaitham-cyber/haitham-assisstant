// app.js
// هيثم AI
// الاتصال بالذكاء الاصطناعي يتم من خلال /api/chat

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("chatForm");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");
    const sendBtn = document.getElementById("sendBtn");

    if (!form || !input || !messages) {
        console.error("عناصر المحادثة غير موجودة");
        return;
    }


    // =====================================================
    // فتح صفحة إنشاء الاختبار
    // =====================================================

    window.openExam = function () {
        window.location.href = "exam.html";
    };


    // =====================================================
    // الانتقال إلى المحادثة
    // =====================================================

    window.goChat = function () {

        const chat = document.getElementById("chat");

        if (chat) {
            chat.scrollIntoView({
                behavior: "smooth"
            });

            setTimeout(() => {
                input.focus();
            }, 500);
        }

    };


    // =====================================================
    // إرسال طلب سريع
    // =====================================================

    window.sendQuick = function (text) {

        goChat();

        input.value = text;

        setTimeout(() => {
            input.focus();
        }, 500);

    };


    // =====================================================
    // إضافة رسالة
    // =====================================================

    function addMessage(role, text) {

        const div = document.createElement("div");

        div.className =
            `msg ${role}`;

        const title =
            role === "user"
                ? "أنت"
                : "هيثم AI";

        div.innerHTML = `
            <b>${title}</b>
            <p></p>
        `;

        div.querySelector("p").textContent = text;

        messages.appendChild(div);

        messages.scrollTop =
            messages.scrollHeight;

        return div;
    }


    // =====================================================
    // إرسال الرسالة إلى الخادم
    // =====================================================

    async function sendMessage(message) {

        if (!message.trim()) {
            return;
        }

        addMessage("user", message);

        input.value = "";

        sendBtn.disabled = true;
        sendBtn.textContent = "⏳";


        const loading =
            addMessage(
                "ai",
                "⏳ جاري التفكير..."
            );


        try {

            const response =
                await fetch("/api/chat", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })

                });


            // محاولة قراءة JSON
            let data;

            try {

                data =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "الخادم لم يُرجع استجابة صحيحة. تأكد من نشر api/chat.js في Vercel."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.reply ||
                    "حدث خطأ من الخادم"
                );

            }


            const reply =
                data.reply ||
                "لم يصل رد من هيثم AI.";


            loading.querySelector("p")
                .textContent = reply;


        } catch (error) {

            console.error(
                "Chat Error:",
                error
            );

            loading.querySelector("p")
                .textContent =
                "❌ " +
                error.message;

        } finally {

            sendBtn.disabled = false;
            sendBtn.textContent = "إرسال";

            messages.scrollTop =
                messages.scrollHeight;

        }

    }


    // =====================================================
    // زر الإرسال
    // =====================================================

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const message =
                input.value.trim();

            if (!message) {
                return;
            }

            sendMessage(message);

        }
    );


    // =====================================================
    // Enter للإرسال
    // =====================================================

    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                const message =
                    input.value.trim();

                if (!message) {
                    return;
                }

                sendMessage(message);

            }

        }
    );


    console.log(
        "✅ هيثم AI جاهز"
    );

});
