// Credenciais ficam no servidor (Vercel env vars). Nada sensível aqui.

let chat = document.getElementById("chat")
let respostas = {
  treinos: "",
  energia: "",
  dores: "",
  alimentacao: "",
  sono: "",
  estresse: "",
  obstaculo: "",
  evolucao: "",
  observacao: ""
}
let currentStep = "treinos"
const STEPS = ["treinos", "energia", "dores", "alimentacao", "sono", "estresse", "obstaculo", "evolucao"]
const STEP_LABELS = { treinos: "Treinos", energia: "Energia", dores: "Dores", alimentacao: "Alimentação", sono: "Sono", estresse: "Estresse", obstaculo: "Obstáculo", evolucao: "Evolução" }

function updateProgressBar(forceDone) {
  const idx = STEPS.indexOf(currentStep)
  const done = forceDone !== undefined ? forceDone : (currentStep === "done" ? 8 : idx)
  const fill = document.getElementById("progressFill")
  const text = document.getElementById("progressText")
  if (fill) fill.style.width = (done / 8) * 100 + "%"
  if (text) text.textContent = done + " de 8"
}

function bot(msg, opts = {}) {
  if (opts.typing) {
    const typingId = "typing-" + Date.now()
    const row = document.createElement("div")
    row.className = "msg-row bot"
    row.id = typingId
    row.innerHTML = `
      <img class="msg-avatar" src="avatar.svg" alt="BIA" />
      <div class="msg bot typing-msg">
        <div class="typing-indicator">
          <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
        </div>
      </div>
    `
    chat.appendChild(row)
    chat.scrollTop = chat.scrollHeight
    setTimeout(() => {
      row.remove()
      bot(msg)
    }, 1200)
    return
  }
  chat.innerHTML += `
    <div class="msg-row bot">
      <img class="msg-avatar" src="avatar.svg" alt="BIA" />
      <div class="msg bot"><b>BIA:</b> ${msg}</div>
    </div>
  `
  chat.scrollTop = chat.scrollHeight
}

function user(msg) {
  chat.innerHTML += `
    <div class="msg-row user">
      <div class="msg user"><b>Você:</b> ${msg}</div>
      <img class="msg-avatar user-avatar" src="use.svg" alt="Você" />
    </div>
  `
  chat.scrollTop = chat.scrollHeight
}

function option(text) {
  let options = document.getElementById("options")
  let btn = document.createElement("button")
  btn.className = "option"
  btn.innerText = text
  btn.onclick = () => {
    user(text)
    generateResponse(text)
  }
  options.appendChild(btn)
}

function clearOptions() {
  document.getElementById("options").innerHTML = ""
}

