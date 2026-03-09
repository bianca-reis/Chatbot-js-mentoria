export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  const { report_content, clientName, date } = req.body
  if (!report_content || !clientName) {
    return res.status(400).json({ error: "Missing report_content or clientName" })
  }
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const templateId = process.env.EMAILJS_TEMPLATE_ID
  const toEmail = process.env.EMAILJS_TO_EMAIL
  if (!publicKey || !serviceId || !templateId || !toEmail) {
    const missing = []
    if (!publicKey) missing.push("EMAILJS_PUBLIC_KEY")
    if (!serviceId) missing.push("EMAILJS_SERVICE_ID")
    if (!templateId) missing.push("EMAILJS_TEMPLATE_ID")
    if (!toEmail) missing.push("EMAILJS_TO_EMAIL")
    return res.status(500).json({ error: "Variáveis faltando: " + missing.join(", ") })
  }
  try {
    const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: toEmail,
          report_content,
          date: date || new Date().toLocaleDateString("pt-BR")
        }
      })
    })
    if (!r.ok) {
      const text = await r.text()
      throw new Error(text || r.statusText)
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || "Failed to send email" })
  }
}
