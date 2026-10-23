
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildNotificationEmail({ title, message }) {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

  return {
    text: `${title}\n\n${message}`,
    html: `
      <!doctype html>
      <html>
        <body style="font-family:Arial,sans-serif;line-height:1.6">
          <div style="max-width:600px;margin:auto;padding:24px">
            <h2>${safeTitle}</h2>
            <p>${safeMessage}</p>
            <hr />
            <p style="font-size:12px;color:#666">
              This is an automated notification from your store.
            </p>
          </div>
        </body>
      </html>
    `,
  };
}