function feedbackAfterAnswer(step, value) {
  const feedbacks = {
    treinos: {
      "0": "Obrigada por contar. Semana corrida acontece, e o importante é a gente estar aqui. Cada semana é uma nova chance para você se tornar mais saudável e forte.",
      "1-2": "Cada treino conta. Você se movimentou e isso já é um passo importante. Vamos ver como você está se sentindo em outros pilares.",
      "3-4": "Que consistência! Mostra que você está priorizando você. Isso faz toda diferença no longo prazo.",
      "5+": "Que semana! Você mandou bem. Agora vamos ver se o corpo e a cabeça estão acompanhando."
    },
    energia: {
      "Alta": "Que bom ouvir isso! Energia em dia é sinal de que treino, sono e alimentação estão em equilíbrio. Vamos manter.",
      "Média": "Tudo bem. Nem todo dia a gente acorda no pico, o que importa é você ter ido e se escutado.",
      "Baixa": "Entendo. Quando a energia cai, o corpo pode estar pedindo mais recuperação ou nutrição. Vamos olhar isso juntas. O importante é você estar aqui."
    },
    dores: {
      "Nenhuma": "Ótimo! Corpo respondendo bem. Continuar alimentando -se bem e se hidratando ajuda a manter assim.",
      "Pouca": "Pouca dor pode ser só o corpo se adaptando. Fique de olho e não ignore se aumentar.",
      "Moderada": "Vamos respeitar o corpo. Às vezes um dia de treino mais leve ou foco em mobilidade faz mais pela evolução do que forçar.",
      "Muita": "Sua saúde vem primeiro. Vale pausar o que dói e, se precisar, falar comigo. Estou aqui no que for preciso para ajustarmos"
    },
    alimentacao: {
      "Muito boa e consistente": "Isso é base de tudo! Alimentação em dia potencializa treino e recuperação. Parabéns!",
      "Boa na maior parte": "Bom ritmo. Pequenos ajustes já fazem diferença  e não precisa ser perfeito todo dia.",
      "Irregular": "Acontece. Que tal escolher uma coisa só para a próxima semana? Por exemplo: proteína no almoço ou um lanche antes do treino.",
      "Muito difícil": "Obrigada por ser sincera. A gente pode ir de um passo de cada vez. O que parece mais possível mudar primeiro?"
    },
    sono: {
      "Dormindo bem": "Sono em dia é metade do resultado. Corpo recupera, hormônios regulam. Continua assim.",
      "Mais ou menos": "Sono irregular atrapalha recuperação e disposição. Que tal tentar um horário fixo para dormir essa semana?",
      "Poucas horas": "Pouco sono pesa em tudo: energia, fome, estresse. Priorizar uma noite mais longa já ajuda.",
      "Muito ruim": "Sono muito ruim merece atenção. Além de ajustar treino, vale anotar o que te acorda e, se precisar, buscar apoio."
    },
    estresse: {
      "Baixo": "Que alívio! Cabeça tranquila ajuda no treino e na recuperação.",
      "Moderado": "Normal. O movimento pode ser uma válvula de escape, treinar com consciência ajuda a aliviar o estresse.",
      "Alto": "Estresse alto pede cuidado: treinos muito intensos podem somar. Às vezes menos é mais. Estou aqui.",
      "Muito alto": "Sua saúde mental vem em primeiro lugar. Treino leve, respiração e descanso podem ajudar mais que forçar."
    },
    obstaculo: {
      "Falta de tempo": "Tempo é difícil para todo mundo. Vamos pensar em treinos curtos e objetivos que cabem no seu dia.",
      "Cansaço": "Recuperação faz parte do processo. Às vezes o corpo pede menos volume e mais sono. Respeitar isso é treino inteligente.",
      "Desmotivação": "Acontece, e não é falha sua. Lembra do seu porquê? Eu acredito em você e estou aqui para o que precisar.",
      "Nada, está fluindo": "Que bom! Sinal de que está encaixando na sua rotina. Vamos celebrar e seguir."
    },
    evolucao: {
      "Sim, senti evolução": "Amei saber! Você está no caminho. Continua assim e comemora cada conquista.",
      "Mais ou menos": "Evolução não é linear. O que importa é você estar nesse processo. Os resultados vêm.",
      "Ainda não": "Tudo no tempo certo. Constância e paciência com o corpo trazem resultado. Você está fazendo a sua parte."
    }
  }
  const stepObj = feedbacks[step]
  return stepObj && stepObj[value] ? stepObj[value] : ""
}

function nextQuestion() {
  clearOptions()
  updateProgressBar()
  if (currentStep === "treinos") {
    bot("Como foi sua energia durante os treinos? Você se sentiu disposta ou sentiu que estava arrastando?", { typing: true })
    option("Alta")
    option("Média")
    option("Baixa")
  } else if (currentStep === "energia") {
    bot("Você sentiu alguma dor ou desconforto essa semana, muscular ou articular? É importante a gente saber para ajustar se precisar.", { typing: true })
    option("Nenhuma")
    option("Pouca")
    option("Moderada")
    option("Muita")
  } else if (currentStep === "dores") {
    bot("Como está sua alimentação esta semana? Não precisa ser perfeita quero saber como você está se sentindo em relação à comida.", { typing: true })
    option("Muito boa e consistente")
    option("Boa na maior parte")
    option("Irregular")
    option("Muito difícil")
  } else if (currentStep === "alimentacao") {
    bot("E o sono? Como você está dormindo? O Sono impacta na energia, recuperação e até a fome.", { typing: true })
    option("Dormindo bem")
    option("Mais ou menos")
    option("Poucas horas")
    option("Muito ruim")
  } else if (currentStep === "sono") {
    bot("Como está seu nível de estresse? Trabalho, rotina, tudo conta e o corpo sente.", { typing: true })
    option("Baixo")
    option("Moderado")
    option("Alto")
    option("Muito alto")
  } else if (currentStep === "estresse") {
    bot("O que mais atrapalhou ou te ajudou essa semana? Pode ser tempo, cansaço, motivação… ou dizer que está fluindo.", { typing: true })
    option("Falta de tempo")
    option("Cansaço")
    option("Desmotivação")
    option("Nada, está fluindo")
  } else if (currentStep === "obstaculo") {
    bot("Por último: você sentiu alguma evolução ou progresso em força, disposição ou no corpo? Tudo conta.", { typing: true })
    option("Sim, senti evolução")
    option("Mais ou menos")
    option("Ainda não")
  } else if (currentStep === "evolucao") {
    showSupport()
  }
}

