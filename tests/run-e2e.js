#!/usr/bin/env node
/* ==========================================================================
   Teste ponta a ponta da Feira Mundo Maker — sem dependências externas.

   - Sobe um servidor estático próprio (Node http) em 127.0.0.1.
   - Abre o Chrome/Edge headless via CDP (WebSocket nativo do Node 22+).
   - Testa os fluxos principais, coleta erros de console/rede e gera
     screenshots + PDF de impressão em tests/artifacts/.
   - Uso: node tests/run-e2e.js   (CHROME_PATH opcional)
   ========================================================================== */
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const ARTEFATOS = path.join(RAIZ, "tests", "artifacts");
const PERFIL = path.join(RAIZ, ".tmp", "chrome-e2e-" + Date.now());
const pausa = function (ms) { return new Promise(function (resolver) { setTimeout(resolver, ms); }); };

const falhas = [];

function garantir(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem);
}

async function teste(nome, funcao) {
  try {
    await funcao();
    console.log("✔ " + nome);
  } catch (erro) {
    falhas.push(nome + ": " + erro.message);
    console.error("✖ " + nome + " — " + erro.message);
  }
}

/* --------------------------------------------------------------------------
   Servidor estático
   -------------------------------------------------------------------------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf"
};

function criarServidor() {
  return http.createServer(function (requisicao, resposta) {
    try {
      let caminho = decodeURIComponent((requisicao.url || "/").split("?")[0]);
      if (caminho === "/") caminho = "/index.html";
      const absoluto = path.resolve(RAIZ, "." + caminho);
      const raizNormalizada = RAIZ.toLowerCase() + path.sep;
      if (!absoluto.toLowerCase().startsWith(raizNormalizada)) {
        resposta.writeHead(403);
        resposta.end("Proibido");
        return;
      }
      if (!fs.existsSync(absoluto) || !fs.statSync(absoluto).isFile()) {
        resposta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        resposta.end("Não encontrado");
        return;
      }
      const extensao = path.extname(absoluto).toLowerCase();
      resposta.writeHead(200, {
        "Content-Type": MIME[extensao] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      fs.createReadStream(absoluto).pipe(resposta);
    } catch (erro) {
      resposta.writeHead(500);
      resposta.end("Erro interno");
    }
  });
}

/* --------------------------------------------------------------------------
   Navegador + CDP
   -------------------------------------------------------------------------- */
function encontrarNavegador() {
  const candidatos = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ].filter(Boolean);
  return candidatos.find(function (caminho) { return fs.existsSync(caminho); }) || null;
}

async function esperarArquivo(arquivo, limiteMs) {
  const inicio = Date.now();
  while (Date.now() - inicio < limiteMs) {
    if (fs.existsSync(arquivo)) return true;
    await pausa(150);
  }
  return false;
}

async function esperarHttp(url, limiteMs) {
  const inicio = Date.now();
  while (Date.now() - inicio < limiteMs) {
    try {
      const resposta = await fetch(url);
      if (resposta.ok) return await resposta.json();
    } catch (erro) { /* ainda subindo */ }
    await pausa(200);
  }
  throw new Error("O navegador não abriu a porta de depuração a tempo.");
}

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pendentes = new Map();
    this.ouvintes = new Set();
    socket.addEventListener("message", (evento) => {
      let mensagem;
      try { mensagem = JSON.parse(String(evento.data)); } catch (erro) { return; }
      if (mensagem.id && this.pendentes.has(mensagem.id)) {
        const pendente = this.pendentes.get(mensagem.id);
        this.pendentes.delete(mensagem.id);
        clearTimeout(pendente.timer);
        if (mensagem.error) pendente.rejeitar(new Error(mensagem.error.message || "Erro CDP"));
        else pendente.resolver(mensagem.result);
        return;
      }
      this.ouvintes.forEach(function (ouvinte) {
        try { ouvinte(mensagem); } catch (erro) { /* ignora */ }
      });
    });
  }

  static conectar(url) {
    return new Promise(function (resolver, rejeitar) {
      const socket = new WebSocket(url);
      const timer = setTimeout(function () {
        try { socket.close(); } catch (erro) { /* ignora */ }
        rejeitar(new Error("Timeout ao conectar no CDP."));
      }, 15000);
      socket.addEventListener("open", function () {
        clearTimeout(timer);
        resolver(new CDP(socket));
      });
      socket.addEventListener("error", function () {
        clearTimeout(timer);
        rejeitar(new Error("Falha ao conectar no CDP."));
      });
    });
  }

  enviar(metodo, parametros) {
    const self = this;
    return new Promise(function (resolver, rejeitar) {
      const id = ++self.id;
      const timer = setTimeout(function () {
        self.pendentes.delete(id);
        rejeitar(new Error("Timeout no comando CDP: " + metodo));
      }, 30000);
      self.pendentes.set(id, { resolver: resolver, rejeitar: rejeitar, timer: timer });
      self.socket.send(JSON.stringify({ id: id, method: metodo, params: parametros || {} }));
    });
  }

  aoReceber(ouvinte) {
    this.ouvintes.add(ouvinte);
    const self = this;
    return function () { self.ouvintes.delete(ouvinte); };
  }

  fechar() {
    try { this.socket.close(); } catch (erro) { /* ignora */ }
  }
}

