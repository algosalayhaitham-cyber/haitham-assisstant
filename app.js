// app.js
// هيثم AI - الواجهة الرئيسية

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("chatForm");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    if (!form || !input || !messages) {
        console.warn("⚠️ عناصر المحادثة غير موجودة");
        return;
    }

    // =========================================================
    // حماية النصوص من HTML
    // =========================================================

    function escapeHTML(text) {

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    // =========================================================
    // سجل المحادثة
    // =========================================================

    function loadChatHistory() {

        const saved =
            localStorage.getItem("haitham_chat_history");

        if (!saved) return;

        try {

            const history = JSON.parse(saved);

            messages.innerHTML = history.map(msg => {

                return `
                    <div class="msg ${msg.role}">
                        <b>
                            ${msg.role === "user" ? "أنت" : "هيثم AI"}
                        </b>
                        <p>${escapeHTML(msg.text).replace(/\n/g, "<br>")}</p>
                    </div>
                `;

            }).join("");

        } catch (error) {

            console.error("خطأ في تحميل المحادثة:", error);

        }

    }

    loadChatHistory();

    // =========================================================
    // حفظ المحادثة
    // =========================================================

    function saveChatHistory() {

        const items = [];

        messages.querySelectorAll(".msg").forEach(msg => {

            const role =
                msg.classList.contains("user")
                    ? "user"
                    : "ai";

            const text =
                msg.querySelector("p")?.textContent || "";

            items.push({
                role,
                text
            });

        });

        localStorage.setItem(
            "haitham_chat_history",
            JSON.stringify(items)
        );

    }

    // =========================================================
    // الاتصال بـ API
    // =========================================================

    async function getAIResponse(message) {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

        let data;

        try {

            data = await response.json();

        } catch {

            throw new Error(
                "الخادم لم يرجع استجابة صحيحة."
            );

        }

        if (!response.ok) {

            throw new Error(
                data?.reply ||
                "حدث خطأ في الاتصال بالذكاء الاصطناعي."
            );

        }

        return data.reply || "لم يصل رد من هيثم AI.";

    }

    // =========================================================
    // إرسال الرسالة
    // =========================================================

    async function sendMessage(message) {

        if (!message || !message.trim()) return;

        // رسالة المستخدم
        const userMsg =
            document.createElement("div");

        userMsg.className = "msg user";

        userMsg.innerHTML = `
            <b>أنت</b>
            <p>${escapeHTML(message)}</p>
        `;

        messages.appendChild(userMsg);

        messages.scrollTop =
            messages.scrollHeight;

        saveChatHistory();

        // رسالة الانتظار
        const typing =
            document.createElement("div");

        typing.className = "msg ai";
        typing.id = "typing";

        typing.innerHTML = `
            <b>هيثم AI</b>
            <p>⏳ جاري التفكير...</p>
        `;

        messages.appendChild(typing);

        messages.scrollTop =
            messages.scrollHeight;

        try {

            const reply =
                await getAIResponse(message);

            typing.remove();

            const aiMsg =
                document.createElement("div");

            aiMsg.className = "msg ai";

            aiMsg.innerHTML = `
                <b>هيثم AI</b>
                <p>
                    ${escapeHTML(reply).replace(/\n/g, "<br>")}
                </p>
            `;

            messages.appendChild(aiMsg);

            messages.scrollTop =
                messages.scrollHeight;

            saveChatHistory();

        } catch (error) {

            if (typing) typing.remove();

            const aiMsg =
                document.createElement("div");

            aiMsg.className = "msg ai";

            aiMsg.innerHTML = `
                <b>هيثم AI</b>
                <p>
                    ❌ ${escapeHTML(error.message)}
                </p>
            `;

            messages.appendChild(aiMsg);

            messages.scrollTop =
                messages.scrollHeight;

        }

    }

    // =========================================================
    // زر الإرسال
    // =========================================================

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const message =
            input.value.trim();

        if (!message) return;

        input.value = "";

        sendMessage(message);

    });

    // =========================================================
    // Enter
    // =========================================================

    input.addEventListener("keydown", function (e) {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            const message =
                input.value.trim();

            if (!message) return;

            input.value = "";

            sendMessage(message);

        }

    });

    console.log(
        "✅ هيثم AI يعمل عبر Gemini API"
    );

});