function showSupport() {
  bot("Obrigada por ter aberto o jogo comigo. Cada resposta que você deu me ajuda a te apoiar melhor.", { typing: true })
  setTimeout(() => {
    let msg = ""

    if (respostas.treinos === "0") {
      msg += "Sobre os treinos: que tal a gente pensar em retomar com calma? Um treino na semana já é um passo importante sem pressão. "
    } else if (respostas.treinos === "1-2") {
      msg += "Você já está no jogo. Que tal a gente ver se dá para manter ou subir um pouquinho na próxima semana, sempre respeitando como você está. "
    } else if (respostas.treinos === "3-4" || respostas.treinos === "5+") {
      msg += "Sua consistência está linda. Continua assim, sempre ouvindo o corpo. "
    }

    if (respostas.energia && respostas.energia.includes("Baixa")) {
      msg += "Como a energia estava baixa, priorize sono e alimentação, seu o corpo agradece e o treino rende mais. "
    }

    if (respostas.dores === "Moderada" || respostas.dores === "Muita") {
      msg += "Sobre as dores: não force. Treinos mais leves ou foco em mobilidade podem ser o melhor agora. Se persistir, vale checar com um profissional. "
    }

    if (respostas.alimentacao === "Irregular" || respostas.alimentacao === "Muito difícil") {
      msg += "A alimentação faz diferença em tudo. A gente pode ir ajustando um passo de cada vez, o que for possível para você. "
    }

    if (respostas.sono === "Poucas horas" || respostas.sono === "Muito ruim") {
      msg += "O sono é sua base. Tenta um horário mais fixo para dormir e um ambiente tranquilo. Sua recuperação depende disso. "
    }

    if (respostas.estresse === "Alto" || respostas.estresse === "Muito alto") {
      msg += "Com o estresse em alta, treinos um pouco mais leves e momentos de respiração podem te fazer mais bem do que forçar. "
    }

    if (respostas.obstaculo === "Cansaço") {
      msg += "Recuperação em primeiro lugar, combinado? Às vezes menos é mais. "
    }
    if (respostas.obstaculo === "Desmotivação") {
      msg += "Lembra do motivo que te fez começar — e eu tô aqui no que precisar. Você consegue. "
    }

    msg += "Qualquer dúvida ou se quiser conversar de novo, é só chamar. Estamos juntas nisso."
    bot(msg, { typing: true })
    setTimeout(() => {
      updateProgressBar(8)
      showConclusionCard()
    }, 1700)
  }, 700)
}

