let chat = document.getElementById("chat")
let respostas = {
  treinos: "",
  energia: "",
  dores: "",
  alimentacao: "",
  sono: "",
  estresse: "",
  obstaculo: "",
  evolucao: ""
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
    chat.innerHTML += `
      <div class="msg-row bot" id="${typingId}">
        <img class="msg-avatar" src="avatar.svg" alt="BIA" />
        <div class="msg bot typing-msg">
          <div class="typing-indicator">
            <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
          </div>
        </div>
      </div>
    `
    chat.scrollTop = chat.scrollHeight
    setTimeout(() => {
      const el = document.getElementById(typingId)
      if (el) el.remove()
      bot(msg)
    }, 900)
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
      <img class="msg-avatar user-avatar" src="user-avatar.svg" alt="Você" />
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
      "0": "Obrigada por contar. Semana corrida acontece, e o importante é a gente estar aqui. Cada semana é uma nova chance — sem julgamento.",
      "1-2": "Cada treino conta. Você se movimentou e isso já é um passo importante. Vamos ver como você está se sentindo em outros pilares.",
      "3-4": "Que consistência! Mostra que você está priorizando você. Isso faz toda diferença no longo prazo.",
      "5+": "Que semana! Você mandou bem. Agora vamos ver se o corpo e a cabeça estão acompanhando."
    },
    energia: {
      "Alta": "Que bom ouvir isso! Energia em dia é sinal de que treino, sono e alimentação estão se conversando. Vamos manter.",
      "Média": "Tudo bem. Nem todo dia a gente acorda no pico — o que importa é você ter ido e se escutado.",
      "Baixa": "Entendo. Quando a energia cai, o corpo pode estar pedindo mais recuperação ou nutrição. Vamos olhar isso juntas."
    },
    dores: {
      "Nenhuma": "Ótimo! Corpo respondendo bem. Continuar alongando e se hidratando ajuda a manter assim.",
      "Pouca": "Pouca dor pode ser só o corpo se adaptando. Fique de olho e não ignore se aumentar.",
      "Moderada": "Vamos respeitar o corpo. Às vezes um dia de treino mais leve ou foco em mobilidade faz mais pela evolução do que forçar.",
      "Muita": "Sua saúde vem primeiro. Vale pausar o que dói e, se precisar, falar com um profissional. Estou aqui no que for."
    },
    alimentacao: {
      "Muito boa e consistente": "Isso é base de tudo! Alimentação em dia potencializa treino e recuperação. Parabéns.",
      "Boa na maior parte": "Bom ritmo. Pequenos ajustes já fazem diferença — e não precisa ser perfeito todo dia.",
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
      "Moderado": "Normal. O movimento pode ser uma válvula de escape — treinar com consciência ajuda a aliviar.",
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
    bot("Como foi sua energia durante os treinos? Você se sentiu disposta ou sentiu que estava arrastando?")
    option("Alta")
    option("Média")
    option("Baixa")
  } else if (currentStep === "energia") {
    bot("Você sentiu alguma dor ou desconforto essa semana — muscular ou articular? É importante a gente saber para ajustar se precisar.")
    option("Nenhuma")
    option("Pouca")
    option("Moderada")
    option("Muita")
  } else if (currentStep === "dores") {
    bot("Como está sua alimentação esta semana? Não precisa ser perfeita — quero saber como você está se sentindo em relação à comida.")
    option("Muito boa e consistente")
    option("Boa na maior parte")
    option("Irregular")
    option("Muito difícil")
  } else if (currentStep === "alimentacao") {
    bot("E o sono? Como você está dormindo? Sono impacta energia, recuperação e até a fome.")
    option("Dormindo bem")
    option("Mais ou menos")
    option("Poucas horas")
    option("Muito ruim")
  } else if (currentStep === "sono") {
    bot("Como está seu nível de estresse? Trabalho, rotina, tudo conta — e o corpo sente.")
    option("Baixo")
    option("Moderado")
    option("Alto")
    option("Muito alto")
  } else if (currentStep === "estresse") {
    bot("O que mais atrapalhou ou te ajudou essa semana? Pode ser tempo, cansaço, motivação… ou dizer que está fluindo.")
    option("Falta de tempo")
    option("Cansaço")
    option("Desmotivação")
    option("Nada, está fluindo")
  } else if (currentStep === "obstaculo") {
    bot("Por último: você sentiu alguma evolução ou progresso — em força, disposição ou no corpo? Tudo conta.")
    option("Sim, senti evolução")
    option("Mais ou menos")
    option("Ainda não")
  } else if (currentStep === "evolucao") {
    showSupport()
  }
}