async function abrirPagina(url) {
  const lista = await esperarHttp("http://127.0.0.1:" + global.paginaPorta + "/json/list", 10000);
  const alvo = (lista || []).find(function (item) { return item.type === "page"; });
  if (!alvo) throw new Error("Nenhuma página aberta no navegador.");
  const conexao = await CDP.conectar(alvo.webSocketDebuggerUrl);
  const errosConsole = [];
  const requisicoesExternas = [];

  conexao.aoReceber(function (mensagem) {
    if (mensagem.method === "Runtime.exceptionThrown") {
      const detalhes = mensagem.params.exceptionDetails;
      const descricao = (detalhes.exception && (detalhes.exception.description || detalhes.exception.value)) || detalhes.text || "Exceção";
      errosConsole.push(String(descricao));
    }
    if (mensagem.method === "Log.entryAdded") {
      const entrada = mensagem.params.entry;
      if (entrada.level === "error") {
        const texto = entrada.text || "";
        const origem = entrada.url || "";
        if (origem.indexOf(".well-known") === -1 && origem.indexOf("devtools") === -1) {
          errosConsole.push(texto);
        }
      }
    }
    if (mensagem.method === "Network.requestWillBeSent") {
      const alvoUrl = mensagem.params.request.url;
      if (/^https?:/i.test(alvoUrl) && alvoUrl.indexOf(url) !== 0) requisicoesExternas.push(alvoUrl);
    }
  });

  await conexao.enviar("Page.enable");
  await conexao.enviar("Runtime.enable");
  await conexao.enviar("Log.enable");
  await conexao.enviar("Network.enable");
  await conexao.enviar("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }]
  });
  await conexao.enviar("Page.navigate", { url: url });

  return { cdp: conexao, errosConsole: errosConsole, requisicoesExternas: requisicoesExternas };
}

/* --------------------------------------------------------------------------
   Helpers de página
   -------------------------------------------------------------------------- */
let pagina = null;