function getMetricScore(step, value) {
  if (!value) return { pct: 0, status: "empty" }
  const maps = {
    treinos: { "0": 15, "1-2": 40, "3-4": 80, "5+": 100 },
    energia: { "Alta": 100, "Média": 60, "Baixa": 25 },
    dores: { "Nenhuma": 100, "Pouca": 75, "Moderada": 40, "Muita": 15 },
    alimentacao: { "Muito boa e consistente": 100, "Boa na maior parte": 70, "Irregular": 40, "Muito difícil": 15 },
    sono: { "Dormindo bem": 100, "Mais ou menos": 55, "Poucas horas": 35, "Muito ruim": 15 },
    estresse: { "Baixo": 100, "Moderado": 65, "Alto": 35, "Muito alto": 15 },
    obstaculo: { "Nada, está fluindo": 100, "Falta de tempo": 55, "Cansaço": 40, "Desmotivação": 30 },
    evolucao: { "Sim, senti evolução": 100, "Mais ou menos": 50, "Ainda não": 25 }
  }
  const pct = maps[step] && maps[step][value] != null ? maps[step][value] : 50
  const status = pct >= 70 ? "ok" : pct >= 40 ? "warn" : "alert"
  return { pct, status }
}

function getPriorities() {
  const p = []
  if (respostas.treinos === "0") p.push("Retomar treinos com calma")
  if (respostas.energia === "Baixa") p.push("Energia baixa — priorizar sono e alimentação")
  if (respostas.dores === "Moderada" || respostas.dores === "Muita") p.push("Dores — considerar treinos leves ou mobilidade")
  if (respostas.alimentacao === "Irregular" || respostas.alimentacao === "Muito difícil") p.push("Ajustar alimentação aos poucos")
  if (respostas.sono === "Poucas horas" || respostas.sono === "Muito ruim") p.push("Melhorar rotina de sono")
  if (respostas.estresse === "Alto" || respostas.estresse === "Muito alto") p.push("Estresse alto — treinos leves e respiração")
  if (respostas.obstaculo === "Cansaço") p.push("Priorizar recuperação")
  if (respostas.obstaculo === "Desmotivação") p.push("Apoio na motivação")
  if (respostas.evolucao === "Ainda não") p.push("Reforçar constância e paciência")
  return p
}

function getClientSummary() {
  const highlights = []
  if (respostas.treinos && respostas.treinos !== "0") highlights.push(`Você fez ${respostas.treinos} treinos esta semana.`)
  if (respostas.energia === "Alta") highlights.push("Energia em dia!")
  if (respostas.evolucao === "Sim, senti evolução") highlights.push("Você sentiu evolução — que bom!")
  if (respostas.obstaculo === "Nada, está fluindo") highlights.push("Tudo fluindo.")
  const intro = highlights.length ? highlights.join(" ") : "Obrigada por compartilhar tudo comigo."
  return intro + " Recebi suas respostas e em breve entrarei em contato com um feedback personalizado. Cada passo conta — você está aqui e isso é o que importa."
}

function buildReportEmailBody(clientName) {
  const metrics = [
    { key: "treinos", label: "Treinos", value: respostas.treinos ? respostas.treinos + " treinos" : "" },
    { key: "energia", label: "Energia", value: respostas.energia },
    { key: "dores", label: "Dores", value: respostas.dores },
    { key: "alimentacao", label: "Alimentação", value: respostas.alimentacao },
    { key: "sono", label: "Sono", value: respostas.sono },
    { key: "estresse", label: "Estresse", value: respostas.estresse },
    { key: "obstaculo", label: "Obstáculo", value: respostas.obstaculo },
    { key: "evolucao", label: "Evolução", value: respostas.evolucao }
  ]
  const priorities = getPriorities()
  let body = "<h2>Relatório de Check-in BIA</h2>"
  body += "<p><strong>Aluna:</strong> " + (clientName || "Não informado") + "</p>"
  body += "<p><strong>Data:</strong> " + new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) + "</p>"
  if (respostas.observacao) body += "<p><strong>Observação:</strong> " + respostas.observacao + "</p>"
  body += "<h3>Respostas</h3><ul>"
  metrics.filter(m => m.value).forEach(m => {
    const { pct, status } = getMetricScore(m.key, m.value)
    const emoji = status === "ok" ? "✓" : status === "warn" ? "!" : "⚠"
    body += "<li><strong>" + m.label + ":</strong> " + m.value + " (" + emoji + ")</li>"
  })
  body += "</ul>"
  if (priorities.length) {
    body += "<h3>Prioridades</h3><ul>"
    priorities.forEach(p => body += "<li>" + p + "</li>")
    body += "</ul>"
  } else {
    body += "<p><em>Nenhum alerta crítico. Manter acompanhamento.</em></p>"
  }
  return body
}