function showSupport() {
  bot("Obrigada por ter aberto o jogo comigo. Cada resposta que você deu me ajuda a te apoiar melhor.")
  setTimeout(() => {
    let msg = ""

    if (respostas.treinos === "0") {
      msg += "Sobre os treinos: que tal a gente pensar em retomar com calma? Um treino na semana já é um passo importante — sem pressão. "
    } else if (respostas.treinos === "1-2") {
      msg += "Você já está no jogo. Que tal a gente ver se dá para manter ou subir um pouquinho na próxima semana, sempre respeitando como você está. "
    } else if (respostas.treinos === "3-4" || respostas.treinos === "5+") {
      msg += "Sua consistência está linda. Continua assim, sempre ouvindo o corpo. "
    }

    if (respostas.energia && respostas.energia.includes("Baixa")) {
      msg += "Como a energia estava baixa, priorize sono e alimentação — o corpo agradece e o treino rende mais. "
    }

    if (respostas.dores === "Moderada" || respostas.dores === "Muita") {
      msg += "Sobre as dores: não force. Treinos mais leves ou foco em mobilidade podem ser o melhor agora. Se persistir, vale checar com um profissional. "
    }

    if (respostas.alimentacao === "Irregular" || respostas.alimentacao === "Muito difícil") {
      msg += "A alimentação faz diferença em tudo. A gente pode ir ajustando um passo de cada vez — o que for possível para você. "
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
    bot(msg)
    setTimeout(() => {
      updateProgressBar(8)
      showConclusionCard()
    }, 500)
  }, 700)
}

function showConclusionCard() {
  const items = []
  if (respostas.treinos) items.push({ label: respostas.treinos + " treinos" })
  if (respostas.energia) items.push({ label: respostas.energia })
  if (respostas.alimentacao) items.push({ label: respostas.alimentacao })
  if (respostas.sono) items.push({ label: respostas.sono })
  if (respostas.estresse) items.push({ label: respostas.estresse })
  const html = items.map(i => `<div class="conclusion-item"><span>${i.label}</span></div>`).join("")
  chat.innerHTML += `
    <div class="msg-row bot">
      <img class="msg-avatar" src="avatar.svg" alt="BIA" />
      <div class="msg bot conclusion-card-wrap">
        <div class="conclusion-card">
          <p class="conclusion-title">Check-in concluído!</p>
          <div class="conclusion-summary">${html}</div>
        </div>
      </div>
    </div>
  `
  chat.scrollTop = chat.scrollHeight
}

function generateResponse(text) {
  clearOptions()

  if (currentStep === "treinos") {
    respostas.treinos = text
    if (text === "0") bot("Tudo bem. Às vezes a semana fica corrida — o importante é a gente estar aqui.")
    else if (text === "1-2") bot("Cada treino conta. Você está no jogo.")
    else if (text === "3-4") bot("Excelente consistência!")
    else if (text === "5+") bot("Que semana! Você mandou bem.")
    currentStep = "energia"
    setTimeout(() => {
      const f = feedbackAfterAnswer("treinos", text)
      if (f) bot(f, { typing: true })
      setTimeout(nextQuestion, f ? 1200 : 600)
    }, 800)
  } else if (currentStep === "energia") {
    respostas.energia = text
    const f = feedbackAfterAnswer("energia", text)
    if (f) bot(f, { typing: true })
    currentStep = "dores"
    setTimeout(nextQuestion, 1200)
  } else if (currentStep === "dores") {
    respostas.dores = text
    const f = feedbackAfterAnswer("dores", text)
    if (f) bot(f, { typing: true })
    currentStep = "alimentacao"
    setTimeout(nextQuestion, 1200)
  } else if (currentStep === "alimentacao") {
    respostas.alimentacao = text
    const f = feedbackAfterAnswer("alimentacao", text)
    if (f) bot(f, { typing: true })
    currentStep = "sono"
    setTimeout(nextQuestion, 1200)
  } else if (currentStep === "sono") {
    respostas.sono = text
    const f = feedbackAfterAnswer("sono", text)
    if (f) bot(f, { typing: true })
    currentStep = "estresse"
    setTimeout(nextQuestion, 1200)
  } else if (currentStep === "estresse") {
    respostas.estresse = text
    const f = feedbackAfterAnswer("estresse", text)
    if (f) bot(f, { typing: true })
    currentStep = "obstaculo"
    setTimeout(nextQuestion, 1200)
  } else if (currentStep === "obstaculo") {
    respostas.obstaculo = text
    const f = feedbackAfterAnswer("obstaculo", text)
    if (f) bot(f, { typing: true })
    currentStep = "evolucao"
    setTimeout(nextQuestion, 1200)
  } else if (currentStep === "evolucao") {
    respostas.evolucao = text
    currentStep = "done"
    updateProgressBar(8)
    const f = feedbackAfterAnswer("evolucao", text)
    if (f) bot(f, { typing: true })
    setTimeout(showSupport, 1200)
  }
}

function sendMessage() {
  let input = document.getElementById("input")
  let text = (input.value || "").trim()
  if (text === "") return
  user(text)
  generateResponse(text)
  input.value = ""
}

function start() {
  updateProgressBar()
  bot("Oi! Que bom você estar aqui.")
  bot("Vou te fazer um check-in completo sobre como foi sua semana: rotina de treinos, como você está se sentindo, dores, alimentação, sono e estresse. Pode responder com calma e sinceridade — não tem resposta errada. Tudo que você disser me ajuda a te apoiar e motivar melhor.")
  setTimeout(() => {
    bot("Para começar: quantos treinos você conseguiu fazer essa semana?")
    option("0")
    option("1-2")
    option("3-4")
    option("5+")
  }, 1000)
}

start()
