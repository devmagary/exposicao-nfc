/* ==========================================================================
   MUNDO MAKER — FEIRA DE EXPOSIÇÃO
   Ilustrações SVG (window.FEIRA.art).

   Contrato:
     hero()            -> SVG 720x620 (capa)
     planta(estacoes)  -> SVG 1000x680 (planta interativa)
     cena(estacao)     -> SVG 560x420 (cena da estação)
     mapaPinos(pinos)  -> HTML com diagrama G-V-S + 4 cartões
     roleta(setores)   -> SVG 420x420 (roleta interativa)
     icone(nome)       -> SVG 24x24 linear (ou "")

   Todas as funções retornam strings e são defensivas. Sem <script>, sem
   dependências externas. Também exporta via module.exports (uso em Node).
   ========================================================================== */
(function (root) {
  "use strict";

  var seq = 0;

  function uid(base) {
    seq += 1;
    return "arte-" + String(base == null ? "fig" : base).replace(/[^a-z0-9_-]+/gi, "").toLowerCase() + "-" + seq;
  }

  function esc(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function limpo(valor, padrao) {
    if (typeof valor !== "string") return padrao;
    var v = valor.trim();
    return v ? v : padrao;
  }

  function numero(valor, padrao) {
    var n = Number(valor);
    return Number.isFinite(n) && n > 0 ? n : padrao;
  }

  function ret(x, y, w, h, r, classe, extra) {
    return (
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" class="' + classe + '"' +
      (extra ? " " + extra : "") + "/>"
    );
  }

  function circ(cx, cy, r, classe, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="' + classe + '"' + (extra ? " " + extra : "") + "/>";
  }

  function texto(x, y, valor, classe, atributos) {
    return (
      '<text x="' + x + '" y="' + y + '" class="' + classe + '"' + (atributos ? " " + atributos : "") + ">" +
      esc(valor) + "</text>"
    );
  }

  var PALETA_ROLETA = ["#22d3ee", "#34d399", "#f87171", "#fb923c", "#a78bfa", "#60a5fa"];
  var CORES = { cyan: 1, emerald: 1, amber: 1, rose: 1, violet: 1 };

  function corValida(valor, padrao) {
    return CORES[valor] ? valor : padrao;
  }

  function corVar(valor) {
    return "var(--" + corValida(valor, "cyan") + ")";
  }

  function estiloCor(valor) {
    return 'style="color:' + corVar(valor) + '"';
  }

  /* ------------------------------------------------------------------
     Estações: metadados leves para desenhar mesmo sem data.js
     ------------------------------------------------------------------ */
  var ESTACOES = [
    { id: "toque", numero: 1, nome: "O Toque Mágico", curto: "Toque", papel: "NFC", cor: "emerald", tema: "NFC: leitura sem encostar" },
    { id: "cerebro", numero: 2, nome: "O Cérebro", curto: "Cérebro", papel: "ESP32-S3", cor: "cyan", tema: "ESP32-S3 + placa de expansão" },
    { id: "semaforo", numero: 3, nome: "O Semáforo Falante", curto: "Semáforo", papel: "LED RGB", cor: "amber", tema: "LED RGB e seus estados" },
    { id: "caixa", numero: 4, nome: "A Caixa dos Sentidos", curto: "Caixa", papel: "37 sensores", cor: "rose", tema: "Os 37 sensores do kit" },
    { id: "memoria", numero: 5, nome: "A Memória que Não Esquece", curto: "Memória", papel: "Flash + Web", cor: "violet", tema: "Flash, LittleFS e Painel Web" }
  ];

  function estacaoPorId(id) {
    for (var i = 0; i < ESTACOES.length; i += 1) {
      if (ESTACOES[i].id === id) return ESTACOES[i];
    }
    return null;
  }

  function normalizarEstacoes(lista) {
    var porId = {};
    (Array.isArray(lista) ? lista : []).forEach(function (item) {
      if (item && typeof item.id === "string") porId[item.id] = item;
    });
    return ESTACOES.map(function (padrao) {
      var dado = porId[padrao.id] || {};
      return {
        id: padrao.id,
        numero: numero(dado.numero, padrao.numero),
        nome: limpo(dado.nome, padrao.nome),
        curto: padrao.curto,
        papel: padrao.papel,
        cor: corValida(dado.cor, padrao.cor),
        tema: limpo(dado.tema, padrao.tema)
      };
    });
  }

  function infoEstacao(entrada) {
    var dado = entrada;
    if (typeof entrada === "string") {
      var idProcurado = entrada;
      dado = null;
      var dados = root.FEIRA && root.FEIRA.data;
      if (dados && Array.isArray(dados.estacoes)) {
        for (var i = 0; i < dados.estacoes.length; i += 1) {
          if (dados.estacoes[i] && dados.estacoes[i].id === idProcurado) dado = dados.estacoes[i];
        }
      }
      if (!dado) dado = { id: idProcurado };
    }
    if (!dado || typeof dado !== "object") dado = {};
    var base = estacaoPorId(dado.id);
    return {
      id: base ? base.id : limpo(dado.id, "estacao"),
      numero: numero(dado.numero, base ? base.numero : 0),
      nome: limpo(dado.nome, base ? base.nome : "Estação"),
      curto: base ? base.curto : limpo(dado.nome, "Estação"),
      papel: base ? base.papel : "",
      cor: corValida(dado.cor, base ? base.cor : "cyan"),
      tema: limpo(dado.tema, base ? base.tema : "")
    };
  }

  /* ------------------------------------------------------------------
     HERO — capa
     ------------------------------------------------------------------ */
  function noHero(x, y, n, nome, papel, cor, atraso) {
    var largura = 152;
    var altura = 82;
    var s = [];
    s.push('<g class="arte-no" style="color:' + corVar(cor) + '">');
    s.push(ret(x, y, largura, altura, 18, "arte-no-caixa"));
    s.push(ret(x, y, largura, altura, 18, "arte-no-borda"));
    s.push(circ(x + 30, y + 31, 18, "arte-no-num-fundo"));
    s.push(texto(x + 30, y + 31, String(n), "arte-no-num", 'font-size="21" text-anchor="middle" dominant-baseline="central"'));
    s.push(texto(x + 57, y + 31, nome, "arte-rotulo", 'font-size="18.5"'));
    s.push(texto(x + 57, y + 55, papel, "arte-sub", 'font-size="13.5"'));
    s.push(
      circ(x + largura - 17, y + 17, 4.5, "arte-no-led" + (atraso ? " arte-pulsa" : ""), 'style="animation-delay:' + (atraso || 0) + 's"')
    );
    s.push("</g>");
    return s.join("");
  }

  function hero() {
    var idGrade = uid("hero-grade");
    var idGlow = uid("hero-glow");
    var idPlaca = uid("hero-placa");
    var s = [];

    s.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 620" width="100%" class="arte-svg arte-hero" aria-hidden="true" focusable="false">');
    s.push("<defs>");
    s.push(
      '<linearGradient id="' + idPlaca + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" class="arte-placa-stop-a"/><stop offset="1" class="arte-placa-stop-b"/>' +
      "</linearGradient>"
    );
    s.push(
      '<radialGradient id="' + idGlow + '">' +
        '<stop offset="0" class="arte-glow-stop-a"/><stop offset="0.55" class="arte-glow-stop-b"/><stop offset="1" class="arte-glow-stop-c"/>' +
      "</radialGradient>"
    );
    s.push(
      '<pattern id="' + idGrade + '" width="30" height="30" patternUnits="userSpaceOnUse">' +
        '<circle cx="2.5" cy="2.5" r="1.2" class="arte-ponto-grade"/>' +
      "</pattern>"
    );
    s.push("</defs>");

    s.push('<rect width="720" height="620" fill="url(#' + idGrade + ')"/>');
    s.push('<ellipse cx="360" cy="300" rx="290" ry="248" class="arte-orbita"/>');
    s.push('<circle cx="360" cy="300" r="238" fill="url(#' + idGlow + ')"/>');

    /* Conexões estação -> placa */
    var conexoes = [
      { cor: "cyan", d: "M200 174 C 226 208 246 228 274 258" },
      { cor: "emerald", d: "M520 158 C 494 194 472 224 450 256" },
      { cor: "violet", d: "M360 102 C 360 148 360 192 360 236" },
      { cor: "amber", d: "M195 396 C 224 380 248 362 272 346" },
      { cor: "rose", d: "M566 404 C 522 388 478 370 450 352" }
    ];
    conexoes.forEach(function (c, i) {
      s.push('<g ' + estiloCor(c.cor) + ">");
      s.push('<path d="' + c.d + '" class="arte-trilha" style="animation-delay:' + (-i * 0.7) + 's"/>');
      s.push("</g>");
    });

    /* Trilhas de circuito (mais longas) */
    s.push('<g ' + estiloCor("cyan") + ">");
    s.push('<path d="M156 560 C 216 546 258 472 298 398" class="arte-trilha arte-trilha--forte" style="animation-delay:-1.2s"/>');
    s.push("</g>");
    s.push('<g ' + estiloCor("emerald") + ">");
    s.push('<path d="M452 356 C 520 366 588 350 632 330" class="arte-trilha arte-trilha--forte" style="animation-delay:-2.1s"/>');
    s.push("</g>");
    s.push('<g ' + estiloCor("violet") + ">");
    s.push('<path d="M402 374 C 432 412 420 452 400 478" class="arte-trilha" style="animation-delay:-2.8s"/>');
    s.push("</g>");

    /* Placa ESP32-S3 central */
    s.push(ret(272, 238, 176, 132, 14, "arte-placa-borda", 'fill="url(#' + idPlaca + ')"'));
    s.push('<path d="M288 258 h20 v7 h-14 v7 h20 v7 h-14 v7 h17" class="arte-antenna"/>');
    s.push(ret(316, 258, 88, 58, 4, "arte-shield"));
    s.push(texto(360, 289, "ESP32-S3", "arte-chip-nome", 'font-size="16.5" text-anchor="middle"'));
    s.push(texto(360, 305, "N16R8", "arte-mono", 'font-size="12" text-anchor="middle"'));
    s.push('<path d="M280 342 h20 v-18 h22" class="arte-fio arte-fio-g"/>');
    s.push('<path d="M280 354 h34 v-18 h18" class="arte-fio arte-fio-v"/>');
    s.push('<path d="M280 366 h46 v-18 h16" class="arte-fio arte-fio-s"/>');
    var i;
    for (i = 0; i < 5; i += 1) {
      s.push(ret(264, 252 + i * 22, 8, 12, 2, "arte-pino"));
      s.push(ret(448, 252 + i * 22, 8, 12, 2, "arte-pino"));
    }
    for (i = 0; i < 4; i += 1) {
      s.push(circ(283 + i * 52, 249, 3, "arte-furo-placa"));
    }
    s.push(ret(332, 362, 56, 9, 3, "arte-usb"));

    /* Nós das estações */
    s.push(noHero(64, 92, 2, "Cérebro", "ESP32-S3", "cyan", 0));
    s.push(noHero(506, 76, 1, "Toque", "NFC", "emerald", -1.2));
    s.push(noHero(284, 20, 5, "Memória", "Flash + Web", "violet", 0));
    s.push(noHero(56, 396, 3, "Semáforo", "LED RGB", "amber", 0));
    s.push(noHero(516, 404, 4, "Caixa", "37 sensores", "rose", 0));

    /* Ondas NFC saindo do nó 1 (Toque) */
    s.push('<g ' + estiloCor("emerald") + ">");
    s.push('<path d="M489 108 A20 20 0 0 0 489 128" class="arte-onda" style="animation-delay:0s"/>');
    s.push('<path d="M479 102 A31 31 0 0 0 479 134" class="arte-onda" style="animation-delay:-0.8s"/>');
    s.push('<path d="M470 96 A42 42 0 0 0 470 140" class="arte-onda" style="animation-delay:-1.6s"/>');
    s.push("</g>");

    /* Passaporte flutuante */
    s.push('<g class="arte-flutua" style="animation-delay:-2.4s">');
    s.push('<g transform="rotate(-8 380 522)">');
    s.push(ret(326, 482, 108, 80, 8, "arte-papel arte-contorno"));
    s.push(ret(326, 482, 108, 20, 8, "arte-paporte-faixa"));
    s.push(texto(380, 496, "PASSAPORTE", "arte-selo-papel", 'font-size="12" text-anchor="middle" letter-spacing="1.4"'));
    s.push(circ(348, 526, 12, "arte-paporte-foto"));
    s.push(ret(368, 538, 52, 3, 1.5, "arte-paporte-linha"));
    s.push(ret(368, 546, 38, 3, 1.5, "arte-paporte-linha"));
    s.push(circ(374, 556, 6, "arte-selo1"));
    s.push(circ(392, 556, 6, "arte-selo2"));
    s.push(circ(410, 556, 6, "arte-selo3"));
    s.push("</g>");
    s.push("</g>");

    /* Sensor de papel */
    s.push('<g class="arte-componente arte-sensor-papel">');
    s.push(ret(62, 536, 86, 54, 6, "arte-componente-corpo"));
    s.push(circ(100, 558, 13, "arte-ldr"));
    s.push('<path d="M92 566 l16 -16 M92 550 l16 16" class="arte-ldr-traco"/>');
    s.push(ret(70, 588, 5, 14, 2, "arte-pino"));
    s.push(ret(86, 588, 5, 14, 2, "arte-pino"));
    s.push(ret(102, 588, 5, 14, 2, "arte-pino"));
    s.push(texto(105, 614, "sensor", "arte-mono", 'font-size="13" text-anchor="middle"'));
    s.push("</g>");

    /* LED */
    s.push('<g ' + estiloCor("amber") + ">");
    s.push('<path d="M648 332 v16 M644 334 l-6 18 M652 334 l6 18" class="arte-led-perna"/>');
    s.push(circ(648, 320, 22, "arte-brilho arte-led-glow"));
    s.push(circ(648, 320, 11, "arte-led-bulbo"));
    s.push(circ(644, 316, 3.5, "arte-led-brilho-ponto"));
    s.push(texto(648, 372, "LED", "arte-mono", 'font-size="13" text-anchor="middle"'));
    s.push("</g>");

    /* Nuvem */
    s.push('<g class="arte-nuvem-hero">');
    s.push('<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" transform="translate(644 30) scale(2.1)" class="arte-nuvem"/>');
    s.push("</g>");

    s.push("</svg>");
    return s.join("");
  }

  /* ------------------------------------------------------------------
     PLANTA — vista de cima
     ------------------------------------------------------------------ */
  function pictoPinos(w) {
    var s = [];
    var linhas = [
      { y: 100, letra: "G", classe: "planta-fio-g" },
      { y: 122, letra: "V", classe: "planta-fio-v" },
      { y: 144, letra: "S", classe: "planta-fio-s" }
    ];
    s.push('<g class="planta-pictograma" transform="rotate(-2 ' + w / 2 + ' 118)">');
    s.push(ret(20, 84, w - 40, 74, 6, "planta-papel planta-papel-borda"));
    s.push(ret(20, 84, w - 40, 12, 6, "planta-papel-cabeca"));
    linhas.forEach(function (linha) {
      s.push(texto(34, linha.y + 6, linha.letra, "planta-letra-papel", 'font-size="19" text-anchor="middle"'));
      s.push('<path d="M48 ' + linha.y + " H " + (w - 32) + '" class="' + linha.classe + ' planta-fio-papel"/>');
      [78, 110, 142].forEach(function (px) {
        s.push(circ(px, linha.y, 4.5, "planta-pino-papel"));
      });
    });
    s.push("</g>");
    return s.join("");
  }

  function pictoLeitor(w) {
    var s = [];
    s.push('<g class="planta-pictograma">');
    s.push(ret(18, 72, 78, 86, 8, "planta-leitor"));
    s.push(ret(26, 80, 62, 70, 6, "planta-antena"));
    s.push(ret(34, 88, 46, 54, 5, "planta-antena"));
    s.push(circ(26, 80, 3, "planta-furo-leitor"));
    s.push(circ(88, 80, 3, "planta-furo-leitor"));
    s.push(circ(26, 150, 3, "planta-furo-leitor"));
    s.push(circ(88, 150, 3, "planta-furo-leitor"));
    s.push(ret(52, 108, 18, 14, 2, "planta-chip-leitor"));
    s.push('<g transform="rotate(-10 136 112)">');
    s.push(ret(104, 92, 64, 42, 5, "planta-papel planta-papel-borda"));
    s.push(ret(112, 100, 14, 10, 2, "planta-chip-cartao"));
    s.push(ret(112, 116, 44, 3, 1.5, "planta-traco-cartao"));
    s.push(ret(112, 123, 30, 3, 1.5, "planta-traco-cartao"));
    s.push("</g>");
    s.push('<g ' + estiloCor("emerald") + ">");
    s.push('<path d="M100 96 A22 22 0 0 1 100 132" class="planta-onda"/>');
    s.push('<path d="M94 88 A32 32 0 0 1 94 140" class="planta-onda" style="animation-delay:-1s"/>');
    s.push("</g>");
    s.push("</g>");
    return s.join("");
  }

  function pictoRoleta(w) {
    var s = [];
    var cx = 74;
    var cy = 116;
    var raio = 38;
    s.push('<g class="planta-pictograma">');
    s.push(circ(cx, cy, raio + 5, "planta-roleta-aro"));
    PALETA_ROLETA.forEach(function (hex, i) {
      var a0 = -120 + i * 60;
      var a1 = a0 + 60;
      s.push('<path d="' + fatia(cx, cy, raio, a0, a1) + '" fill="' + hex + '" class="planta-fatia"/>');
    });
    s.push(circ(cx, cy, 8, "planta-roleta-hub"));
    s.push('<path d="M' + cx + " " + (cy - raio + 4) + ' l-7 -16 h14 Z" class="planta-roleta-seta"/>');
    s.push("</g>");
    return s.join("");
  }

  function pictoCaixa(w) {
    var s = [];
    s.push('<g class="planta-pictograma">');
    s.push(ret(16, 92, 82, 54, 4, "planta-caixa"));
    s.push(ret(16, 92, 82, 10, 3, "planta-caixa-tampa"));
    s.push(ret(52, 98, 10, 46, 0, "planta-caixa-fita"));
    [112, 132].forEach(function (cy) {
      [34, 57, 80].forEach(function (cx) {
        s.push(circ(cx, cy, 7, "planta-furo-caixa"));
      });
    });
    s.push(ret(108, 96, 66, 22, 4, "planta-saquinho"));
    s.push(ret(114, 124, 62, 22, 4, "planta-saquinho"));
    s.push(ret(116, 103, 14, 8, 2, "planta-sensor-papel"));
    s.push(ret(122, 131, 14, 8, 2, "planta-sensor-papel"));
    s.push("</g>");
    return s.join("");
  }

  function pictoNotebook(w) {
    var s = [];
    s.push('<g class="planta-pictograma">');
    s.push(ret(18, 92, 98, 52, 4, "planta-notebook-corpo"));
    s.push(ret(25, 99, 84, 38, 3, "planta-notebook-tela"));
    s.push(ret(30, 105, 34, 3, 1.5, "planta-tela-linha"));
    s.push(ret(30, 112, 24, 3, 1.5, "planta-tela-linha"));
    s.push(ret(30, 119, 40, 3, 1.5, "planta-tela-linha"));
    s.push(circ(96, 108, 4, "planta-tela-ponto-ok"));
    s.push(circ(96, 118, 4, "planta-tela-ponto-erro"));
    s.push(ret(10, 148, 114, 8, 3, "planta-notebook-base"));
    s.push('<path d="M124 96 Q 172 104 218 90" class="planta-varal"/>');
    [142, 166, 190, 212].forEach(function (px) {
      var py = 96 + Math.abs(px - 124) * 0.02 + (px > 170 ? (px - 170) * 0.04 : 0);
      s.push(ret(px - 3, py - 2, 6, 12, 2, "planta-prego"));
      s.push('<g transform="rotate(' + (px - 124) * 0.03 + " " + (px - 3) + " " + (py + 10) + ')">');
      s.push(ret(px - 11, py + 9, 22, 28, 3, "planta-papel planta-papel-borda"));
      s.push(ret(px - 7, py + 15, 14, 2, 1, "planta-traco-cartao"));
      s.push(ret(px - 7, py + 20, 10, 2, 1, "planta-traco-cartao"));
      s.push("</g>");
    });
    s.push("</g>");
    return s.join("");
  }

  var PICTOS = {
    cerebro: pictoPinos,
    semaforo: pictoRoleta,
    memoria: pictoNotebook,
    toque: pictoLeitor,
    caixa: pictoCaixa
  };

  var DESCRITORES = {
    caixa: ["caixa dos", "sentidos"],
    memoria: ["mesa +", "notebook"]
  };

  function mesaPlanta(x, y, w, h, est, pictograma) {
    var largura = w || 192;
    var altura = h || 164;
    var descritor = DESCRITORES[est.id];
    var aria = "Estação " + est.numero + " — " + est.nome + ": " + (est.tema || est.nome);
    var s = [];
    s.push(
      '<g class="planta-mesa" data-estacao-mesa="' + esc(est.id) + '" tabindex="0" role="button" aria-label="' + esc(aria) + '"' +
      ' style="--cor:' + corVar(est.cor) + '">'
    );
    s.push("<title>Estação " + esc(est.numero) + " — " + esc(est.nome) + "</title>");
    s.push('<g transform="translate(' + x + " " + y + ')">');
    s.push(ret(-10, -10, largura + 20, altura + 20, 18, "planta-halo"));
    s.push(ret(0, 0, largura, altura, 14, "planta-corpo"));
    s.push(ret(0, 0, largura, 7, 3.5, "planta-faixa"));
    s.push(ret(0, 0, largura, altura, 14, "planta-brilho"));
    s.push(circ(27, 28, 20, "planta-badge"));
    s.push(texto(27, 28, String(est.numero), "planta-num", 'font-size="26" text-anchor="middle" dominant-baseline="central"'));
    s.push(texto(56, 37, est.curto, "planta-nome", 'font-size="29"'));
    if (descritor) {
      s.push(texto(56, 63, descritor[0], "planta-sub", 'font-size="25"'));
      s.push(texto(56, 86, descritor[1], "planta-sub", 'font-size="25"'));
    }
    s.push(pictograma(largura));
    s.push(ret(0, 0, largura, altura, 14, "planta-hit"));
    s.push("</g>");
    s.push("</g>");
    return s.join("");
  }

  function planta(estacoes) {
    var lista = normalizarEstacoes(estacoes);
    var idKraft = uid("planta-kraft");
    var idGrade = uid("planta-grade");
    var s = [];

    s.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="100%" class="arte-svg arte-planta" role="group" ' +
      'aria-label="Planta da sala: parede de papel kraft no topo, cinco mesas de equipe e circulação em U saindo da entrada e seguindo da estação 1 até a 5.">'
    );
    s.push("<defs>");
    s.push(
      '<linearGradient id="' + idKraft + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#c08a55"/><stop offset="1" stop-color="#96673c"/>' +
      "</linearGradient>"
    );
    s.push(
      '<pattern id="' + idGrade + '" width="28" height="28" patternUnits="userSpaceOnUse">' +
        '<path d="M28 0H0V28" class="planta-grade-linha"/>' +
      "</pattern>"
    );
    s.push("</defs>");

    /* Piso */
    s.push(ret(40, 104, 920, 520, 2, "planta-piso"));
    s.push('<rect x="40" y="104" width="920" height="520" fill="url(#' + idGrade + ')"/>');

    /* Paredes (com vão da entrada) */
    s.push('<path d="M40 624 V104 H960 V624 H800 M640 624 H40" class="planta-parede"/>');

    /* Circulação em U */
    s.push('<path d="M724 606 H104 Q84 606 84 586 V144 Q84 124 104 124 H916 Q936 124 936 144 V606" class="planta-fluxo"/>');
    s.push('<g class="planta-setas">');
    s.push('<path d="M470 606 l14 -7 v14 Z"/>');
    s.push('<path d="M510 124 l-14 -7 v14 Z"/>');
    s.push('<path d="M936 400 l-7 -14 h14 Z"/>');
    s.push('<path d="M936 606 l-8 -15 h16 Z"/>');
    s.push("</g>");
    s.push(texto(500, 376, "circulação em U", "planta-fluxo-rotulo", 'font-size="28" text-anchor="middle" letter-spacing="2"'));
    s.push(texto(500, 400, "1 → 2 → 3 → 4 → 5", "planta-fluxo-sub", 'font-size="21" text-anchor="middle" letter-spacing="1.5"'));

    /* Parede / quadro de kraft */
    s.push(ret(48, 16, 904, 88, 6, "planta-kraft", 'fill="url(#' + idKraft + ')"'));
    s.push(ret(48, 16, 904, 88, 6, "planta-kraft-borda"));
    s.push('<rect x="76" y="10" width="90" height="18" rx="2" class="planta-fita" transform="rotate(-7 121 19)"/>');
    s.push('<rect x="832" y="10" width="90" height="18" rx="2" class="planta-fita" transform="rotate(6 877 19)"/>');
    s.push(texto(500, 70, "[ PAREDE / QUADRO — PAPEL KRAFT ]", "planta-kraft-rotulo", 'font-size="29" text-anchor="middle" letter-spacing="2.5"'));

    /* Mesas */
    /* O U sai da entrada e encontra as estações nesta ordem: 1 → 2 → 3 → 4 → 5. */
    s.push(mesaPlanta(108, 142, 192, 164, lista[2], PICTOS[lista[2].id] || pictoRoleta));
    s.push(mesaPlanta(400, 142, 192, 164, lista[3], PICTOS[lista[3].id] || pictoCaixa));
    s.push(mesaPlanta(680, 142, 235, 164, lista[4], PICTOS[lista[4].id] || pictoNotebook));
    s.push(mesaPlanta(108, 424, 192, 164, lista[1], PICTOS[lista[1].id] || pictoLeitor));
    s.push(mesaPlanta(400, 424, 192, 164, lista[0], PICTOS[lista[0].id] || pictoPinos));

    /* Entrada */
    s.push('<path d="M724 646 V600" class="planta-entrada-seta"/>');
    s.push('<path d="M724 588 l-8 14 h16 Z" class="planta-entrada-ponta"/>');
    s.push('<g transform="rotate(-10 786 568)">');
    s.push(ret(771, 546, 30, 42, 3, "planta-passaporte"));
    s.push(circ(786, 559, 6, "planta-passaporte-foto"));
    s.push(ret(779, 571, 14, 2.5, 1, "planta-passaporte-linha"));
    s.push(ret(779, 577, 10, 2.5, 1, "planta-passaporte-linha"));
    s.push("</g>");
    s.push(texto(724, 674, "ENTRADA", "planta-entrada-rotulo", 'font-size="24" text-anchor="middle" letter-spacing="3"'));

    s.push("</svg>");
    return s.join("");
  }

  /* ------------------------------------------------------------------
     CENAS — uma por estação (560 x 420)
     ------------------------------------------------------------------ */
  var DESCRICOES = {
    cerebro:
      "Cartaz com o ESP32-S3 no centro, a placa de expansão ao redor, trilhas G-V-S em preto, vermelho e amarelo e a área hachurada com os pinos IO35, IO36 e IO37 proibidos pela PSRAM.",
    toque:
      "Leitor PN532 gigante de papelão com antena, cartão NFC com UID, ondas do campo magnético, envelope com as respostas LIBERADO, NEGADO e BLOQUEADO e um cartaz explicando o campo.",
    semaforo:
      "Roleta de seis setores coloridos, LED RGB aceso em degradê, lanterna de celular com celofane atrás de um furo na cartolina e cartaz dos estados do LED.",
    caixa:
      "Caixa de papelão com seis furos, sensores de papel soltos, velcro e painel de três colunas: Digitais, Analógicos e Especiais.",
    memoria:
      "Notebook com o Painel de Acessos, varal de barbante com cartões da linha do tempo, nuvem com chip Flash e post-it perguntando o que acontece se a internet cair."
  };

  function cenaCerebro(est, sid) {
    var idRecorte = sid + "-recorte";
    var s = [];
    s.push("<defs>");
    s.push('<clipPath id="' + idRecorte + '"><rect x="292" y="318" width="244" height="74" rx="6"/></clipPath>');
    s.push("</defs>");

    s.push(ret(140, 84, 320, 224, 16, "arte-expansao"));
    var i;
    for (i = 0; i < 8; i += 1) {
      s.push(ret(148, 104 + i * 25, 10, 16, 2, "arte-pino"));
      s.push(ret(442, 104 + i * 25, 10, 16, 2, "arte-pino"));
    }

    s.push(ret(224, 112, 152, 172, 10, "arte-placa-cena"));
    s.push('<path d="M234 122 h18 v7 h-13 v7 h19 v7 h-14 v7 h17" class="arte-antenna"/>');
    s.push(ret(256, 130, 96, 60, 5, "arte-shield"));
    s.push(texto(304, 157, "ESP32-S3", "arte-chip-nome", 'font-size="17" text-anchor="middle"'));
    s.push(texto(304, 176, "N16R8", "arte-mono", 'font-size="12" text-anchor="middle"'));
    for (i = 0; i < 5; i += 1) {
      s.push(ret(216, 200 + i * 15, 8, 10, 2, "arte-pino"));
      s.push(ret(376, 200 + i * 15, 8, 10, 2, "arte-pino"));
    }
    s.push('<path d="M270 196 v16 h-18 v26" class="arte-fio arte-fio-g"/>');
    s.push('<path d="M288 196 v22 h-14 v20" class="arte-fio arte-fio-v"/>');
    s.push('<path d="M306 196 v28 h-10 v14" class="arte-fio arte-fio-s"/>');
    s.push(ret(276, 268, 48, 10, 3, "arte-usb"));

    var gvs = [
      { y: 150, letra: "G", cor: "arte-gvs-g", texto: "arte-gvs-letra-clara", fio: "arte-fio-g" },
      { y: 182, letra: "V", cor: "arte-gvs-v", texto: "arte-gvs-letra-clara", fio: "arte-fio-v" },
      { y: 214, letra: "S", cor: "arte-gvs-s", texto: "arte-gvs-letra-escura", fio: "arte-fio-s" }
    ];
    gvs.forEach(function (item) {
      s.push('<path d="M117 ' + item.y + " H 224\" class=\"arte-fio " + item.fio + '"/>');
      s.push(circ(104, item.y, 13, item.cor));
      s.push(texto(104, item.y, item.letra, item.texto, 'font-size="15" text-anchor="middle" dominant-baseline="central" font-weight="700"'));
    });

    s.push('<g transform="rotate(-5 63 100)">');
    s.push(ret(22, 80, 82, 40, 5, "arte-papel arte-contorno"));
    s.push(circ(52, 100, 11, "arte-ldr"));
    s.push('<path d="M45 107 l14 -14 M45 93 l14 14" class="arte-ldr-traco"/>');
    s.push(ret(70, 92, 6, 3, 1, "arte-traco-papel"));
    s.push(ret(70, 100, 6, 3, 1, "arte-traco-papel"));
    s.push(ret(70, 108, 6, 3, 1, "arte-traco-papel"));
    s.push("</g>");
    s.push('<g transform="rotate(4 54 264)">');
    s.push(ret(28, 232, 84, 62, 4, "arte-papel arte-contorno"));
    s.push(ret(38, 244, 44, 3, 1.5, "arte-traco-papel"));
    s.push(ret(38, 254, 56, 3, 1.5, "arte-traco-papel"));
    s.push(texto(70, 282, "G V S?", "arte-tinta", 'font-size="15" text-anchor="middle" font-weight="700"'));
    s.push("</g>");
    s.push('<g transform="rotate(-6 46 300)">');
    s.push(ret(30, 300, 50, 50, 2, "arte-postit"));
    s.push(texto(55, 332, "G?", "arte-tinta", 'font-size="20" text-anchor="middle" font-weight="700"'));
    s.push("</g>");
    s.push('<g transform="rotate(8 101 328)">');
    s.push(ret(78, 306, 46, 46, 2, "arte-postit arte-postit--rosa"));
    s.push(texto(101, 338, "!", "arte-tinta", 'font-size="22" text-anchor="middle" font-weight="800"'));
    s.push("</g>");

    s.push('<g clip-path="url(#' + idRecorte + ')" aria-hidden="true">');
    for (var hx = 280; hx < 560; hx += 14) {
      s.push('<path d="M' + hx + " 318 L" + (hx - 76) + ' 392" stroke="#f87171" stroke-width="2" opacity="0.32"/>');
    }
    s.push("</g>");
    s.push(ret(292, 318, 244, 74, 6, "arte-proibido", 'fill="none"'));
    s.push(ret(312, 330, 208, 50, 4, "arte-etiqueta"));
    s.push(circ(330, 354, 11, "arte-proibido-simbolo"));
    s.push('<path d="M323 347 l14 14" class="arte-proibido-traco"/>');
    s.push(texto(350, 348, "IO35 · IO36 · IO37", "arte-alerta", 'font-size="14.5" font-weight="700"'));
    s.push(texto(350, 368, "PROIBIDOS — PSRAM", "arte-alerta", 'font-size="14.5"'));
    return s.join("");
  }

  function cenaToque(est, sid) {
    var s = [];
    s.push('<g class="arte-campo-grupo" style="color:#10b981">');
    s.push(ret(28, 106, 158, 116, 8, "arte-papel arte-contorno-forte"));
    s.push(texto(107, 132, "CAMPO", "arte-rotulo-tinta", 'font-size="15" text-anchor="middle" letter-spacing="1.4" font-weight="700"'));
    s.push(texto(107, 154, "MAGNÉTICO", "arte-rotulo-tinta", 'font-size="15" text-anchor="middle" letter-spacing="1.4" font-weight="700"'));
    s.push('<path d="M62 178 A34 18 0 0 0 152 178" class="arte-onda"/>');
    s.push('<path d="M52 188 A46 24 0 0 0 162 188" class="arte-onda" style="animation-delay:-0.8s"/>');
    s.push(texto(107, 210, "acorda a tag", "arte-mono-tinta", 'font-size="12" text-anchor="middle"'));
    s.push("</g>");

    s.push(ret(196, 92, 176, 212, 12, "arte-leitor-pn532"));
    s.push(ret(208, 104, 152, 188, 8, "arte-antena-pn532"));
    s.push(ret(220, 116, 128, 164, 6, "arte-antena-pn532"));
    s.push(circ(210, 106, 4, "arte-furo-pn532"));
    s.push(circ(358, 106, 4, "arte-furo-pn532"));
    s.push(circ(210, 290, 4, "arte-furo-pn532"));
    s.push(circ(358, 290, 4, "arte-furo-pn532"));
    s.push(ret(266, 172, 36, 30, 3, "arte-chip-pn532"));
    s.push(ret(272, 180, 7, 4, 1, "arte-pad-chip"));
    s.push(ret(281, 180, 7, 4, 1, "arte-pad-chip"));
    s.push(ret(290, 180, 7, 4, 1, "arte-pad-chip"));
    s.push(texto(284, 252, "PN532", "arte-pn532-nome", 'font-size="17" text-anchor="middle"'));
    s.push(circ(348, 112, 5, "arte-led-verde arte-brilho"));

    s.push('<g transform="rotate(-10 460 108)">');
    s.push(ret(386, 62, 146, 92, 8, "arte-papel arte-contorno-forte"));
    s.push(ret(402, 78, 24, 18, 2, "arte-chip-cartao"));
    s.push(texto(518, 92, "NFC", "arte-tinta", 'font-size="15" text-anchor="end" font-weight="700" letter-spacing="1"'));
    s.push(texto(402, 130, "2C:9D:7E:8E", "arte-mono-tinta", 'font-size="14.5" letter-spacing="0.6"'));
    s.push('<path d="M410 140 h28" class="arte-traco-cartao"/>');
    s.push("</g>");

    s.push('<g ' + estiloCor("emerald") + ">");
    s.push('<path d="M446 162 A14 14 0 0 0 474 162" class="arte-onda"/>');
    s.push('<path d="M436 162 A24 24 0 0 0 484 162" class="arte-onda" style="animation-delay:-0.8s"/>');
    s.push('<path d="M426 162 A34 34 0 0 0 494 162" class="arte-onda" style="animation-delay:-1.6s"/>');
    s.push("</g>");

    s.push(ret(32, 304, 196, 88, 5, "arte-envelope"));
    s.push('<path d="M32 304 L130 362 L228 304" class="arte-envelope-flap"/>');
    s.push('<path d="M32 392 L96 348 M228 392 L164 348" class="arte-envelope-dobra"/>');

    var respostas = [
      { x: 42, y: 242, r: -5, rotulo: "LIBERADO", fundo: "#0b2b22", borda: "#34d399", texto: "#6ee7b7" },
      { x: 96, y: 262, r: 4, rotulo: "NEGADO", fundo: "#3a1018", borda: "#f87171", texto: "#fca5a5" },
      { x: 56, y: 282, r: -2, rotulo: "BLOQUEADO", fundo: "#3a2c0b", borda: "#fbbf24", texto: "#fcd34d" }
    ];
    respostas.forEach(function (item) {
      s.push('<g transform="rotate(' + item.r + " " + (item.x + 52) + " " + (item.y + 12) + ')">');
      s.push(
        '<rect x="' + item.x + '" y="' + item.y + '" width="104" height="24" rx="5" style="fill:' + item.fundo +
        ";stroke:" + item.borda + ';stroke-width:1.5"/>'
      );
      s.push(
        '<text x="' + (item.x + 52) + '" y="' + (item.y + 17) + '" font-size="14" class="arte-mono" ' +
        'text-anchor="middle" style="fill:' + item.texto + ';font-weight:700;letter-spacing:0.6">' + esc(item.rotulo) + "</text>"
      );
      s.push("</g>");
    });

    return s.join("");
  }

  function cenaSemaforo(est, sid) {
    var idLed = sid + "-led";
    var idGlow = sid + "-glow";
    var idClip = sid + "-clip";
    var s = [];
    s.push("<defs>");
    s.push(
      '<linearGradient id="' + idLed + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" style="stop-color:#22d3ee"/><stop offset="0.38" style="stop-color:#34d399"/>' +
        '<stop offset="0.7" style="stop-color:#fbbf24"/><stop offset="1" style="stop-color:#f472b6"/>' +
      "</linearGradient>"
    );
    s.push(
      '<radialGradient id="' + idGlow + '">' +
        '<stop offset="0" style="stop-color:#67e8f9;stop-opacity:.5"/><stop offset="1" style="stop-color:#67e8f9;stop-opacity:0"/>' +
      "</radialGradient>"
    );
    s.push('<clipPath id="' + idClip + '"><circle cx="110" cy="348" r="27"/></clipPath>');
    s.push("</defs>");

    var cx = 142;
    var cy = 210;
    var raio = 86;
    s.push(circ(cx, cy, raio + 8, "arte-roleta-aro-cena"));
    PALETA_ROLETA.forEach(function (hex, i) {
      var a0 = -120 + i * 60;
      var a1 = a0 + 60;
      s.push('<path d="' + fatia(cx, cy, raio, a0, a1) + '" fill="' + hex + '" class="arte-fatia-cena"/>');
    });
    s.push(circ(cx, cy, 20, "arte-roleta-hub-cena"));
    s.push(circ(cx, cy, 8, "arte-roleta-hub-miolo"));
    s.push('<path d="M' + cx + " " + (cy - raio + 4) + ' l-8 -18 h16 Z" class="arte-roleta-ponteiro-cena"/>');
    s.push('<path d="M64 270 l18 8 M74 250 l20 4" class="arte-rasgo"/>');

    s.push(circ(424, 188, 88, "arte-led-glow-cena arte-pulsa"));
    s.push(circ(424, 188, 48, "arte-led-domo", 'fill="url(#' + idLed + ')"'));
    s.push('<ellipse cx="408" cy="170" rx="14" ry="20" class="arte-led-reflexo" transform="rotate(-25 408 170)"/>');
    s.push('<path d="M406 232 L398 290" class="arte-perna-led" style="stroke:#ef4444"/>');
    s.push('<path d="M424 236 L424 292" class="arte-perna-led" style="stroke:#22c55e"/>');
    s.push('<path d="M442 232 L450 290" class="arte-perna-led" style="stroke:#60a5fa"/>');
    s.push(circ(398, 294, 4, "arte-pino-led"));
    s.push(circ(424, 296, 4, "arte-pino-led"));
    s.push(circ(450, 294, 4, "arte-pino-led"));
    s.push(texto(424, 116, "LED RGB", "arte-rotulo", 'font-size="16" text-anchor="middle" font-weight="700"'));

    s.push(ret(296, 300, 240, 94, 6, "arte-poster"));
    s.push(texto(310, 320, "ESTADOS DO LED", "arte-poster-titulo", 'font-size="13.5" letter-spacing="1.2"'));
    var estados = [
      { y: 344, cor: "#34d399", texto: "verde = liberado" },
      { y: 364, cor: "#f87171", texto: "vermelho = negado" },
      { y: 384, cor: "#22d3ee", texto: "ciano = standby" }
    ];
    estados.forEach(function (item) {
      s.push('<circle cx="314" cy="' + (item.y - 5) + '" r="5.5" style="fill:' + item.cor + '"/>');
      s.push(texto(328, item.y, item.texto, "arte-texto", 'font-size="13.5"'));
    });

    s.push(ret(30, 300, 240, 94, 6, "arte-cartolina"));
    s.push('<path d="M30 322 h240" class="arte-cartolina-linha"/>');
    s.push('<polygon points="62,326 148,318 148,380 62,372" class="arte-luz-celofane"/>');
    s.push('<g transform="rotate(16 66 350)">');
    s.push(ret(46, 316, 40, 68, 7, "arte-celular"));
    s.push(circ(66, 328, 6, "arte-flash-celular"));
    s.push("</g>");
    s.push(circ(110, 348, 27, "arte-furo-cartolina"));
    s.push('<g clip-path="url(#' + idClip + ')">');
    s.push('<rect x="83" y="321" width="27" height="54" style="fill:#34d399;opacity:.5"/>');
    s.push('<rect x="110" y="321" width="27" height="54" style="fill:#f87171;opacity:.45"/>');
    s.push("</g>");
    s.push(circ(110, 348, 27, "arte-furo-aro"));
    s.push(texto(150, 386, "celofane no furo", "arte-mono-tinta", 'font-size="13.5" text-anchor="middle"'));
    return s.join("");
  }

  function cenaCaixa(est, sid) {
    var s = [];
    s.push('<g class="arte-caixa-grupo">');
    s.push(ret(44, 112, 224, 184, 8, "arte-caixa-corpo"));
    s.push('<polygon points="40,100 268,100 260,126 48,126" class="arte-caixa-tampa"/>');
    s.push(ret(140, 100, 30, 126, 0, "arte-caixa-fita"));
    s.push(texto(154, 120, "CAIXA DOS SENTIDOS", "arte-caixa-rotulo", 'font-size="13.5" text-anchor="middle" letter-spacing="1"'));
    [176, 246].forEach(function (cy) {
      [90, 156, 222].forEach(function (cx) {
        s.push(circ(cx, cy, 25, "arte-furo-caixa-cena"));
        s.push(circ(cx, cy, 19, "arte-furo-interno"));
      });
    });
    s.push(ret(276, 250, 48, 28, 4, "arte-velcro"));
    s.push('<path d="M282 258 h36 M282 264 h36 M282 270 h36" class="arte-velcro-traco"/>');
    s.push("</g>");

    var cartoes = [
      { x: 300, y: 78, r: -3, nome: "LDR" },
      { x: 330, y: 136, r: 2, nome: "REED" },
      { x: 296, y: 194, r: -2, nome: "TILT" }
    ];
    cartoes.forEach(function (cartao) {
      s.push('<g transform="rotate(' + cartao.r + " " + (cartao.x + 75) + " " + (cartao.y + 27) + ')">');
      s.push(ret(cartao.x, cartao.y, 150, 54, 8, "arte-papel arte-contorno-forte"));
      s.push(ret(cartao.x + 12, cartao.y + 15, 30, 24, 3, "arte-sensor-cena"));
      s.push(ret(cartao.x + 18, cartao.y + 21, 18, 3, 1, "arte-sensor-traco"));
      s.push(ret(cartao.x + 18, cartao.y + 27, 12, 3, 1, "arte-sensor-traco"));
      s.push(texto(cartao.x + 54, cartao.y + 33, cartao.nome, "arte-rotulo-tinta", 'font-size="14" font-weight="700" letter-spacing="1"'));
      s.push("</g>");
    });

    s.push(ret(36, 310, 500, 82, 8, "arte-painel"));
    s.push('<path d="M203 318 V384 M369 318 V384" class="arte-painel-divisoria"/>');
    var colunas = [
      { x: 119, titulo: "DIGITAIS", cor: "arte-coluna-digital" },
      { x: 286, titulo: "ANALÓGICOS", cor: "arte-coluna-analogico" },
      { x: 452, titulo: "ESPECIAIS", cor: "arte-coluna-especial" }
    ];
    colunas.forEach(function (coluna) {
      s.push(texto(coluna.x, 332, coluna.titulo, "arte-coluna-titulo " + coluna.cor, 'font-size="14" text-anchor="middle" letter-spacing="0.8"'));
      for (var j = 0; j < 2; j += 1) {
        s.push(ret(coluna.x - 34 + j * 38, 344, 30, 28, 4, "arte-painel-chip"));
        s.push(circ(coluna.x - 19 + j * 38, 352, 4, "arte-painel-ponto " + coluna.cor));
        s.push(ret(coluna.x - 27 + j * 38, 362, 16, 3, 1, "arte-painel-traco"));
      }
    });
    return s.join("");
  }

  function cenaMemoria(est, sid) {
    var s = [];
    s.push('<g transform="rotate(-7 464 103)">');
    s.push(ret(408, 58, 112, 90, 2, "arte-postit arte-postit--grande"));
    s.push('<path d="M502 58 L520 76 V58 Z" class="arte-postit-dobra"/>');
    s.push(texto(464, 86, "E se a", "arte-tinta", 'font-size="15" text-anchor="middle" font-weight="700"'));
    s.push(texto(464, 108, "internet", "arte-tinta", 'font-size="15" text-anchor="middle" font-weight="700"'));
    s.push(texto(464, 130, "cair?", "arte-tinta", 'font-size="15" text-anchor="middle" font-weight="700"'));
    s.push("</g>");

    s.push('<path d="M36 96 Q 190 128 358 86" class="arte-varal"/>');
    var cartoes = [
      { x: 114, y: 107, tipo: "cartao" },
      { x: 165, y: 110, tipo: "nfc" },
      { x: 240, y: 106, tipo: "flash" },
      { x: 310, y: 97, tipo: "check" }
    ];
    cartoes.forEach(function (item) {
      s.push(ret(item.x - 4, item.y - 5, 8, 13, 2, "arte-prego"));
      s.push('<g transform="rotate(' + (item.x - 200) * 0.04 + " " + item.x + " " + item.y + ')">');
      s.push(ret(item.x - 23, item.y + 6, 46, 52, 3, "arte-papel arte-contorno"));
      if (item.tipo === "cartao") {
        s.push(ret(item.x - 15, item.y + 16, 30, 20, 2, "arte-icone-cartao"));
        s.push(ret(item.x - 12, item.y + 24, 18, 2.5, 1, "arte-traco-cartao"));
      } else if (item.tipo === "nfc") {
        s.push('<path d="M' + (item.x - 7) + " " + (item.y + 20) + " a10 10 0 0 1 0 20\" class=\"arte-traco-nfc\"/>");
        s.push('<path d="M' + (item.x - 1) + " " + (item.y + 16) + " a15 15 0 0 1 0 28\" class=\"arte-traco-nfc\"/>");
        s.push('<path d="M' + (item.x + 5) + " " + (item.y + 12) + " a20 20 0 0 1 0 36\" class=\"arte-traco-nfc\"/>");
      } else if (item.tipo === "flash") {
        s.push(ret(item.x - 13, item.y + 18, 26, 22, 3, "arte-icone-flash"));
        s.push('<path d="M' + item.x + " " + (item.y + 22) + " l-5 8 h5 l-2 8 7 -10 h-5 Z\" class=\"arte-traco-cartao\"/>");
      } else {
        s.push('<path d="M' + (item.x - 12) + " " + (item.y + 32) + " l8 8 16 -18\" class=\"arte-traco-check\"/>");
      }
      s.push("</g>");
    });

    s.push(ret(56, 188, 250, 140, 8, "arte-notebook-corpo"));
    s.push(ret(68, 200, 226, 116, 4, "arte-tela"));
    s.push(texto(82, 222, "Painel de Acessos", "arte-tela-texto", 'font-size="15" font-weight="700"'));
    s.push('<path d="M82 230 H 290" class="arte-tela-regua"/>');
    var linhas = [
      { y: 252, cor: "#34d399", texto: "LIBERADO" },
      { y: 276, cor: "#f87171", texto: "NEGADO" },
      { y: 300, cor: "#34d399", texto: "LIBERADO" }
    ];
    linhas.forEach(function (linha) {
      s.push('<circle cx="86" cy="' + (linha.y - 4) + '" r="4" style="fill:' + linha.cor + '"/>');
      s.push('<text x="98" y="' + linha.y + '" font-size="14" class="arte-mono" style="fill:' + linha.cor + ';letter-spacing:.5">' + linha.texto + "</text>");
      s.push(ret(180, linha.y - 8, 90, 8, 3, "arte-tela-barra"));
    });
    s.push('<path d="M50 316 H 312 L 332 338 H 30 Z" class="arte-notebook-base"/>');
    s.push('<path d="M64 322 H 298 M58 328 H 304" class="arte-teclado"/>');

    s.push('<g class="arte-nuvem-cena">');
    s.push('<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" transform="translate(444 188) scale(2.5)" class="arte-nuvem"/>');
    s.push("</g>");
    s.push('<path d="M472 240 V 286" class="arte-seta"/>');
    s.push(ret(430, 286, 86, 64, 6, "arte-chip-flash"));
    s.push(texto(473, 318, "FLASH", "arte-rotulo", 'font-size="13.5" text-anchor="middle" font-weight="700" letter-spacing="1.2"'));
    s.push(ret(422, 300, 8, 5, 1, "arte-pino"));
    s.push(ret(422, 312, 8, 5, 1, "arte-pino"));
    s.push(ret(422, 324, 8, 5, 1, "arte-pino"));
    s.push(ret(516, 300, 8, 5, 1, "arte-pino"));
    s.push(ret(516, 312, 8, 5, 1, "arte-pino"));
    s.push(ret(516, 324, 8, 5, 1, "arte-pino"));
    s.push(texto(473, 372, "nuvem + flash", "arte-mono", 'font-size="13.5" text-anchor="middle"'));
    return s.join("");
  }

  function cenaGenerica(est, sid) {
    var s = [];
    var id = sid + "-glow";
    s.push("<defs>");
    s.push('<radialGradient id="' + id + '"><stop offset="0" style="stop-color:var(--primario);stop-opacity:.25"/><stop offset="1" style="stop-color:var(--primario);stop-opacity:0"/></radialGradient>');
    s.push("</defs>");
    s.push(circ(280, 220, 150, "arte-generica-brilho", 'fill="url(#' + id + ')"'));
    s.push(ret(200, 150, 160, 140, 14, "arte-placa-cena"));
    s.push(circ(224, 174, 8, "arte-pino"));
    s.push(circ(336, 174, 8, "arte-pino"));
    s.push(circ(224, 266, 8, "arte-pino"));
    s.push(circ(336, 266, 8, "arte-pino"));
    s.push(ret(232, 186, 96, 68, 6, "arte-shield"));
    s.push('<path d="M250 234 h20 V 208 h20 V 234 h20" class="arte-fio arte-fio-s"/>');
    s.push('<path d="M250 250 h26 V 224 h16" class="arte-fio arte-fio-v"/>');
    s.push('<path d="M250 266 h32 V 240 h12" class="arte-fio arte-fio-g"/>');
    s.push(texto(280, 318, est.nome, "arte-rotulo", 'font-size="18" text-anchor="middle" font-weight="700"'));
    s.push(texto(280, 342, "ilustração de montagem", "arte-mono", 'font-size="12.5" text-anchor="middle"'));
    return s.join("");
  }

  var PINTORES = {
    cerebro: cenaCerebro,
    toque: cenaToque,
    semaforo: cenaSemaforo,
    caixa: cenaCaixa,
    memoria: cenaMemoria
  };

  function cena(estacao) {
    var est = infoEstacao(estacao);
    var sid = uid("cena-" + est.id);
    var pintor = PINTORES[est.id] || cenaGenerica;
    var corpo = pintor(est, sid);
    var titulo =
      "Estação " + (est.numero > 0 ? est.numero + " — " : "") + est.nome + (est.tema ? ": " + est.tema : "");
    var desc = DESCRICOES[est.id] || "Ilustração de montagem em papel e EVA para uma estação da feira.";
    var s = [];
    s.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 420" width="100%" class="arte-svg arte-cena" role="img" ' +
      estiloCor(est.cor) + ' aria-label="' + esc(titulo) + '">'
    );
    s.push("<title>" + esc(titulo) + "</title>");
    s.push("<desc>" + esc(desc) + "</desc>");
    s.push(ret(8, 8, 544, 404, 18, "arte-cena-moldura"));
    s.push(ret(26, 26, 4, 18, 2, "arte-cena-marca"));
    s.push(texto(40, 40, "ESTAÇÃO " + (est.numero > 0 ? est.numero : "—") + " · " + est.nome.toUpperCase(), "arte-mono arte-cena-tag", 'font-size="15" letter-spacing="1.2"'));
    s.push('<line x1="26" y1="52" x2="534" y2="52" class="arte-cena-regua"/>');
    s.push(corpo);
    s.push("</svg>");
    return s.join("");
  }

  /* ------------------------------------------------------------------
     MAPA DE PINOS — HTML + CSS
     ------------------------------------------------------------------ */
  var PINOS_PADRAO = {
    seguros: [
      "IO1", "IO2", "IO4", "IO5", "IO6", "IO7", "IO8", "IO9", "IO10", "IO11", "IO12",
      "IO13", "IO14", "IO17", "IO18", "IO21", "IO38", "IO39", "IO40", "IO41", "IO42", "IO47"
    ],
    proibidos: ["IO35", "IO36", "IO37"],
    strapping: ["IO0", "IO3", "IO45", "IO46"],
    especiais: [
      { pino: "IO8", uso: "SDA do I2C (PN532)" },
      { pino: "IO9", uso: "SCL do I2C (PN532)" },
      { pino: "IO48", uso: "LED RGB WS2812B da placa" },
      { pino: "IO43", uso: "TX da serial" },
      { pino: "IO44", uso: "RX da serial" }
    ]
  };

  function listaTexto(lista) {
    if (!Array.isArray(lista)) return [];
    return lista
      .map(function (item) {
        return typeof item === "string" ? item.trim() : "";
      })
      .filter(function (item) {
        return item.length > 0;
      });
  }

  function normalizarPinos(pinos) {
    var p = pinos && typeof pinos === "object" ? pinos : {};
    var seguros = listaTexto(p.seguros);
    var proibidos = listaTexto(p.proibidos);
    var strapping = listaTexto(p.strapping);
    var especiais = [];
    if (Array.isArray(p.especiais)) {
      p.especiais.forEach(function (item) {
        if (item && typeof item === "object") {
          especiais.push({ pino: limpo(item.pino, "IO?"), uso: limpo(item.uso, "uso especial") });
        } else if (typeof item === "string" && item.trim()) {
          especiais.push({ pino: item.trim(), uso: "uso especial" });
        }
      });
    }
    if (!seguros.length) seguros = PINOS_PADRAO.seguros.slice();
    if (!proibidos.length) proibidos = PINOS_PADRAO.proibidos.slice();
    if (!strapping.length) strapping = PINOS_PADRAO.strapping.slice();
    if (!especiais.length) especiais = PINOS_PADRAO.especiais.slice();
    return { seguros: seguros, proibidos: proibidos, strapping: strapping, especiais: especiais };
  }

  function barraPinos(tipo, letra, nome, pads) {
    var s = [];
    s.push('<div class="pinos-barra pinos-barra--' + tipo + '">');
    s.push('<span class="pinos-barra-letra">' + esc(letra) + "</span>");
    s.push('<span class="pinos-barra-nome">' + esc(nome) + "</span>");
    s.push('<span class="pinos-barra-linha" aria-hidden="true"></span>');
    s.push('<span class="pinos-pads">');
    pads.forEach(function (pad) {
      s.push('<span class="pinos-pad">' + esc(pad) + "</span>");
    });
    s.push("</span></div>");
    return s.join("");
  }

  function cardChips(titulo, nota, itens, modificador) {
    var s = [];
    s.push('<section class="pinos-card pinos-card--' + modificador + '">');
    s.push(
      '<p class="pinos-card-titulo">' + esc(titulo) + ' <span class="pinos-contagem">' + itens.length + "</span></p>"
    );
    s.push('<p class="pinos-card-nota">' + esc(nota) + "</p>");
    s.push('<ul class="pinos-chips">');
    itens.forEach(function (item) {
      s.push('<li class="pinos-chip">' + esc(item) + "</li>");
    });
    s.push("</ul></section>");
    return s.join("");
  }

  function mapaPinos(pinos) {
    var p = normalizarPinos(pinos);
    var s = [];
    s.push('<div class="arte-mapa pinos-mapa">');
    s.push('<div class="pinos-placa">');
    s.push('<div class="pinos-placa-cabeca">');
    s.push('<span class="pinos-placa-titulo">PLACA DE EXPANSÃO · PADRÃO G-V-S</span>');
    s.push('<span class="pinos-placa-selo">ESP32-S3</span>');
    s.push("</div>");
    s.push('<div class="pinos-barras">');
    s.push(barraPinos("g", "G", "GND", ["GND", "GND", "GND", "GND"]));
    s.push(barraPinos("v", "V", "3V3", ["3V3", "3V3", "3V3", "3V3"]));
    s.push(barraPinos("s", "S", "SINAL", ["IO1", "IO6", "IO8", "IO9", "IO48"]));
    s.push("</div>");
    s.push('<div class="pinos-proibidos">');
    s.push('<span class="pinos-proibidos-simbolo" aria-hidden="true">×</span>');
    s.push("<div><strong>" + p.proibidos.map(esc).join(" · ") + "</strong>");
    s.push("<span>proibidos — ligados à PSRAM no ESP32-S3 N16R8. Nunca ligue nada neles.</span></div>");
    s.push("</div>");
    s.push("</div>");

    s.push('<div class="pinos-legendas">');
    s.push(
      cardChips(
        "Pinos seguros",
        "Podem ser usados como entrada ou saída digital/analógica.",
        p.seguros,
        "seguro"
      )
    );
    s.push(
      cardChips(
        "Pinos proibidos",
        "IO35, IO36 e IO37 são ligados à PSRAM. Não use.",
        p.proibidos,
        "proibido"
      )
    );
    s.push(
      cardChips(
        "Strapping",
        "Afetam o boot do ESP32-S3: use com cuidado.",
        p.strapping,
        "strapping"
      )
    );

    s.push('<section class="pinos-card pinos-card--especial">');
    s.push('<p class="pinos-card-titulo">Especiais <span class="pinos-contagem">' + p.especiais.length + "</span></p>");
    s.push('<p class="pinos-card-nota">Funções fixas da placa e do firmware.</p>');
    s.push('<ul class="pinos-especiais">');
    p.especiais.forEach(function (item) {
      s.push(
        '<li><span class="pinos-chip pinos-chip--especial">' + esc(item.pino) + "</span>" +
        '<span class="pinos-uso">' + esc(item.uso) + "</span></li>"
      );
    });
    s.push("</ul></section>");
    s.push("</div>");
    s.push("</div>");
    return s.join("");
  }

  /* ------------------------------------------------------------------
     ROLETA — 420 x 420
     ------------------------------------------------------------------ */
  var APELIDOS_ROLETA = {
    ciano: "PRONTO",
    verde: "LIBERADO",
    vermelho: "NEGADO",
    laranja: "LEITOR",
    roxo: "AP",
    azul: "CONECTA"
  };

  var ROLETA_PADRAO = [
    { cor: "ciano", hex: "#22d3ee", titulo: "Operacional normal" },
    { cor: "verde", hex: "#34d399", titulo: "Acesso liberado" },
    { cor: "vermelho", hex: "#f87171", titulo: "Acesso negado" },
    { cor: "laranja", hex: "#fb923c", titulo: "Falha do leitor" },
    { cor: "roxo", hex: "#a78bfa", titulo: "Modo ponto de acesso" },
    { cor: "azul", hex: "#60a5fa", titulo: "Conectando à rede" }
  ];

  function hexValido(valor, indice) {
    if (typeof valor === "string" && /^#[0-9a-f]{3,8}$/i.test(valor.trim())) return valor.trim();
    return PALETA_ROLETA[indice % PALETA_ROLETA.length];
  }

  function apelidoSetor(setor, indice) {
    if (setor && typeof setor.cor === "string" && APELIDOS_ROLETA[setor.cor]) return APELIDOS_ROLETA[setor.cor];
    var titulo = limpo(setor && setor.titulo, "");
    if (titulo) {
      var curto = titulo.replace(/\s+/g, " ").trim().toUpperCase();
      return curto.length > 9 ? curto.slice(0, 8) : curto;
    }
    if (setor && typeof setor.cor === "string" && setor.cor.trim()) return setor.cor.trim().toUpperCase().slice(0, 8);
    return "SETOR " + (indice + 1);
  }

  function normalizarSetores(lista) {
    var dados = Array.isArray(lista)
      ? lista.filter(function (item) {
          return item && typeof item === "object";
        })
      : [];
    if (!dados.length) dados = ROLETA_PADRAO.slice();
    if (dados.length > 8) dados = dados.slice(0, 8);
    while (dados.length < 3) {
      dados.push(ROLETA_PADRAO[dados.length % ROLETA_PADRAO.length]);
    }
    return dados.map(function (setor, indice) {
      return {
        hex: hexValido(setor.hex, indice),
        rotulo: apelidoSetor(setor, indice),
        cor: limpo(setor.cor, "")
      };
    });
  }

  function roleta(setores) {
    var lista = normalizarSetores(setores);
    var total = lista.length;
    var passo = 360 / total;
    var cx = 210;
    var cy = 210;
    var raio = 176;
    var s = [];
    s.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" width="100%" class="arte-svg arte-roleta" role="img" ' +
      'aria-label="Roleta de estados com ' + total + ' setores coloridos e ponteiro fixo no topo.">'
    );
    s.push("<title>Roleta dos estados do LED</title>");
    s.push("<desc>Seis setores coloridos (" + lista.map(function (setor) { return setor.rotulo.toLowerCase(); }).join(", ") + "). O setor ciano começa centralizado no topo.</desc>");
    s.push(circ(cx, cy, 199, "roleta-aro"));

    s.push('<g data-roleta-rotor="" class="roleta-rotor">');
    lista.forEach(function (setor, indice) {
      var inicio = -90 - passo / 2 + indice * passo;
      s.push(
        '<path d="' + fatia(cx, cy, raio, inicio, inicio + passo) + '" data-setor="' + indice +
        '" class="roleta-setor" fill="' + esc(setor.hex) + '"/>'
      );
    });
    lista.forEach(function (setor, indice) {
      var angulo = (-90 + indice * passo) * (Math.PI / 180);
      var lx = Math.round((cx + Math.cos(angulo) * 116) * 100) / 100;
      var ly = Math.round((cy + Math.sin(angulo) * 116) * 100) / 100;
      s.push(
        '<text x="' + lx + '" y="' + ly + '" class="roleta-rotulo" font-size="16" text-anchor="middle" ' +
        'dominant-baseline="central" fill="#0b1220" font-weight="700" letter-spacing="0.5">' + esc(setor.rotulo) + "</text>"
      );
    });
    s.push("</g>");

    var parafusos = [45, 135, 225, 315];
    parafusos.forEach(function (angulo) {
      var rad = (angulo * Math.PI) / 180;
      s.push(circ(
        Math.round((cx + Math.cos(rad) * 199) * 100) / 100,
        Math.round((cy + Math.sin(rad) * 199) * 100) / 100,
        4.5,
        "roleta-parafuso"
      ));
    });

    s.push('<g data-roleta-ponteiro="" class="roleta-ponteiro">');
    s.push('<path d="M210 60 l-15 -36 h30 Z" class="roleta-ponteiro-corpo"/>');
    s.push(circ(210, 20, 5, "roleta-ponteiro-pino"));
    s.push("</g>");

    s.push(circ(cx, cy, 36, "roleta-hub"));
    s.push(circ(cx, cy, 13, "roleta-hub-miolo"));
    s.push('<path d="M196 210 h28 M210 196 v28" class="roleta-hub-cruz"/>');
    s.push("</svg>");
    return s.join("");
  }

  /* ------------------------------------------------------------------
     37 SENSORES — desenhos dos módulos (200 x 150)
     Cada figura mostra o módulo visto de frente: placa azul, componente
     central e conector de pinos. Desenhos originais, sem fotos, para os
     alunos compararem o desenho com o módulo na mão.
     ------------------------------------------------------------------ */
  var ACC_SENSOR = { digital: "#7dd3fc", analogico: "#6ee7b7", especial: "#fcd34d" };

  function sr(x, y, w, h, r, fill, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>";
  }

  function sc(cx, cy, r, fill, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>";
  }

  function st(x, y, valor, fill, extra, ancora) {
    return '<text x="' + x + '" y="' + y + '" fill="' + fill + '" font-family="Consolas, monospace" font-weight="700" text-anchor="' + (ancora || "middle") + '"' + (extra ? " " + extra : "") + ">" + esc(valor) + "</text>";
  }

  function ledDomo(cx, cy, raio) {
    return [
      '<path d="M' + (cx - 6) + " " + (cy + raio) + "v12M" + (cx + 6) + " " + (cy + raio) + 'v12" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
      sr(cx - raio - 2, cy + raio - 4, raio * 2 + 4, 7, 3.5, "rgba(148,163,184,0.5)"),
      sc(cx, cy, raio, "rgba(226,232,240,0.26)", 'stroke="#e2e8f0" stroke-opacity="0.7" stroke-width="1.4"'),
      '<path d="M' + Math.round(cx - raio * 0.55) + " " + Math.round(cy - raio * 0.1) + "a" + Math.round(raio * 0.5) + " " + Math.round(raio * 0.5) + " 0 0 1 " + Math.round(raio * 0.42) + " " + Math.round(-raio * 0.58) + '" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2.2" stroke-linecap="round"/>'
    ];
  }

  function placaFundo(numero, k) {
    var s = [];
    s.push('<ellipse cx="100" cy="128" rx="58" ry="9" fill="' + k.sombra + '"/>');
    s.push(sr(40, 18, 120, 86, 8, k.placa, 'stroke="rgba(191,219,254,0.4)" stroke-width="1.3"'));
    s.push('<path d="M49 22h102" stroke="rgba(255,255,255,0.2)" stroke-width="1.6" stroke-linecap="round"/>');
    s.push('<path d="M52 88h14M52 92h8" stroke="rgba(147,197,253,0.35)" stroke-width="2" stroke-linecap="round"/>');
    s.push(sr(44, 44, 3, 34, 1.5, k.acc, 'opacity="0.9"'));
    [[49, 27], [151, 27], [49, 95], [151, 95]].forEach(function (ponto) {
      s.push(sc(ponto[0], ponto[1], 3.4, "#0b1a44", 'stroke="rgba(147,197,253,0.55)" stroke-width="1"'));
    });
    s.push(st(58, 31, ("0" + numero).slice(-2), "rgba(219,234,254,0.85)", 'font-size="10"', "start"));
    return s.join("");
  }

  function conectorSensor(pinos) {
    var total = Math.max(3, Math.min(5, pinos || 3));
    var passo = 13;
    var primeiro = Math.round(100 - ((total - 1) * passo) / 2 - 4);
    var largura = (total - 1) * passo + 8;
    var corpo = primeiro - 5;
    var s = [];
    for (var i = 0; i < total; i += 1) {
      s.push(sr(primeiro + i * passo, 98, 8, 24, 2, "#fbbf24", 'stroke="#b45309" stroke-width="0.8"'));
    }
    s.push(sr(corpo, 100, largura + 10, 14, 3, "#111a2b", 'stroke="#475569" stroke-width="1"'));
    if (total === 3) {
      s.push(st(100, 110, "G  V  S", "rgba(148,163,184,0.9)", 'font-size="7" letter-spacing="1.5"'));
    }
    return s.join("");
  }

  var FIGURAS = {
    "buzzer-passivo": function (k) {
      return [
        sc(100, 54, 26, "#232c3d", 'stroke="#3f4c63" stroke-width="1.6"'),
        sc(100, 54, 17, "#141b29"),
        sc(100, 54, 4.5, "#050a14"),
        '<path d="M100 28v6" stroke="#3f4c63" stroke-width="3" stroke-linecap="round"/>',
        '<path d="M131 40q9 7 0 14t0 14" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round" opacity="0.85"/>'
      ];
    },
    "buzzer-ativo": function (k) {
      return [
        sc(100, 54, 26, "#232c3d", 'stroke="#3f4c63" stroke-width="1.6"'),
        sc(100, 54, 18, "#0f1624"),
        '<path d="M93 54h14M100 47v14" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>',
        '<path d="M128 46h5M128 55h5M128 64h5" stroke="' + k.acc + '" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>'
      ];
    },
    "laser": function (k) {
      return [
        sr(86, 26, 28, 48, 6, k.metal, 'stroke="#5b6b82" stroke-width="1.2"'),
        '<path d="M86 40h28M86 62h28" stroke="#5b6b82" stroke-width="1.4" opacity="0.6"/>',
        sr(95, 21, 10, 7, 2, "#1f2937"),
        sc(100, 30, 6, "#0f172a"),
        sc(100, 30, 3, "#ef4444"),
        '<path d="M100 26 166 6" stroke="#ef4444" stroke-width="4" opacity="0.5" stroke-linecap="round"/>',
        '<path d="M100 26 166 6" stroke="#fca5a5" stroke-width="1.4" opacity="0.9" stroke-linecap="round"/>'
      ];
    },
    "led-ir": function (k) {
      return ledDomo(100, 50, 15).concat([
        sr(95, 44, 10, 7, 2, "#111827"),
        '<path d="M124 40q7 5 0 10M132 34q11 8 0 22" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 3"/>'
      ]);
    },
    "led-rgb": function (k) {
      return ledDomo(100, 50, 16).concat([
        sc(92, 50, 3.6, "#ef4444"),
        sc(100, 50, 3.6, "#34d399"),
        sc(108, 50, 3.6, "#60a5fa"),
        '<path d="M123 36q8 8 0 16" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M130 31q10 11 0 26" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M137 26q12 14 0 36" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>'
      ]);
    },
    "led-rgb-smd": function (k) {
      return [
        sr(78, 34, 44, 42, 3, "#0f172a", 'stroke="#334155" stroke-width="1.2"'),
        sr(78, 34, 10, 8, 2, "#fbbf24"),
        sr(112, 34, 10, 8, 2, "#fbbf24"),
        sr(78, 68, 10, 8, 2, "#fbbf24"),
        sr(112, 68, 10, 8, 2, "#fbbf24"),
        sc(100, 55, 13, "rgba(226,232,240,0.22)", 'stroke="#e2e8f0" stroke-opacity="0.45" stroke-width="1.2"'),
        sc(93, 55, 4, "#ef4444"),
        sc(100, 55, 4, "#34d399"),
        sc(107, 55, 4, "#60a5fa")
      ];
    },
    "led-duas-cores": function (k) {
      return [
        '<path d="M100 34a16 16 0 0 0 0 32z" fill="#ef4444" opacity="0.8"/>',
        '<path d="M100 34a16 16 0 0 1 0 32z" fill="#34d399" opacity="0.8"/>',
        sc(100, 50, 16, "none", 'stroke="#e2e8f0" stroke-opacity="0.85" stroke-width="1.5"'),
        sr(82, 62, 36, 7, 3.5, "rgba(148,163,184,0.5)"),
        '<path d="M88 69v10M100 69v10M112 69v10" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M92 38q4 -4 8 0M100 38q4 -4 8 0" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.6"/>'
      ];
    },
    "led-bicolor": function (k) {
      return [
        '<path d="M100 40a11 11 0 0 0 0 22z" fill="#ef4444" opacity="0.8"/>',
        '<path d="M100 40a11 11 0 0 1 0 22z" fill="#34d399" opacity="0.8"/>',
        sc(100, 51, 11, "none", 'stroke="#e2e8f0" stroke-opacity="0.85" stroke-width="1.4"'),
        sr(87, 60, 26, 6, 3, "rgba(148,163,184,0.5)"),
        '<path d="M92 66v11M100 66v11M108 66v11" stroke="#9fb0c7" stroke-width="2.4" stroke-linecap="round"/>'
      ];
    },
    "led-pisca": function (k) {
      return ledDomo(100, 50, 16).concat([
        '<path d="M92 56a9 9 0 0 1 16 0" fill="none" stroke="#ef4444" stroke-width="2.4" stroke-linecap="round"/>',
        '<path d="M87 57a14 14 0 0 1 26 0" fill="none" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round"/>',
        '<path d="M82 58a19 19 0 0 1 36 0" fill="none" stroke="#34d399" stroke-width="2.4" stroke-linecap="round"/>',
        '<path d="M77 59a24 24 0 0 1 46 0" fill="none" stroke="#60a5fa" stroke-width="2.4" stroke-linecap="round"/>'
      ]);
    },
    "botao": function (k) {
      return [
        sr(80, 36, 40, 36, 4, "#1f2937", 'stroke="#475569" stroke-width="1.2"'),
        sc(100, 52, 12, "#4b5b74", 'stroke="#94a3b8" stroke-width="1.6"'),
        sc(100, 50, 7, "#64748b"),
        '<path d="M93 46a9 9 0 0 1 6 -3" fill="none" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>',
        sr(84, 72, 6, 12, 1.5, "#9fb0c7"),
        sr(110, 72, 6, 12, 1.5, "#9fb0c7"),
        '<path d="M122 40q8 6 8 14" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "knock": function (k) {
      return [
        sc(100, 54, 24, "#e2e8f0", 'stroke="#94a3b8" stroke-width="1.6"'),
        sc(100, 54, 15, "#f8fafc", 'stroke="#cbd5e1" stroke-width="1.4"'),
        sc(100, 54, 5.5, "#94a3b8"),
        '<path d="M92 78v6M108 78v6" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M126 34l5 -8M132 44l9 -4M116 25l2 -8" stroke="' + k.acc + '" stroke-width="2.6" stroke-linecap="round"/>'
      ];
    },
    "vibracao": function (k) {
      return [
        sr(72, 40, 7, 28, 2, "#9fb0c7"),
        sr(121, 40, 7, 28, 2, "#9fb0c7"),
        '<path d="M79 54q5.5 -13 11 0t11 0t11 0t11 0" fill="none" stroke="#cbd5e1" stroke-width="2.2" stroke-linecap="round"/>',
        '<path d="M86 30q14 -7 28 0" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4"/>',
        '<path d="M63 44l-6 -5M63 55h-7M63 66l-6 5M137 44l6 -5M137 55h7M137 66l6 5" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "tilt-esfera": function (k) {
      return [
        sr(66, 40, 68, 28, 14, k.vidro, 'stroke="#cbd5e1" stroke-opacity="0.65" stroke-width="1.4"'),
        sr(69, 50, 5, 8, 1, "#9fb0c7"),
        sr(126, 50, 5, 8, 1, "#9fb0c7"),
        sc(80, 60, 7, k.metal, 'stroke="#475569"'),
        sc(78, 57, 2, "#ffffff", 'opacity="0.55"'),
        '<path d="M100 26a26 26 0 0 1 22 10" fill="none" stroke="' + k.acc + '" stroke-width="2.2" stroke-linecap="round"/>',
        '<path d="M120 32l5 4 -7 2" fill="none" stroke="' + k.acc + '" stroke-width="2.2" stroke-linecap="round"/>'
      ];
    },
    "tilt-mercurio": function (k) {
      return [
        sr(66, 40, 68, 28, 14, k.vidro, 'stroke="#cbd5e1" stroke-opacity="0.65" stroke-width="1.4"'),
        '<path d="M74 58q9 -8 18 -2t14 0v8H74z" fill="#e11d48" opacity="0.82"/>',
        '<path d="M72 52h8M120 52h8" stroke="#9fb0c7" stroke-width="3" stroke-linecap="round"/>',
        '<path d="M100 26a26 26 0 0 1 22 10" fill="none" stroke="' + k.acc + '" stroke-width="2.2" stroke-linecap="round"/>'
      ];
    },
    "magic-cup": function (k) {
      return [
        '<path d="M62 70 90 50" stroke="#9fb0c7" stroke-width="2.4" stroke-linecap="round"/>',
        sc(82, 58, 6, k.metal, 'stroke="#475569"'),
        '<path d="M106 34h30v8a15 15 0 0 1 -30 0z" fill="rgba(226,232,240,0.24)" stroke="#cbd5e1" stroke-width="1.4"/>',
        '<path d="M121 57v8h11" fill="none" stroke="#cbd5e1" stroke-width="2.2"/>',
        sc(121, 45, 4, "#fbbf24"),
        '<path d="M121 28v-6M110 32l-4 -5M132 32l4 -5" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "chave-optica": function (k) {
      return [
        sr(74, 32, 52, 44, 5, "#1b2434", 'stroke="#3f4c63" stroke-width="1.2"'),
        sr(74, 50, 52, 9, 0, "#1e3a8a"),
        '<path d="M74 54.5h52" stroke="' + k.acc + '" stroke-width="2" stroke-dasharray="5 4"/>',
        sc(80, 44, 3, "#ef4444"),
        sc(120, 65, 3, "#111827")
      ];
    },
    "encoder": function (k) {
      return [
        sc(100, 54, 21, "#334155", 'stroke="#64748b" stroke-width="1.6"'),
        '<path d="M100 40v-6M100 74v6M86 54h-6M120 54h6" stroke="#64748b" stroke-width="2.4" stroke-linecap="round"/>',
        sc(100, 54, 7, "#1f2937"),
        sr(95, 24, 10, 10, 2, "#9fb0c7"),
        sr(124, 44, 14, 20, 2, "#1f2937", 'stroke="#475569"'),
        sc(131, 54, 4, "#475569"),
        '<path d="M76 34a30 30 0 0 0 -5 18" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "joystick": function (k) {
      return [
        sr(68, 42, 64, 42, 5, "#1f2937", 'stroke="#475569" stroke-width="1.2"'),
        sr(73, 47, 16, 16, 2, "#0f172a", 'stroke="#334155"'),
        '<path d="M81 50v10M76 55h10" stroke="#3f4c63" stroke-width="2"/>',
        sr(111, 47, 16, 16, 2, "#0f172a", 'stroke="#334155"'),
        '<path d="M119 50v10M114 55h10" stroke="#3f4c63" stroke-width="2"/>',
        sc(100, 50, 11, "#334155", 'stroke="#64748b" stroke-width="1.4"'),
        sc(100, 50, 5.5, "#475569"),
        '<path d="M96 40h8l3 -8h-14z" fill="#475569"/>'
      ];
    },
    "toque-metal": function (k) {
      return [
        sr(86, 42, 28, 32, 4, k.metal, 'stroke="#64748b" stroke-width="1.2"'),
        sc(100, 58, 8, "#94a3b8"),
        '<path d="M88 44a17 17 0 0 1 24 0" fill="none" stroke="' + k.acc + '" stroke-width="2"/>',
        '<path d="M82 36a26 26 0 0 1 36 0" fill="none" stroke="' + k.acc + '" stroke-width="2" opacity="0.6"/>',
        '<path d="M100 36v-8" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round" opacity="0.7"/>'
      ];
    },
    "reed-mini": function (k) {
      return [
        sr(76, 48, 46, 16, 8, k.vidro, 'stroke="#cbd5e1" stroke-opacity="0.7" stroke-width="1.4"'),
        '<path d="M79 56h17M100 56h17" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M94 56l4 -3M106 56l-4 3" stroke="#9fb0c7" stroke-width="2" stroke-linecap="round"/>',
        sr(128, 44, 9, 26, 2, "#ef4444"),
        sr(128, 57, 9, 13, 0, "#60a5fa"),
        '<path d="M122 38q-6 10 0 20" fill="none" stroke="' + k.acc + '" stroke-width="1.8" stroke-dasharray="3 3"/>'
      ];
    },
    "reed-grande": function (k) {
      return [
        sr(64, 48, 74, 18, 9, k.vidro, 'stroke="#cbd5e1" stroke-opacity="0.7" stroke-width="1.4"'),
        '<path d="M68 57h27M105 57h27" stroke="#9fb0c7" stroke-width="2.8" stroke-linecap="round"/>',
        '<path d="M98 57l6 -4M102 57l-6 4" stroke="#9fb0c7" stroke-width="2" stroke-linecap="round"/>',
        sr(86, 24, 14, 9, 2, "#ef4444"),
        sr(100, 24, 14, 9, 2, "#60a5fa"),
        '<path d="M88 39q12 -5 24 0" fill="none" stroke="' + k.acc + '" stroke-width="1.8" stroke-dasharray="3 3"/>'
      ];
    },
    "hall-digital": function (k) {
      return [
        '<path d="M86 66v-20a14 14 0 0 1 28 0v20z" fill="#1f2937" stroke="#475569" stroke-width="1.2"/>',
        st(100, 56, "H", "#e2e8f0", 'font-size="13"'),
        '<path d="M90 66v14M100 66v14M110 66v14" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M124 44h5v10h5v-10h5" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linejoin="round"/>'
      ];
    },
    "hall-linear": function (k) {
      return [
        '<path d="M86 66v-20a14 14 0 0 1 28 0v20z" fill="#1f2937" stroke="#475569" stroke-width="1.2"/>',
        st(100, 56, "H", "#e2e8f0", 'font-size="13"'),
        '<path d="M90 66v14M100 66v14M110 66v14" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M122 60q10 0 16 -16" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M122 64h16" stroke="' + k.acc + '" stroke-width="1.4" opacity="0.5"/>'
      ];
    },
    "hall-trimpot": function (k) {
      return [
        sr(66, 40, 28, 22, 2, "#111827", 'stroke="#334155"'),
        st(80, 55, "393", "#cbd5e1", 'font-size="8"'),
        '<path d="M70 62v6M76 62v6M82 62v6M88 62v6" stroke="#9fb0c7" stroke-width="2"/>',
        sr(104, 36, 30, 30, 3, "#60a5fa", 'stroke="#bfdbfe" stroke-width="1.4"'),
        sc(119, 51, 9, "#1e3a8a"),
        '<path d="M112 51h14M119 44v14" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M92 32q8 -6 16 0" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-dasharray="3 3"/>'
      ];
    },
    "ptc": function (k) {
      return [
        sc(100, 52, 10, "#f59e0b", 'stroke="#b45309" stroke-width="1.6"'),
        sc(96, 48, 3, "#fde68a"),
        '<path d="M94 61l-5 15M106 61l5 15" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M84 32q4 -6 8 0t8 0t8 0" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>',
        '<path d="M78 44q4 -6 8 0t8 0" fill="none" stroke="' + k.acc + '" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>'
      ];
    },
    "ptc-ajuste": function (k) {
      return [
        sr(66, 62, 30, 16, 2, "#111827", 'stroke="#334155"'),
        st(81, 74, "393", "#cbd5e1", 'font-size="8"'),
        sc(102, 42, 8, "#f59e0b", 'stroke="#b45309" stroke-width="1.4"'),
        '<path d="M97 49l-3 10M107 49l3 10" stroke="#9fb0c7" stroke-width="2.4"/>',
        sr(112, 54, 26, 26, 3, "#60a5fa", 'stroke="#bfdbfe" stroke-width="1.4"'),
        sc(125, 67, 8, "#1e3a8a"),
        '<path d="M119 67h12M125 61v12" stroke="#fbbf24" stroke-width="1.8"/>'
      ];
    },
    "ds18b20": function (k) {
      return [
        '<path d="M86 66v-20a14 14 0 0 1 28 0v20z" fill="#1f2937" stroke="#475569" stroke-width="1.2"/>',
        st(100, 58, "DS", "#e2e8f0", 'font-size="11"'),
        '<path d="M90 66v14M100 66v14M110 66v14" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M128 32v16" stroke="#cbd5e1" stroke-width="2.4" stroke-linecap="round"/>',
        sc(128, 54, 5, "#ef4444"),
        '<path d="M132 36h3M132 42h3" stroke="#cbd5e1" stroke-width="1.6"/>'
      ];
    },
    "dht11": function (k) {
      var s = [
        sr(84, 30, 32, 46, 3, "#dbeafe", 'stroke="#93c5fd" stroke-width="1.4"'),
        '<path d="M84 40h32" stroke="#93c5fd" stroke-width="1.2" opacity="0.7"/>'
      ];
      [44, 52, 60].forEach(function (y) {
        [90, 97, 104, 111].forEach(function (x) {
          s.push(sc(x, y, 1.7, "#1e3a8a", 'opacity="0.75"'));
        });
      });
      s.push('<path d="M93 76v10M100 76v10M107 76v10" stroke="#9fb0c7" stroke-width="2.4" stroke-linecap="round"/>');
      return s;
    },
    "chama": function (k) {
      return ledDomo(100, 50, 16).concat([
        '<path d="M100 36c7 8 11 12 11 19a11 11 0 0 1 -22 0c0 -7 5 -9 11 -19z" fill="#fb923c"/>',
        '<path d="M100 47c3.5 5 5.5 7 5.5 10.5a5.5 5.5 0 0 1 -11 0c0 -3.5 2.5 -4.5 5.5 -10.5z" fill="#fde68a"/>',
        '<path d="M126 40q6 7 0 14M133 32q9 11 0 22" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round" opacity="0.85"/>'
      ]);
    },
    "ldr": function (k) {
      return [
        sc(100, 54, 16, "#f8fafc", 'stroke="#cbd5e1" stroke-width="1.6"'),
        '<path d="M88 54l4 -6 4 12 4 -12 4 12 4 -12 4 6" fill="none" stroke="#b45309" stroke-width="2.2" stroke-linejoin="round"/>',
        '<path d="M94 70v10M106 70v10" stroke="#9fb0c7" stroke-width="2.6" stroke-linecap="round"/>',
        '<path d="M124 34l6 -6M128 46h8M120 24v-6" stroke="' + k.acc + '" stroke-width="2.2" stroke-linecap="round"/>'
      ];
    },
    "receptor-ir": function (k) {
      return [
        sc(100, 50, 14, "#111827", 'stroke="#334155" stroke-width="1.4"'),
        sc(100, 46, 7, "#1f2937"),
        '<path d="M96 42a6 6 0 0 1 8 0" fill="none" stroke="#64748b" stroke-width="1.6"/>',
        '<path d="M94 64v12M100 64v12M106 64v12" stroke="#9fb0c7" stroke-width="2.4" stroke-linecap="round"/>',
        '<path d="M120 44h4v8h4v-8h4v8h4" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linejoin="round"/>',
        st(132, 66, "38k", "rgba(148,163,184,0.85)", 'font-size="7"')
      ];
    },
    "obstaculo-ir": function (k) {
      return [
        sc(84, 58, 11, "rgba(226,232,240,0.3)", 'stroke="#e2e8f0" stroke-opacity="0.7" stroke-width="1.2"'),
        sc(84, 58, 5, "#ef4444"),
        sc(116, 58, 11, "#111827", 'stroke="#334155" stroke-width="1.2"'),
        sc(116, 58, 5, "#1f2937"),
        '<path d="M92 52 142 24" stroke="#f87171" stroke-width="2" stroke-dasharray="5 4"/>',
        '<path d="M124 52 142 30" stroke="#fbbf24" stroke-width="2" stroke-dasharray="5 4"/>',
        sr(142, 14, 9, 28, 2, "#9fb0c7")
      ];
    },
    "seguidor-linha": function (k) {
      return [
        sr(76, 34, 18, 22, 3, "#1f2937", 'stroke="#475569"'),
        sc(85, 45, 4.5, "#ef4444"),
        sr(106, 34, 18, 22, 3, "#1f2937", 'stroke="#475569"'),
        sc(115, 45, 4.5, "#111827"),
        '<path d="M85 58v12M115 58v12" stroke="' + k.acc + '" stroke-width="2" stroke-dasharray="4 3"/>',
        sr(62, 76, 76, 14, 3, "#e2e8f0"),
        sr(62, 81, 76, 6, 0, "#0f172a"),
        '<path d="M81 74l4 -4M119 74l-4 -4" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "batimentos": function (k) {
      return [
        '<path d="M100 74 82 56a11 11 0 0 1 18 -8a11 11 0 0 1 18 8z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.4"/>',
        '<path d="M62 34h14l4 -8 6 16 5 -10h9" fill="none" stroke="#fecaca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        '<path d="M124 40q5 6 0 12" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "mic-pequeno": function (k) {
      return [
        sc(100, 52, 16, k.metal, 'stroke="#64748b" stroke-width="1.2"'),
        sc(100, 52, 12, "#1f2937"),
        sc(95, 48, 1.6, "#94a3b8"),
        sc(100, 48, 1.6, "#94a3b8"),
        sc(105, 48, 1.6, "#94a3b8"),
        '<path d="M94 68v10M106 68v10" stroke="#9fb0c7" stroke-width="2.4" stroke-linecap="round"/>',
        '<path d="M124 42q7 10 0 20M132 34q11 18 0 36" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "mic-grande": function (k) {
      return [
        sc(82, 46, 11, k.metal, 'stroke="#64748b"'),
        sc(82, 46, 8, "#1f2937"),
        '<path d="M78 57v9M86 57v9" stroke="#9fb0c7" stroke-width="2.2"/>',
        sr(64, 64, 30, 16, 2, "#111827", 'stroke="#334155"'),
        st(79, 76, "393", "#cbd5e1", 'font-size="8"'),
        sr(108, 40, 24, 24, 3, "#60a5fa", 'stroke="#bfdbfe" stroke-width="1.4"'),
        sc(120, 52, 7, "#1e3a8a"),
        '<path d="M115 52h10M120 47v10" stroke="#fbbf24" stroke-width="1.8"/>',
        '<path d="M136 34q6 12 0 24" fill="none" stroke="' + k.acc + '" stroke-width="2" stroke-linecap="round"/>'
      ];
    },
    "rele": function (k) {
      return [
        sr(72, 34, 46, 40, 3, "#1d4ed8", 'stroke="#1e3a8a" stroke-width="1.4"'),
        sr(79, 42, 32, 22, 1, "#dbeafe"),
        st(95, 58, "5V", "#1e3a8a", 'font-size="10"'),
        '<path d="M84 68q4 -5 8 0t8 0" fill="none" stroke="#bfdbfe" stroke-width="2"/>',
        sc(130, 42, 6.5, "#fbbf24", 'stroke="#b45309"'),
        '<path d="M127 42h6" stroke="#92400e" stroke-width="2"/>',
        sc(130, 58, 6.5, "#fbbf24", 'stroke="#b45309"'),
        '<path d="M127 58h6" stroke="#92400e" stroke-width="2"/>',
        sc(130, 74, 6.5, "#fbbf24", 'stroke="#b45309"'),
        '<path d="M127 74h6" stroke="#92400e" stroke-width="2"/>',
        '<path d="M118 42h6M118 58h6M118 74h6" stroke="#93c5fd" stroke-width="1.6"/>'
      ];
    }
  };

  function figuraSensor(sensor) {
    var dado = sensor && typeof sensor === "object" ? sensor : {};
    var chave = limpo(dado.visual, "");
    var desenho = FIGURAS[chave];
    if (!desenho) return "";
    var tipo = dado.tipo === "analogico" || dado.tipo === "especial" ? dado.tipo : "digital";
    var id = uid("sensor");
    var k = {
      placa: "url(#" + id + "-placa)",
      metal: "url(#" + id + "-metal)",
      vidro: "url(#" + id + "-vidro)",
      sombra: "url(#" + id + "-sombra)",
      acc: ACC_SENSOR[tipo]
    };
    var pinos = Array.isArray(dado.ligacao) ? dado.ligacao.length : 3;
    var rotulo = limpo(dado.aparencia, "Módulo de sensor sobre placa azul com conector de pinos.");
    var s = [];
    s.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 2 160 134" class="sensor-svg" role="img" aria-label="' + esc(rotulo) + '" focusable="false">');
    s.push('<defs>');
    s.push('<linearGradient id="' + id + '-placa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#16307a"/></linearGradient>');
    s.push('<linearGradient id="' + id + '-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset="0.45" stop-color="#a8b5c7"/><stop offset="1" stop-color="#66748b"/></linearGradient>');
    s.push('<linearGradient id="' + id + '-vidro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0" stop-opacity="0.42"/><stop offset="1" stop-color="#94a3b8" stop-opacity="0.16"/></linearGradient>');
    s.push('<radialGradient id="' + id + '-sombra"><stop offset="0.35" stop-color="#020617" stop-opacity="0.4"/><stop offset="1" stop-color="#020617" stop-opacity="0"/></radialGradient>');
    s.push("</defs>");
    s.push(placaFundo(numero(dado.id, 0), k));
    s.push(desenho(k).join(""));
    s.push(conectorSensor(pinos));
    s.push("</svg>");
    return s.join("");
  }

  /* ------------------------------------------------------------------
     ÍCONES — 24 x 24 lineares
     ------------------------------------------------------------------ */
  var ICONES = {
    chip:
      '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>' +
      '<rect x="9.5" y="9.5" width="5" height="5" rx="1"/>' +
      '<path d="M9 6.5v-3M12 6.5v-3M15 6.5v-3M9 17.5v3M12 17.5v3M15 17.5v3M6.5 9h-3M6.5 12h-3M6.5 15h-3M17.5 9h3M17.5 12h3M17.5 15h3"/>',
    nfc:
      '<circle cx="7.2" cy="12" r="1.3" fill="currentColor" stroke="none"/>' +
      '<path d="M10.5 8.5a5 5 0 0 1 0 7"/><path d="M13.5 5.5a9 9 0 0 1 0 13"/><path d="M16.5 2.8a13 13 0 0 1 0 18.4"/>',
    led:
      '<circle cx="12" cy="10" r="4"/>' +
      '<path d="M9.8 13.6 9 20M14.2 13.6 15 20M7.5 20h9M8.5 8 6 6.5M15.5 8 18 6.5M12 4.5V2"/>',
    box:
      '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
    database:
      '<ellipse cx="12" cy="5.5" rx="7" ry="3"/>' +
      '<path d="M5 5.5v13c0 1.66 3.13 3 7 3s7-1.34 7-3v-13"/>' +
      '<path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3"/>',
    card:
      '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 9.5h18M6.5 15h4"/>',
    flash:
      '<path d="M13.5 2.5 5.5 13.5h5L10 21.5l8-11h-5l.5-8Z"/>',
    check: '<path d="M4.5 12.5 9 17l10-10"/>',
    log:
      '<path d="M5 6.5h14M5 12h14M5 17.5h14"/><circle cx="2.6" cy="6.5" r=".9" fill="currentColor" stroke="none"/><circle cx="2.6" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="2.6" cy="17.5" r=".9" fill="currentColor" stroke="none"/>',
    cloud:
      '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 10.2a4.2 4.2 0 0 1-.2 8.3H7Z"/>',
    search:
      '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.4 15.4 4.4 4.4"/>',
    print:
      '<path d="M7 8V3.5h10V8"/><rect x="4" y="8" width="16" height="8" rx="2"/>' +
      '<rect x="7.5" y="13.5" width="9" height="7" rx="1.5"/><circle cx="17" cy="11" r=".9" fill="currentColor" stroke="none"/>',
    copy:
      '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/>' +
      '<path d="M6 15.5H5A1.5 1.5 0 0 1 3.5 14V5A1.5 1.5 0 0 1 5 3.5h9A1.5 1.5 0 0 1 15.5 5v1"/>',
    reset:
      '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 3.5V9h5.5"/>',
    pin:
      '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    star:
      '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    lock:
      '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>' +
      '<circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>',
    papel:
      '<path d="M6 3.5h7.5L18 8v12.5H6V3.5Z"/><path d="M13.5 3.5V8H18M9 12h6M9 15.5h6"/>',
    escrita:
      '<path d="m4 20 1.2-4.2L16 5a2.1 2.1 0 0 1 3 3L8.2 18.8 4 20Z"/><path d="m14.5 6.5 3 3"/>',
    simulacao:
      '<path d="M9.5 3h5M10.5 3v5.5L5.4 18a2 2 0 0 0 1.7 3h9.8a2 2 0 0 0 1.7-3l-5.1-9.5V3"/><path d="M7.4 15.5h9.2"/>',
    montagem:
      '<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6l-2.8 2.8-2.8-2.8 2.6-2.8Z"/>',
    estrutura:
      '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9h17M3.5 15h17M9 3.5v17M15 3.5v17"/>',
    warning:
      '<path d="M12 3.5 21 20H3L12 3.5Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/>',
    info:
      '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none"/>',
    wifi:
      '<path d="M3.5 9a13 13 0 0 1 17 0M6.5 12.3a8.5 8.5 0 0 1 11 0M9.5 15.5a4 4 0 0 1 5 0"/>' +
      '<circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/>',
    passaporte:
      '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="9.5" r="2.5"/><path d="M8 15.5h8M8 18h5"/>',
    roleta:
      '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v4M12 20.5v-4M3.5 12h4M20.5 12h-4"/><path d="m12 12 4.5-4.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    sensor:
      '<rect x="6" y="7" width="12" height="10" rx="2"/><path d="M9 17v3M12 17v3M15 17v3"/><circle cx="12" cy="12" r="2.2"/>',
    notebook:
      '<rect x="4.5" y="4" width="15" height="11" rx="1.5"/><path d="M2.5 19.5h19M8 15.5l-1 4M16 15.5l1 4"/>',
    offline:
      '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 10.2a4.2 4.2 0 0 1-.2 8.3H7Z"/><path d="m3.5 3.5 17 17"/>',
    power:
      '<path d="M12 3v8"/><path d="M6.8 6.2a7.5 7.5 0 1 0 10.4 0"/>'
  };

  function icone(nome) {
    if (typeof nome !== "string") return "";
    var chave = nome.trim().toLowerCase();
    var corpo = ICONES[chave];
    if (!corpo) return "";
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="arte-icone" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + corpo + "</svg>"
    );
  }

  function fatia(cx, cy, r, inicio, fim) {
    var a = ponto(cx, cy, r, inicio);
    var b = ponto(cx, cy, r, fim);
    var longo = Math.abs(fim - inicio) > 180 ? 1 : 0;
    return (
      "M" + cx + " " + cy + " L" + a[0] + " " + a[1] + " A" + r + " " + r + " 0 " + longo + " 1 " +
      b[0] + " " + b[1] + " Z"
    );
  }

  function ponto(cx, cy, r, graus) {
    var rad = (graus * Math.PI) / 180;
    return [Math.round((cx + r * Math.cos(rad)) * 100) / 100, Math.round((cy + r * Math.sin(rad)) * 100) / 100];
  }

  /* ------------------------------------------------------------------
     API
     ------------------------------------------------------------------ */
  var api = {
    hero: hero,
    planta: planta,
    cena: cena,
    mapaPinos: mapaPinos,
    roleta: roleta,
    figuraSensor: figuraSensor,
    icone: icone
  };

  root.FEIRA = root.FEIRA || {};
  root.FEIRA.art = api;

  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