function buildReportHtml() {
  const metrics = [
    { key: "treinos", label: "Treinos", value: respostas.treinos ? respostas.treinos + " treinos" : "" },
    { key: "energia", label: "Energia", value: respostas.energia },
    { key: "dores", label: "Dores", value: respostas.dores },
    { key: "alimentacao", label: "Alimentação", value: respostas.alimentacao },
    { key: "sono", label: "Sono", value: respostas.sono },
    { key: "estresse", label: "Estresse", value: respostas.estresse },
    { key: "obstaculo", label: "Obstáculo", value: respostas.obstaculo },
    { key: "evolucao", label: "Evolução", value: respostas.evolucao }
  ]
  const priorities = getPriorities()
  const barsHtml = metrics.filter(m => m.value).map(m => {
    const { pct, status } = getMetricScore(m.key, m.value)
    return `<div class="report-row"><span class="report-label">${m.label}</span><div class="report-bar-wrap"><div class="report-bar ${status}" style="width:${pct}%"></div></div><span class="report-value">${m.value}</span></div>`
  }).join("")
  const prioritiesHtml = priorities.length
    ? `<div class="report-priorities"><strong>Prioridades para o personal:</strong><ul>${priorities.map(x => `<li>${x}</li>`).join("")}</ul></div>`
    : `<div class="report-priorities ok"><em>Nenhum alerta crítico. Manter acompanhamento.</em></div>`
  return `
    <div class="report-card" id="reportCard">
      <h3 class="report-title">Relatório de Check-in</h3>
      <p class="report-date">${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
      <div class="report-bars">${barsHtml}</div>
      ${prioritiesHtml}
    </div>
  `
}

function showConclusionCard() {
  const summary = getClientSummary()
  chat.innerHTML += `
    <div class="msg-row bot">
      <img class="msg-avatar" src="avatar.svg" alt="BIA" />
      <div class="msg bot conclusion-card-wrap">
        <div class="conclusion-card conclusion-client">
          <p class="conclusion-title">Check-in concluído!</p>
          <p class="conclusion-summary-text">${summary}</p>
          <label class="conclusion-name-label">Seu nome:</label>
          <input type="text" id="clientNameInput" class="conclusion-name-input" placeholder="Ex: Maria Silva" oninput="toggleSendButton()" onkeydown="if(event.key==='Enter'){event.preventDefault();var n=(document.getElementById('clientNameInput').value||'').trim();if(n)sendReportToPersonal();}" />
          <label class="conclusion-name-label">Observação (opcional):</label>
          <input type="text" id="observationInput" class="conclusion-name-input" placeholder="Quer contar algo da sua semana?" onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('clientNameInput').focus();}" />
          <button type="button" class="btn-send-report" id="btnSendReport" disabled onclick="sendReportToPersonal()">Enviar relatório para minha personal</button>
          <p class="conclusion-hint" id="conclusionHint">O relatório será enviado direto para sua personal por e-mail.</p>
          <button type="button" class="btn-restart" onclick="restartChat()">Fazer novo check-in</button>
        </div>
      </div>
    </div>
  `
  chat.scrollTop = chat.scrollHeight
}

function toggleSendButton() {
  const input = document.getElementById("clientNameInput")
  const btn = document.getElementById("btnSendReport")
  if (input && btn) btn.disabled = !(input.value || "").trim()
}

function sendReportToPersonal() {
  const btn = document.getElementById("btnSendReport")
  if (!btn || btn.textContent === "Enviando...") return
  const clientName = (document.getElementById("clientNameInput")?.value || "").trim()
  const observation = (document.getElementById("observationInput")?.value || "").trim()
  if (!clientName) {
    alert("Por favor, digite seu nome antes de enviar.")
    return
  }
  respostas.observacao = observation
  btn.disabled = true
  btn.textContent = "Enviando..."
  fetch("/api/send-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      report_content: buildReportEmailBody(clientName),
      clientName,
      date: new Date().toLocaleDateString("pt-BR")
    })
  }).then(r => {
    if (r.ok) {
      btn.textContent = "Relatório enviado!"
      const hint = document.getElementById("conclusionHint")
      if (hint) hint.textContent = "Sua personal receberá o relatório por e-mail em instantes."
    } else throw new Error()
  }).catch(() => {
    btn.disabled = false
    btn.textContent = "Enviar relatório para minha personal"
    alert("Não foi possível enviar. Verifique se o app está no Vercel com as variáveis configuradas.")
  })
}

