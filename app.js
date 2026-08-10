document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');

  if (!form || !input || !messages) {
    alert('خطأ: لم يتم العثور على عناصر المحادثة');
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const text = input.value.trim();

    if (!text) return;

    const msg = document.createElement('div');
    msg.className = 'msg user';

    msg.innerHTML = `
      <b>أنت</b>
      <p>${text}</p>
    `;

    messages.appendChild(msg);

    input.value = '';

    const reply = document.createElement('div');
    reply.className = 'msg ai';

    reply.innerHTML = `
      <b>هيثم AI</b>
      <p>وصلت رسالتك بنجاح ✅</p>
    `;

    messages.appendChild(reply);

    messages.scrollTop = messages.scrollHeight;
  });

});
