const http = require("http")
const fs = require("fs")
const path = require("path")

// Carrega .env.local se existir
const envPath = path.join(__dirname, ".env.local")
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  })
}

const PORT = 3000

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/send-report") {
    let body = ""
    for await (const chunk of req) body += chunk
    try {
      const { report_content, clientName, date } = JSON.parse(body)
      const publicKey = process.env.EMAILJS_PUBLIC_KEY
      const serviceId = process.env.EMAILJS_SERVICE_ID
      const templateId = process.env.EMAILJS_TEMPLATE_ID
      const toEmail = process.env.EMAILJS_TO_EMAIL
      if (!publicKey || !serviceId || !templateId || !toEmail) {
        res.writeHead(500, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: "Configure o .env.local com as variáveis do EmailJS" }))
      }
      const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: { to_email: toEmail, report_content, date: date || new Date().toLocaleDateString("pt-BR") }
        })
      })
      if (!r.ok) throw new Error(await r.text())
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: err.message || "Erro ao enviar" }))
    }
    return
  }

  let filePath = req.url === "/" ? "/index.html" : req.url
  filePath = path.join(__dirname, filePath)
  const ext = path.extname(filePath)
  const contentType = mimeTypes[ext] || "application/octet-stream"
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      return res.end("Arquivo não encontrado")
    }
    res.writeHead(200, { "Content-Type": contentType })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log("")
  console.log("  Chatbot rodando em: http://localhost:" + PORT)
  console.log("  Pressione Ctrl+C para parar")
  console.log("")
})