function generateResponse(text) {
  clearOptions()

  if (currentStep === "treinos") {
    respostas.treinos = text
    if (text === "0") bot("Tudo bem. Às vezes a semana fica corrida o importante é a gente estar aqui.", { typing: true })
    else if (text === "1-2") bot("Cada treino conta. Você está no jogo.", { typing: true })
    else if (text === "3-4") bot("Excelente consistência!", { typing: true })
    else if (text === "5+") bot("Que semana! Você mandou bem.", { typing: true })
    currentStep = "energia"
    setTimeout(() => {
      const f = feedbackAfterAnswer("treinos", text)
      if (f) bot(f, { typing: true })
      setTimeout(nextQuestion, f ? 1400 : 600)
    }, 1300)
  } else if (currentStep === "energia") {
    respostas.energia = text
    const f = feedbackAfterAnswer("energia", text)
    if (f) bot(f, { typing: true })
    currentStep = "dores"
    setTimeout(nextQuestion, 1400)
  } else if (currentStep === "dores") {
    respostas.dores = text
    const f = feedbackAfterAnswer("dores", text)
    if (f) bot(f, { typing: true })
    currentStep = "alimentacao"
    setTimeout(nextQuestion, 1400)
  } else if (currentStep === "alimentacao") {
    respostas.alimentacao = text
    const f = feedbackAfterAnswer("alimentacao", text)
    if (f) bot(f, { typing: true })
    currentStep = "sono"
    setTimeout(nextQuestion, 1400)
  } else if (currentStep === "sono") {
    respostas.sono = text
    const f = feedbackAfterAnswer("sono", text)
    if (f) bot(f, { typing: true })
    currentStep = "estresse"
    setTimeout(nextQuestion, 1400)
  } else if (currentStep === "estresse") {
    respostas.estresse = text
    const f = feedbackAfterAnswer("estresse", text)
    if (f) bot(f, { typing: true })
    currentStep = "obstaculo"
    setTimeout(nextQuestion, 1400)
  } else if (currentStep === "obstaculo") {
    respostas.obstaculo = text
    const f = feedbackAfterAnswer("obstaculo", text)
    if (f) bot(f, { typing: true })
    currentStep = "evolucao"
    setTimeout(nextQuestion, 1400)
  } else if (currentStep === "evolucao") {
    respostas.evolucao = text
    currentStep = "done"
    updateProgressBar(8)
    const f = feedbackAfterAnswer("evolucao", text)
    if (f) bot(f, { typing: true })
    setTimeout(showSupport, 1400)
  }
}

function sendMessage() {}

function restartChat() {
  chat.innerHTML = ""
  document.getElementById("options").innerHTML = ""
  respostas = { treinos: "", energia: "", dores: "", alimentacao: "", sono: "", estresse: "", obstaculo: "", evolucao: "", observacao: "" }
  currentStep = "treinos"
  updateProgressBar(0)
  start()
}

function start() {
  updateProgressBar()
  bot("Oi! Que bom você estar aqui.", { typing: true })
  setTimeout(() => {
    bot("Vou te fazer um check-in completo sobre como foi sua semana: rotina de treinos, como você está se sentindo, dores, alimentação, sono e estresse. Pode responder com calma e sinceridade, não tem resposta errada. Tudo que você disser me ajuda a te apoiar e motivar melhor.", { typing: true })
  }, 1300)
  setTimeout(() => {
    bot("Para começar: quantos treinos você conseguiu fazer essa semana?", { typing: true })
    setTimeout(() => {
      option("0")
      option("1-2")
      option("3-4")
      option("5+")
    }, 1200)
  }, 2600)
}

start()