async function avaliar(expressao) {
  const resposta = await pagina.cdp.enviar("Runtime.evaluate", {
    expression: expressao,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (resposta.exceptionDetails) {
    const detalhes = resposta.exceptionDetails;
    throw new Error((detalhes.exception && detalhes.exception.description) || detalhes.text || "Erro ao avaliar expressão.");
  }
  return resposta.result ? resposta.result.value : undefined;
}

async function esperar(expressao, limiteMs, intervaloMs) {
  const limite = limiteMs || 8000;
  const intervalo = intervaloMs || 120;
  const inicio = Date.now();
  let ultimoErro = null;
  while (Date.now() - inicio < limite) {
    try {
      const valor = await avaliar(expressao);
      if (valor) return valor;
    } catch (erro) {
      ultimoErro = erro;
    }
    await pausa(intervalo);
  }
  throw new Error("Timeout esperando: " + expressao + (ultimoErro ? " (" + ultimoErro.message + ")" : ""));
}

const EXPRESSAO_PRONTO = "(() => document.readyState === 'complete' && " +
  "document.querySelectorAll('#deck-abas .deck-aba').length === 5 && " +
  "document.querySelectorAll('#sensores-grade .sensor-card').length === 37 && " +
  "document.querySelectorAll('#deck-palco .demo').length === 5 && " +
  "document.querySelectorAll('#materiais-app .manual-estacao').length === 5)()";

async function esperarApp() {
  await esperar(EXPRESSAO_PRONTO, 15000);
  await pausa(250);
}

async function ativarEstacao(indice) {
  await avaliar("document.querySelector('#deck-abas .deck-aba[data-indice=\"" + indice + "\"]').click(); true");
  await pausa(260);
}

async function irPara(id) {
  await avaliar("(() => { const el = document.getElementById(" + JSON.stringify(id) + "); window.scrollTo(0, el.offsetTop - 80); return true; })()");
  await pausa(320);
}

async function capturar(nome) {
  const resposta = await pagina.cdp.enviar("Page.captureScreenshot", { format: "png", fromSurface: true });
  const destino = path.join(ARTEFATOS, nome);
  fs.writeFileSync(destino, Buffer.from(resposta.data, "base64"));
  console.log("  · screenshot: tests/artifacts/" + nome);
}

async function recarregar() {
  await pagina.cdp.enviar("Page.reload", { ignoreCache: true });
  await pausa(400);
  await esperarApp();
}

/* --------------------------------------------------------------------------
   Fluxo principal
   -------------------------------------------------------------------------- */
async function principal() {
  fs.mkdirSync(ARTEFATOS, { recursive: true });
  fs.mkdirSync(PERFIL, { recursive: true });

  const navegador = encontrarNavegador();
  if (!navegador) throw new Error("Chrome/Edge não encontrado. Defina CHROME_PATH.");
  console.log("Navegador:", navegador);

  const servidor = criarServidor();
  await new Promise(function (resolver, rejeitar) {
    servidor.once("error", rejeitar);
    servidor.listen(0, "127.0.0.1", resolver);
  });
  const porta = servidor.address().port;
  const url = "http://127.0.0.1:" + porta + "/";
  console.log("Servidor:", url);

  const processo = spawn(navegador, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--remote-allow-origins=*",
    "--remote-debugging-port=0",
    "--user-data-dir=" + PERFIL,
    "--window-size=1440,900",
    "--force-device-scale-factor=1",
    "about:blank"
  ], { stdio: "ignore" });

  let conexao = null;
  let sucesso = false;
  try {
    const arquivoPorta = path.join(PERFIL, "DevToolsActivePort");
    if (!(await esperarArquivo(arquivoPorta, 25000))) {
      throw new Error("O navegador não criou o arquivo DevToolsActivePort.");
    }
    global.paginaPorta = parseInt(fs.readFileSync(arquivoPorta, "utf8").split(/\r?\n/)[0], 10);
    if (!global.paginaPorta) throw new Error("Porta de depuração inválida.");

    pagina = await abrirPagina(url);
    await esperarApp();

    await teste("Carrega a página com todos os blocos principais", async function () {
      const info = await avaliar("({" +
        "titulo: document.title," +
        "abas: document.querySelectorAll('#deck-abas .deck-aba').length," +
        "slides: document.querySelectorAll('#deck-palco .estacao-slide').length," +
        "sensores: document.querySelectorAll('#sensores-grade .sensor-card').length," +
        "fotos: document.querySelectorAll('#sensores-grade .sensor-foto').length," +
        "fotosDescritas: document.querySelectorAll('#sensores-grade .sensor-foto[alt]').length," +
        "desenhos: document.querySelectorAll('#sensores-grade .sensor-figura svg').length," +
        "usos: document.querySelectorAll('#sensores-grade .sensor-usos li').length," +
        "usosTitulos: document.querySelectorAll('#sensores-grade .sensor-usos-titulo').length," +
        "itensComuns: document.querySelectorAll('#materiais-app .materiais-comuns .material-item').length," +
        "selos: document.querySelectorAll('#selos .selo').length," +
        "demos: document.querySelectorAll('#deck-palco .demo').length," +
        "comCabecalho: document.querySelectorAll('#deck-palco .demo .demo-cabeca').length," +
        "heroSvg: Boolean(document.querySelector('#hero-arte svg'))," +
        "plantaSvg: Boolean(document.querySelector('#planta-arte svg'))," +
        "kitBloco: Boolean(document.querySelector('#kit-app .kit-ao-vivo'))," +
        "manuais: document.querySelectorAll('#materiais-app .manual-estacao').length," +
        "kitManual: Boolean(document.querySelector('#material-toque .manual-kit'))," +
        "kitFoto: Boolean(document.querySelector('.kit-foto img'))," +
        "semFiltros: document.querySelectorAll('#materiais-app [data-materiais-filtro]').length === 0," +
        "textoMateriais: (document.querySelector('#materiais-app') || {}).textContent || ''," +
        "textoAoVivo: (document.querySelector('#aba-estacao-2') || {}).textContent || ''," +
        "textoEspelho: (document.querySelector('#aba-estacao-5') || {}).textContent || ''" +
      "})");
      garantir(/Mundo Maker/.test(info.titulo), "título inesperado: " + info.titulo);
      garantir(info.abas === 5, "esperava 5 abas, achei " + info.abas);
      garantir(info.slides === 5, "esperava 5 slides, achei " + info.slides);
      garantir(info.sensores === 37, "esperava 37 cards de sensores, achei " + info.sensores);
      garantir(info.fotos === 37, "o modo padrão deve mostrar as 37 fotos, achei " + info.fotos);
      garantir(info.fotosDescritas === 37, "toda foto de sensor precisa de alt descritivo.");
      garantir(info.desenhos === 0, "no modo foto não deve haver desenhos na grade.");
      garantir(info.usos === 111, "esperava 111 modos de uso (3 por sensor), achei " + info.usos);
      garantir(info.usosTitulos === 37, "cada carta deve ter o título Modos de uso.");
      garantir(info.itensComuns === 10, "esperava 10 itens de uso comum, achei " + info.itensComuns);
      garantir(info.selos === 5, "esperava 5 selos, achei " + info.selos);
      garantir(info.demos === 5, "esperava 5 demos, achei " + info.demos);
      garantir(info.comCabecalho === 5, "as 5 demos devem ter .demo-cabeca.");
      garantir(info.heroSvg, "a arte da capa não foi renderizada.");
      garantir(info.plantaSvg, "a planta não foi renderizada.");
      garantir(info.kitBloco, "o bloco do kit ao vivo não foi renderizado.");
      garantir(info.manuais === 5, "materiais deveria ter 5 manuais de estação, achei " + info.manuais);
      garantir(info.kitManual, "o manual da Estação 2 deve avisar do kit físico (NFC).");
      garantir(info.kitFoto, "a seção de sensores deve mostrar a foto do kit completo.");
      garantir(info.semFiltros, "a página de materiais não deve ter menus de filtro.");
      garantir(!/zip|bexiga|bal[aã]o/i.test(info.textoMateriais), "a página não deve citar zip nem bexigas.");
      garantir(/AO VIVO/.test(info.textoAoVivo), "a Estação 2 deve ter o selo AO VIVO.");
      garantir(/PAINEL/.test(info.textoEspelho), "a Estação 5 deve ter o selo PAINEL.");
    });

    await teste("Removeu blocos redundantes e o vazio da estação", async function () {
      const removidos = await avaliar("({" +
        "fatos: document.querySelectorAll('.fatos .fato').length," +
        "calloutFonte: document.querySelectorAll('.callout--fonte').length," +
        "texto: (document.querySelector('#visao-geral') || {}).textContent || ''" +
      "})");
      garantir(removidos.fatos === 3, "o resumo em números deve ter 3 itens, achei " + removidos.fatos);
      garantir(removidos.calloutFonte === 0, "não deve sobrar o callout de prioridade dos materiais.");
      garantir(!/Prioridade dos materiais/.test(removidos.texto), "o bloco Prioridade dos materiais deveria ter saído.");
      garantir(!/itens prioritários/.test(removidos.texto), "o item 20 itens prioritários deveria ter saído.");

      await irPara("estacoes");
      const layout = await avaliar("(() => {" +
        "const slide = document.querySelector('#deck-palco .estacao-slide:not([hidden])');" +
        "const visual = slide.querySelector('.estacao-visual');" +
        "const ultimo = visual.lastElementChild;" +
        "const demo = slide.querySelector(':scope > .demo');" +
        "return {" +
        "  folga: Math.round(visual.getBoundingClientRect().bottom - ultimo.getBoundingClientRect().bottom)," +
        "  demoDireto: Boolean(demo)," +
        "  demoLargura: demo ? Math.round(demo.getBoundingClientRect().width) : 0," +
        "  slideLargura: Math.round(slide.getBoundingClientRect().width)" +
        "};" +
      "})()");
      garantir(layout.folga <= 60, "a coluna da ilustração ficou com " + layout.folga + "px de espaço vazio.");
      garantir(layout.demoDireto, "a demo deve ser filha direta do slide para ocupar a largura toda.");
      garantir(layout.demoLargura > layout.slideLargura * 0.9, "a demo deveria ocupar a largura do slide (achei " + layout.demoLargura + " de " + layout.slideLargura + ").");
    });

    await teste("Sensores abrem na foto real e alternam com o desenho", async function () {
      await irPara("sensores");
      await avaliar("document.querySelector('#sensores-app').scrollIntoView({ block: 'start' }); true");
      await pausa(300);
      const inicio = await avaliar("({" +
        "svgs: document.querySelectorAll('#sensores-grade .sensor-figura svg').length," +
        "fotos: document.querySelectorAll('#sensores-grade .sensor-foto').length," +
        "fotoAtiva: document.querySelector('[data-vista=\"foto\"]').getAttribute('aria-pressed')," +
        "desenhoAtivo: document.querySelector('[data-vista=\"desenho\"]').getAttribute('aria-pressed')" +
      "})");
      garantir(inicio.fotos === 37 && inicio.svgs === 0, "o padrão deve ser a foto real dos 37 sensores.");
      garantir(inicio.fotoAtiva === "true" && inicio.desenhoAtivo === "false", "o botão Foto real deve começar pressionado.");

      await esperar("(() => [...document.querySelectorAll('#sensores-grade .sensor-foto')].filter(img => img.complete && img.naturalWidth > 0).length >= 6)()", 8000);
      const foto = await avaliar("(() => {" +
        "const imgs = [...document.querySelectorAll('#sensores-grade .sensor-foto')];" +
        "const primeira = imgs[0];" +
        "return {" +
        "  rotulos: document.querySelectorAll('#sensores-grade .sensor-foto-rotulo').length," +
        "  carregadas: imgs.filter(img => img.complete && img.naturalWidth > 0).length," +
        "  alt: primeira ? primeira.getAttribute('alt') : ''," +
        "  src: primeira ? primeira.getAttribute('src') : ''" +
        "};" +
      "})()");
      garantir(foto.rotulos === 37, "cada foto deve ter o rótulo 'foto do kit'.");
      garantir(foto.carregadas >= 6, "as fotos visíveis não carregaram (só " + foto.carregadas + " de 37).");
      garantir(/^assets\/sensores\/[a-z-]+\.jpg$/.test(foto.src || ""), "src da foto inesperado: " + foto.src);
      garantir(/^Foto do módulo .+ no kit de 37 sensores$/.test(foto.alt || ""), "alt da foto inesperado: " + foto.alt);
      await capturar("sensores-fotos-desktop.png");
      await avaliar("document.querySelector('#sensores-grade .sensor-card').scrollIntoView({ block: 'center' }); true");
      await pausa(300);
      await capturar("sensores-usos.png");

      await avaliar("document.querySelector('[data-vista=\"desenho\"]').click(); true");
      await esperar("document.querySelectorAll('#sensores-grade .sensor-figura svg').length === 37", 5000);
      const desenho = await avaliar("({" +
        "fotos: document.querySelectorAll('#sensores-grade .sensor-foto').length," +
        "descritos: document.querySelectorAll('#sensores-grade .sensor-figura svg[role=\"img\"][aria-label]').length," +
        "usos: document.querySelectorAll('#sensores-grade .sensor-usos li').length" +
      "})");
      garantir(desenho.fotos === 0, "no modo desenho as fotos devem sair.");
      garantir(desenho.descritos === 37, "todo desenho precisa de descrição acessível.");
      garantir(desenho.usos === 111, "os modos de uso devem continuar nos dois modos de visualização.");
      await capturar("sensores-desenhos-desktop.png");

      await avaliar("document.querySelector('[data-vista=\"foto\"]').click(); true");
      await esperar("document.querySelectorAll('#sensores-grade .sensor-foto').length === 37", 5000);
    });

    await teste("Deck navega, atualiza hash e mostra a estação correta", async function () {
      await ativarEstacao(2);
      const estado = await avaliar("({" +
        "hash: location.hash," +
        "selecionada: document.querySelector('#deck-abas .deck-aba[aria-selected=\"true\"]').getAttribute('data-indice')," +
        "visiveis: [...document.querySelectorAll('#deck-palco .estacao-slide')].filter(s => !s.hidden).length," +
        "titulo: document.querySelector('#deck-palco .estacao-slide:not([hidden]) h3').textContent" +
      "})");
      garantir(estado.selecionada === "2", "aba selecionada deveria ser a 3ª.");
      garantir(estado.visiveis === 1, "deveria haver exatamente 1 slide visível.");
      garantir(estado.hash === "#estacao-3", "hash deveria ser #estacao-3, achei " + estado.hash);
      garantir(/Semáforo/.test(estado.titulo), "título do slide inesperado: " + estado.titulo);

      await avaliar("document.querySelector('#deck-proxima').click(); true");
      await pausa(200);
      garantir((await avaliar("location.hash")) === "#estacao-4", "o botão Próxima deveria ir para a estação 4.");
      await ativarEstacao(1);
    });

    await teste("Demo NFC retorna LIBERADO, NEGADO e BLOQUEADO", async function () {
      await ativarEstacao(1);
      const ler = async function (indice, esperado) {
        if (indice > 0) await avaliar("document.querySelector('#nfc-limpar') && document.querySelector('#nfc-limpar').click(); true");
        await avaliar("document.querySelectorAll('[data-nfc-cartao]')[" + indice + "].click(); true");
        await avaliar("document.querySelector('#nfc-leitor').click(); true");
        await esperar("document.querySelector('#nfc-resultado') && " +
          "document.querySelector('#nfc-resultado').textContent.indexOf(" + JSON.stringify(esperado) + ") !== -1", 9000);
      };
      await ler(0, "LIBERADO");
      await ler(1, "NEGADO");
      await ler(2, "BLOQUEADO");
    });

    await teste("Roleta gira e mostra um estado válido", async function () {
      await ativarEstacao(2);
      const titulos = await avaliar("FEIRA.data.roleta.map(function (setor) { return setor.titulo; })");
      await avaliar("document.querySelector('#roleta-girar').click(); true");
      await esperar("document.querySelector('#roleta-resultado') && " +
        "document.querySelector('#roleta-resultado').textContent.indexOf('Girando') === -1 && " +
        "document.querySelector('#roleta-resultado').textContent.trim().length > 10", 12000);
      const texto = await avaliar("document.querySelector('#roleta-resultado').textContent");
      garantir(titulos.some(function (titulo) { return texto.indexOf(titulo) !== -1; }), "resultado da roleta não corresponde a um setor: " + texto.slice(0, 120));
      const transformacao = await avaliar("getComputedStyle(document.querySelector('[data-roleta-rotor]')).transform");
      garantir(transformacao && transformacao !== "none", "o rotor da roleta não recebeu rotação.");
    });

    await teste("Caixa sorteia, classifica e avança o placar", async function () {
      await ativarEstacao(3);
      await avaliar("document.querySelector('#caixa-puxar').click(); true");
      await esperar("document.querySelector('#caixa-sensor') && document.querySelector('#caixa-sensor').textContent.trim().length > 10", 6000);
      const sensor = await avaliar("(() => {" +
        "const texto = document.querySelector('#caixa-sensor').textContent;" +
        "const encontrado = FEIRA.data.sensores.find(function (s) { return texto.indexOf(s.nome) !== -1; });" +
        "return encontrado ? { nome: encontrado.nome, tipo: encontrado.tipo } : null;" +
      "})()");
      garantir(sensor, "não foi possível identificar o sensor sorteado.");
      await avaliar("document.querySelector('[data-caixa-tipo=\"" + sensor.tipo + "\"]').click(); true");
      await esperar("document.querySelector('#caixa-feedback') && document.querySelector('#caixa-feedback').textContent.trim().length > 5", 5000);
      const progresso = await avaliar("document.querySelector('#caixa-progresso') ? document.querySelector('#caixa-progresso').textContent : ''");
      garantir(/1|2/.test(progresso), "o progresso da caixa não avançou: " + progresso);
    });

    await teste("Linha do tempo simula o acesso e funciona offline", async function () {
      await ativarEstacao(4);
      await avaliar("document.querySelector('#timeline-offline').click(); true");
      await avaliar("document.querySelector('#timeline-simular').click(); true");
      await esperar("document.querySelector('#timeline-painel') && " +
        "(/LIBERADO|Lucas/i.test(document.querySelector('#timeline-painel').textContent))", 12000);
      const texto = await avaliar("document.querySelector('#timeline-painel').textContent + ' ' + document.querySelector('[data-demo=\"timeline\"]').textContent");
      garantir(/offline|Flash|sincroniza/i.test(texto), "a simulação não menciona o modo offline.");
    });

    await teste("Cada estação tem material, montagem e propósito no mesmo manual", async function () {
      const manuais = await avaliar("(() => [...document.querySelectorAll('#materiais-app .manual-estacao')].map(function (manual) {" +
        "return {" +
        "  id: manual.id," +
        "  itens: manual.querySelectorAll('.manual-lista .material-item').length," +
        "  passos: manual.querySelectorAll('.manual-passos')[0] ? manual.querySelectorAll('.manual-passos')[0].children.length : 0," +
        "  proposito: Boolean(manual.querySelector('.manual-proposito'))," +
        "  dica: Boolean(manual.querySelector('.manual-dica'))" +
        "}; }))()");
      garantir(manuais.length === 5, "esperava 5 manuais, achei " + manuais.length);
      manuais.forEach(function (manual) {
        garantir(manual.itens >= 4, manual.id + " deve ter pelo menos 4 materiais próprios.");
        garantir(manual.passos >= 3, manual.id + " deve ter um manual de montagem com pelo menos 3 passos.");
        garantir(manual.proposito, manual.id + " deve explicar para que serve.");
        garantir(manual.dica, manual.id + " deve ter a dica da equipe.");
      });
      const semMenus = await avaliar("document.querySelectorAll('#materiais-app .materiais-filtros, #materiais-app [data-secao]').length === 0");
      garantir(semMenus, "a página não deve ter os menus de bloco/estação/lista.");
    });

    await teste("Passaporte libera o certificado e salva o nome", async function () {
      await avaliar("document.querySelectorAll('[data-carimbar]').forEach(function (botao) { botao.click(); }); true");
      await esperar("document.querySelector('#passaporte-contagem') && document.querySelector('#passaporte-contagem').textContent.indexOf('5 de 5') !== -1", 6000);
      await esperar("document.querySelector('#certificado-nome-input') !== null", 4000);
      await avaliar("(() => { const entrada = document.querySelector('#certificado-nome-input'); entrada.value = 'Ana Clara'; " +
        "entrada.dispatchEvent(new Event('input', { bubbles: true })); return true; })()");
      await esperar("document.querySelector('#certificado-nome-exibido') && document.querySelector('#certificado-nome-exibido').textContent === 'Ana Clara'", 3000);
      garantir(await avaliar("Boolean(document.querySelector('#certificado-imprimir'))"), "o botão de imprimir certificado não apareceu.");
    });

    await teste("Tema claro alterna e persiste", async function () {
      const antes = await avaliar("document.documentElement.getAttribute('data-tema')");
      await avaliar("document.querySelector('#tema-botao').click(); true");
      const depois = await avaliar("document.documentElement.getAttribute('data-tema')");
      garantir(antes !== depois, "o tema não mudou.");
      await recarregar();
      garantir((await avaliar("document.documentElement.getAttribute('data-tema')")) === depois, "o tema não persistiu após recarregar.");
    });

    await teste("Captura screenshots (desktop, claro e mobile)", async function () {
      await avaliar("localStorage.setItem('feira:v1:tema', 'escuro'); true");
      await recarregar();
      await avaliar("window.scrollTo(0, 0); true");
      await pausa(300);
      await capturar("capa-desktop.png");

      await irPara("visao-geral");
      await pausa(300);
      await capturar("visao-geral-desktop.png");
      await avaliar("(() => { const el = document.querySelector('#kit-app'); el.scrollIntoView({ block: 'start' }); return true; })()");
      await pausa(300);
      await capturar("kit-desktop.png");

      await irPara("planta");
      await capturar("planta-desktop.png");

      await irPara("sensores");
      await avaliar("document.querySelector('#sensores-app').scrollIntoView({ block: 'start' }); true");
      await pausa(400);
      await capturar("sensores-desktop.png");

      await ativarEstacao(1);
      await irPara("estacoes");
      await capturar("estacao-2-desktop.png");

      await irPara("materiais");
      await avaliar("document.querySelector('#materiais-app .materiais-comuns').scrollIntoView({ block: 'start' }); true");
      await pausa(300);
      await capturar("materiais-desktop.png");
      await avaliar("document.querySelector('#material-toque').scrollIntoView({ block: 'start' }); true");
      await pausa(250);
      await capturar("materiais-estacao-2.png");

      await irPara("passaporte");
      await capturar("certificado-desktop.png");

      await avaliar("localStorage.setItem('feira:v1:tema', 'claro'); true");
      await recarregar();
      await avaliar("window.scrollTo(0, 0); true");
      await pausa(300);
      await capturar("capa-claro.png");

      await irPara("sensores");
      await avaliar("document.querySelector('#sensores-app').scrollIntoView({ block: 'start' }); true");
      await pausa(400);
      await esperar("(() => [...document.querySelectorAll('#sensores-grade .sensor-foto')].filter(img => img.complete && img.naturalWidth > 0).length >= 6)()", 8000);
      await capturar("sensores-claro.png");

      await avaliar("document.querySelector('[data-vista=\"desenho\"]').click(); true");
      await esperar("document.querySelectorAll('#sensores-grade .sensor-figura svg').length === 37", 5000);
      await capturar("sensores-desenhos-claro.png");
      await avaliar("(() => { const bloco = document.querySelector('.kit-foto'); bloco.open = true; bloco.scrollIntoView({ block: 'start' }); return true; })()");
      await esperar("(() => { const img = document.querySelector('.kit-foto img'); return img && img.complete && img.naturalWidth > 0; })()", 8000);
      await pausa(300);
      await capturar("kit-foto-painel.png");

      await pagina.cdp.enviar("Emulation.setDeviceMetricsOverride", {
        width: 390, height: 844, deviceScaleFactor: 1, mobile: true
      });
      await avaliar("window.scrollTo(0, 0); true");
      await pausa(400);
      await capturar("capa-mobile.png");
      await ativarEstacao(3);
      await irPara("estacoes");
      await capturar("estacao-4-mobile.png");
      await pagina.cdp.enviar("Emulation.clearDeviceMetricsOverride");
    });

    await teste("Gera PDF de impressão da lista, da planta, do kit e do certificado", async function () {
      await avaliar("document.body.classList.add('modo-impressao-materiais'); true");
      const pdfMateriais = await pagina.cdp.enviar("Page.printToPDF", { printBackground: true, preferCSSPageSize: true });
      fs.writeFileSync(path.join(ARTEFATOS, "lista-materiais.pdf"), Buffer.from(pdfMateriais.data, "base64"));
      await avaliar("document.body.classList.remove('modo-impressao-materiais'); true");

      await avaliar("document.body.classList.add('modo-impressao-planta'); true");
      const pdfPlanta = await pagina.cdp.enviar("Page.printToPDF", { printBackground: true, preferCSSPageSize: true });
      fs.writeFileSync(path.join(ARTEFATOS, "planta.pdf"), Buffer.from(pdfPlanta.data, "base64"));
      await avaliar("document.body.classList.remove('modo-impressao-planta'); true");

      await avaliar("document.body.classList.add('modo-impressao-kit'); true");
      const pdfKit = await pagina.cdp.enviar("Page.printToPDF", { printBackground: true, preferCSSPageSize: true });
      fs.writeFileSync(path.join(ARTEFATOS, "kit-ao-vivo.pdf"), Buffer.from(pdfKit.data, "base64"));
      await avaliar("document.body.classList.remove('modo-impressao-kit'); true");

      await avaliar("document.body.classList.add('modo-impressao-certificado'); true");
      const pdfCertificado = await pagina.cdp.enviar("Page.printToPDF", { printBackground: true, preferCSSPageSize: true });
      fs.writeFileSync(path.join(ARTEFATOS, "certificado.pdf"), Buffer.from(pdfCertificado.data, "base64"));
      await avaliar("document.body.classList.remove('modo-impressao-certificado'); true");

      garantir(pdfMateriais.data.length > 4000, "o PDF da lista de materiais ficou pequeno demais.");
      garantir(pdfPlanta.data.length > 4000, "o PDF da planta ficou pequeno demais.");
      garantir(pdfKit.data.length > 4000, "o PDF do kit ficou pequeno demais.");
      garantir(pdfCertificado.data.length > 4000, "o PDF do certificado ficou pequeno demais.");
    });

    await teste("Sem erros de console e sem requisições externas", async function () {
      const externosNaPagina = await avaliar("[...document.querySelectorAll('[src], [href]')].map(function (el) { return el.src || el.href; })" +
        ".filter(function (u) { return /^https?:/i.test(u) && u.indexOf(location.origin) !== 0; })");
      garantir(externosNaPagina.length === 0, "recursos externos no DOM: " + externosNaPagina.join(", "));
      const erros = pagina.errosConsole.filter(function (texto) {
        return !/\.well-known|devtools|favicon\.ico/i.test(texto);
      });
      garantir(erros.length === 0, "erros de console: " + erros.slice(0, 5).join(" | "));
      const externas = pagina.requisicoesExternas.filter(function (endereco) {
        return !/\.well-known/i.test(endereco);
      });
      garantir(externas.length === 0, "requisições externas: " + externas.slice(0, 5).join(", "));
    });

    sucesso = falhas.length === 0;
  } finally {
    try { if (pagina) pagina.cdp.fechar(); } catch (erro) { /* ignora */ }
    try { processo.kill(); } catch (erro) { /* ignora */ }
    await pausa(600);
    try { servidor.close(); } catch (erro) { /* ignora */ }
    try { fs.rmSync(PERFIL, { recursive: true, force: true }); } catch (erro) { /* perfil pode estar em uso */ }
  }

  if (falhas.length) {
    console.error("\n✖ " + falhas.length + " teste(s) falharam:");
    falhas.forEach(function (falha) { console.error("  - " + falha); });
    process.exit(1);
  }
  if (!sucesso) process.exit(1);
  console.log("\n✔ Todos os testes E2E passaram.");
  console.log("Artefatos em: " + ARTEFATOS);
}

principal().catch(function (erro) {
  console.error("Erro fatal no E2E:", erro.message);
  process.exit(1);
});
