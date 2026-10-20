/* ==========================================================================
   MUNDO MAKER — FEIRA DE EXPOSIÇÃO
   Orquestração da página: renderização, deck, checklist, passaporte e eventos.
   ========================================================================== */
(function (root, document) {
  "use strict";

  const FEIRA = root.FEIRA = root.FEIRA || {};
  const dados = FEIRA.data;
  const logic = FEIRA.logic || {};

  const $ = function (seletor, contexto) {
    return (contexto || document).querySelector(seletor);
  };
  const $$ = function (seletor, contexto) {
    return Array.prototype.slice.call((contexto || document).querySelectorAll(seletor));
  };

  function esc(valor) {
    return String(valor == null ? "" : valor).replace(/[&<>"']/g, function (caractere) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caractere];
    });
  }

  function lerJson(chave, padrao) {
    try {
      const bruto = localStorage.getItem(chave);
      if (!bruto) return padrao;
      const valor = JSON.parse(bruto);
      return valor == null ? padrao : valor;
    } catch (erro) {
      return padrao;
    }
  }

  function lerTexto(chave, padrao) {
    try {
      const valor = localStorage.getItem(chave);
      return valor == null ? padrao : valor;
    } catch (erro) {
      return padrao;
    }
  }

  function salvar(chave, valor, textoSimples) {
    try {
      localStorage.setItem(chave, textoSimples ? String(valor) : JSON.stringify(valor));
    } catch (erro) {
      /* modo privado ou armazenamento cheio: segue em memória */
    }
  }

  const CHAVES = {
    tema: "feira:v1:tema",
    materiais: "feira:v1:materiais",
    passaporte: "feira:v1:passaporte",
    nome: "feira:v1:nome-certificado"
  };

  const estado = {
    tema: document.documentElement.getAttribute("data-tema") === "claro" ? "claro" : "escuro",
    estacaoAtiva: 1,
    plantaSelecionada: null,
    materiaisFiltro: "todos",
    marcados: {},
    passaporte: [],
    nomeCertificado: "Visitante",
    sensores: { busca: "", tipo: "todos", categoria: "todas" }
  };

  let toastTimer = null;
  let frameScroll = 0;

  /* ---------------------------------------------------------------------
     Utilidades de UI
     --------------------------------------------------------------------- */
  function toast(mensagem) {
    const elemento = $("#toast");
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.hidden = false;
    requestAnimationFrame(function () { elemento.classList.add("visivel"); });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      elemento.classList.remove("visivel");
      window.setTimeout(function () { elemento.hidden = true; }, 230);
    }, 2800);
  }

  function aplicarTema(tema, persistir) {
    const escolhido = tema === "claro" ? "claro" : "escuro";
    estado.tema = escolhido;
    document.documentElement.setAttribute("data-tema", escolhido);
    const botao = $("#tema-botao");
    if (botao) {
      botao.setAttribute("aria-pressed", escolhido === "claro" ? "true" : "false");
      botao.setAttribute("aria-label", escolhido === "claro" ? "Ativar tema escuro" : "Ativar tema claro");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", escolhido === "claro" ? "#f4f7fb" : "#070d19");
    if (persistir) salvar(CHAVES.tema, escolhido, true);
  }

  function imprimir(modo) {
    const classe = "modo-impressao-" + modo;
    document.body.classList.add(classe);
    const limpar = function () {
      document.body.classList.remove(classe);
      window.removeEventListener("afterprint", limpar);
    };
    window.addEventListener("afterprint", limpar);
    window.setTimeout(function () {
      window.print();
      window.setTimeout(limpar, 800);
    }, 80);
  }

  /* ---------------------------------------------------------------------
     Conteúdo estático vindo de data.js
     --------------------------------------------------------------------- */
  function preencherMeta() {
    const meta = dados.meta || {};
    $$("[data-meta]").forEach(function (elemento) {
      const chave = elemento.getAttribute("data-meta");
      if (meta[chave]) elemento.textContent = meta[chave];
    });
    if (meta.aviso) {
      const heroMeta = $(".hero-meta");
      if (heroMeta) heroMeta.setAttribute("title", meta.aviso);
    }
  }

  function desenharArtes() {
    const art = FEIRA.art || {};
    const hero = $("#hero-arte");
    if (hero && typeof art.hero === "function") {
      const svg = art.hero();
      if (svg) hero.innerHTML = svg;
    }
  }

  /* ---------------------------------------------------------------------
     PLANTA
     --------------------------------------------------------------------- */
  function renderizarPlanta() {
    const alvo = $("#planta-arte");
    const art = FEIRA.art || {};
    if (!alvo) return;
    if (typeof art.planta !== "function") return;
    const svg = art.planta(dados.estacoes);
    if (!svg) return;
    alvo.innerHTML = svg;

    alvo.addEventListener("click", function (evento) {
      const grupo = evento.target.closest("[data-estacao-mesa]");
      if (!grupo) return;
      selecionarNoMapa(grupo.getAttribute("data-estacao-mesa"));
    });
    alvo.addEventListener("keydown", function (evento) {
      if (evento.key !== "Enter" && evento.key !== " ") return;
      const grupo = evento.target.closest("[data-estacao-mesa]");
      if (!grupo) return;
      evento.preventDefault();
      selecionarNoMapa(grupo.getAttribute("data-estacao-mesa"));
    });

    selecionarNoMapa(dados.estacoes[0].id);
  }

  function estacaoPorId(id) {
    return dados.estacoes.find(function (estacao) { return estacao.id === id; }) || null;
  }

  function seloHardware(estacao, compacto) {
    if (!estacao) return "";
    if (estacao.aoVivo) {
      return '<span class="tag tag--ao-vivo' + (compacto ? " tag--mini" : "") + '">● AO VIVO' + (compacto ? "" : " · kit físico") + '</span>';
    }
    if (estacao.espelho) {
      return '<span class="tag tag--espelho' + (compacto ? " tag--mini" : "") + '">◉ ' + (compacto ? "PAINEL" : "PAINEL ESPELHADO") + '</span>';
    }
    return "";
  }

  function selecionarNoMapa(id) {
    const estacao = estacaoPorId(id);
    if (!estacao) return;
    estado.plantaSelecionada = id;

    $$("#planta-arte [data-estacao-mesa]").forEach(function (grupo) {
      const ativo = grupo.getAttribute("data-estacao-mesa") === id;
      grupo.classList.toggle("selecionada", ativo);
      grupo.setAttribute("aria-pressed", ativo ? "true" : "false");
    });

    const info = $("#planta-info");
    if (!info) return;
    const visitante = (estacao.visitante || []).slice(0, 2).map(function (item) {
      return "<li>" + esc(item) + "</li>";
    }).join("");
    const selo = seloHardware(estacao, false);

    info.innerHTML =
      '<div class="planta-info-conteudo cor-' + esc(estacao.cor) + '">' +
        '<div class="planta-info-topo">' +
          '<span class="estacao-mini-num">' + esc(estacao.numero) + '</span>' +
          '<span class="estacao-tema">' + esc(estacao.equipe) + '</span>' +
          (selo ? '<span class="planta-info-selo">' + selo + '</span>' : '') +
        '</div>' +
        '<h3>' + esc(estacao.nome) + '</h3>' +
        '<p class="resumo">' + esc(estacao.resumo) + '</p>' +
        '<ul class="planta-info-lista">' + visitante + '</ul>' +
        '<button class="btn btn--primario btn--mini" type="button" data-ir-estacao="' + esc(estacao.numero) + '">Abrir estação →</button>' +
      '</div>';
  }

  function abrirPlantaAmpliada() {
    const origem = $("#planta-arte svg");
    const dialogo = $("#planta-dialog");
    const alvo = $("#planta-ampliada");
    if (!origem || !dialogo || !alvo) return;

    const clone = origem.cloneNode(true);
    clone.querySelectorAll("[id]").forEach(function (elemento) {
      elemento.id = elemento.id + "--modal";
    });
    clone.querySelectorAll("[data-estacao-mesa]").forEach(function (grupo) {
      grupo.removeAttribute("tabindex");
      grupo.removeAttribute("role");
      grupo.removeAttribute("data-estacao-mesa");
      grupo.setAttribute("aria-hidden", "true");
    });
    let html = clone.outerHTML.replace(/url\(#([^)]+)\)/g, function (marca, id) {
      return "url(#" + id + "--modal)";
    });
    alvo.innerHTML = html;

    if (typeof dialogo.showModal === "function") {
      try { dialogo.showModal(); } catch (erro) { dialogo.setAttribute("open", ""); }
    } else {
      dialogo.setAttribute("open", "");
    }
    const fechar = $("#planta-fechar");
    if (fechar) fechar.focus();
  }

  function fecharPlantaAmpliada() {
    const dialogo = $("#planta-dialog");
    if (!dialogo) return;
    if (typeof dialogo.close === "function") dialogo.close();
    else dialogo.removeAttribute("open");
  }

  function baixarPlanta() {
    const svg = $("#planta-arte svg");
    if (!svg) { toast("A planta ainda não carregou."); return; }
    try {
      const clone = svg.cloneNode(true);
      const originais = [svg].concat($$("*", svg));
      const copias = [clone].concat($$("*", clone));
      const propriedades = [
        "fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity",
        "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity",
        "font-family", "font-size", "font-weight", "letter-spacing",
        "text-anchor", "dominant-baseline", "paint-order"
      ];
      originais.forEach(function (original, indice) {
        const copia = copias[indice];
        if (!copia) return;
        const calculado = window.getComputedStyle(original);
        const estilos = propriedades.map(function (propriedade) {
          return propriedade + ":" + calculado.getPropertyValue(propriedade);
        }).join(";");
        copia.setAttribute("style", estilos);
        copia.removeAttribute("class");
      });

      const viewBox = svg.viewBox && svg.viewBox.baseVal;
      const largura = viewBox && viewBox.width ? viewBox.width : 1000;
      const altura = viewBox && viewBox.height ? viewBox.height : 680;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", largura);
      clone.setAttribute("height", altura);

      const fundo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      fundo.setAttribute("x", "0");
      fundo.setAttribute("y", "0");
      fundo.setAttribute("width", "100%");
      fundo.setAttribute("height", "100%");
      fundo.setAttribute("fill", estado.tema === "claro" ? "#f4f7fb" : "#0a1222");
      clone.insertBefore(fundo, clone.firstChild);

      const conteudo = new XMLSerializer().serializeToString(clone);
      const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + conteudo], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "planta-feira-mundo-maker.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast("Planta baixada em SVG.");
    } catch (erro) {
      toast("Não foi possível baixar a planta neste navegador.");
    }
  }

  /* ---------------------------------------------------------------------
     DECK DAS ESTAÇÕES
     --------------------------------------------------------------------- */
  function renderizarDeck() {
    const abas = $("#deck-abas");
    const palco = $("#deck-palco");
    const deck = $("#deck");
    if (!abas || !palco || !deck) return;

    abas.innerHTML = dados.estacoes.map(function (estacao, indice) {
      const selo = seloHardware(estacao, true);
      return '<button class="deck-aba cor-' + esc(estacao.cor) + '" id="aba-estacao-' + esc(estacao.numero) + '" type="button" role="tab" ' +
        'aria-selected="' + (indice === 0 ? "true" : "false") + '" aria-controls="painel-estacao-' + esc(estacao.numero) + '" ' +
        'data-indice="' + indice + '" tabindex="' + (indice === 0 ? "0" : "-1") + '">' +
        '<span class="deck-aba-num"><span class="deck-aba-numero">' + String(estacao.numero).padStart(2, "0") + '</span><span class="deck-aba-equipe"> · ' + esc(estacao.equipe).toUpperCase() + '</span></span>' +
        '<span class="deck-aba-nome">' + esc(estacao.nome) + '</span>' +
        (selo ? '<span class="deck-aba-selo">' + selo + '</span>' : '') +
        '<span class="deck-aba-tema">' + esc(estacao.tema) + '</span>' +
      '</button>';
    }).join("");

    palco.innerHTML = dados.estacoes.map(function (estacao, indice) {
      return montarSlideEstacao(estacao, indice);
    }).join("");

    deck.insertAdjacentHTML("beforeend",
      '<div class="deck-rodape">' +
        '<div class="deck-pontos" role="group" aria-label="Ir para uma estação">' +
          dados.estacoes.map(function (estacao, indice) {
            return '<button class="deck-ponto cor-' + esc(estacao.cor) + '" type="button" data-indice="' + indice + '" ' +
              'aria-label="Ir para a estação ' + esc(estacao.numero) + ': ' + esc(estacao.nome) + '" ' +
              (indice === 0 ? 'aria-current="true"' : "") + '></button>';
          }).join("") +
        '</div>' +
        '<p class="deck-rodape-texto" id="deck-rodape-texto">Estação 1 de ' + dados.estacoes.length + ' · use as abas ou as setas do teclado</p>' +
      '</div>');

    // Abas principais: clique e teclado
    abas.addEventListener("click", function (evento) {
      const aba = evento.target.closest(".deck-aba");
      if (!aba) return;
      ativarEstacao(Number(aba.getAttribute("data-indice")), { hash: true });
    });
    abas.addEventListener("keydown", navegarAbas);

    // Pontos do rodapé
    $$("#deck .deck-ponto").forEach(function (ponto) {
      ponto.addEventListener("click", function () {
        ativarEstacao(Number(ponto.getAttribute("data-indice")), { hash: true });
      });
    });

    // Abas internas de cada estação
    palco.addEventListener("click", function (evento) {
      const aba = evento.target.closest(".aba-estacao");
      if (!aba) return;
      const slide = aba.closest(".estacao-slide");
      if (!slide) return;
      const painelId = aba.getAttribute("aria-controls");
      $$(".aba-estacao", slide).forEach(function (botao) {
        botao.setAttribute("aria-selected", botao === aba ? "true" : "false");
        botao.tabIndex = botao === aba ? 0 : -1;
      });
      $$(".painel-estacao", slide).forEach(function (painel) {
        painel.hidden = painel.id !== painelId;
      });
    });
    palco.addEventListener("keydown", function (evento) {
      const aba = evento.target.closest(".aba-estacao");
      if (!aba) return;
      const abasInternas = $$(".aba-estacao", aba.closest(".estacao-slide"));
      const atual = abasInternas.indexOf(aba);
      let destino = null;
      if (evento.key === "ArrowRight") destino = (atual + 1) % abasInternas.length;
      else if (evento.key === "ArrowLeft") destino = (atual - 1 + abasInternas.length) % abasInternas.length;
      else if (evento.key === "Home") destino = 0;
      else if (evento.key === "End") destino = abasInternas.length - 1;
      if (destino == null) return;
      evento.preventDefault();
      abasInternas[destino].click();
      abasInternas[destino].focus();
    });

    // Carimbar passaporte
    palco.addEventListener("click", function (evento) {
      const botao = evento.target.closest("[data-carimbar]");
      if (!botao) return;
      carimbar(botao.getAttribute("data-carimbar"));
    });

    // Navegação anterior/próxima
    const anterior = $("#deck-anterior");
    const proxima = $("#deck-proxima");
    if (anterior) anterior.addEventListener("click", function () {
      ativarEstacao(logic.proximoIndice(estado.estacaoAtiva, dados.estacoes.length, -1), { hash: true, foco: false });
    });
    if (proxima) proxima.addEventListener("click", function () {
      ativarEstacao(logic.proximoIndice(estado.estacaoAtiva, dados.estacoes.length, 1), { hash: true, foco: false });
    });

    // Tela cheia
    const telaCheia = $("#deck-tela-cheia");
    if (telaCheia) {
      if (!deck.requestFullscreen) {
        telaCheia.hidden = true;
      } else {
        telaCheia.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen && document.exitFullscreen();
          } else {
            deck.requestFullscreen().catch(function () {
              toast("Este navegador não permitiu a tela cheia.");
            });
          }
        });
      }
    }

    ativarEstacao(estado.estacaoAtiva, { hash: false });
    atualizarBotoesCarimbo();
    if (FEIRA.games && typeof FEIRA.games.montarTodos === "function") {
      FEIRA.games.montarTodos(document);
    }
  }

  function montarSlideEstacao(estacao, indice) {
    const art = FEIRA.art || {};
    const svgCena = typeof art.cena === "function" ? art.cena(estacao) : "";
    const selo = seloHardware(estacao, false);
    const dica = estacao.dica
      ? '<p class="estacao-dica"><span aria-hidden="true">💡</span><span><strong>Dica:</strong> ' + esc(estacao.dica) + '</span></p>'
      : "";

    const paineis = [
      { id: "visitante", rotulo: "Para o visitante", itens: estacao.visitante, tipo: "lista" },
      { id: "montagem", rotulo: "Como montar", itens: estacao.montagem, tipo: "lista" },
      { id: "materiais", rotulo: "Materiais usados", itens: estacao.materiais, tipo: "chips" }
    ];
    if (estacao.numero === 1 && typeof art.mapaPinos === "function") {
      const mapa = art.mapaPinos(dados.pinos);
      if (mapa) paineis.push({ id: "pinos", rotulo: "Mapa de pinos", html: mapa });
    }

    const abas = paineis.map(function (painel, posicao) {
      return '<button class="aba-estacao" type="button" role="tab" id="tab-' + esc(painel.id) + '-' + esc(estacao.id) + '" ' +
        'aria-selected="' + (posicao === 0 ? "true" : "false") + '" aria-controls="painel-' + esc(painel.id) + '-' + esc(estacao.id) + '" ' +
        'data-aba="' + esc(painel.id) + '" tabindex="' + (posicao === 0 ? "0" : "-1") + '">' + esc(painel.rotulo) + '</button>';
    }).join("");

    const conteudos = paineis.map(function (painel, posicao) {
      let corpo = "";
      if (painel.html) {
        corpo = '<div class="mapa-pinos">' + painel.html + '</div>';
      } else if (painel.tipo === "chips") {
        corpo = '<ul class="lista-materiais">' + (painel.itens || []).map(function (item) {
          return '<li class="chip">' + esc(item) + '</li>';
        }).join("") + '</ul>';
      } else {
        corpo = '<ul>' + (painel.itens || []).map(function (item) {
          return '<li>' + esc(item) + '</li>';
        }).join("") + '</ul>';
      }
      return '<div class="painel-estacao" id="painel-' + esc(painel.id) + '-' + esc(estacao.id) + '" role="tabpanel" ' +
        'aria-labelledby="tab-' + esc(painel.id) + '-' + esc(estacao.id) + '" data-painel="' + esc(painel.id) + '" ' +
        (posicao === 0 ? "" : "hidden") + '>' + corpo + '</div>';
    }).join("");

    return '<article class="estacao-slide cor-' + esc(estacao.cor) + '" id="painel-estacao-' + esc(estacao.numero) + '" ' +
      'role="tabpanel" aria-labelledby="aba-estacao-' + esc(estacao.numero) + '" data-estacao="' + esc(estacao.id) + '" ' +
      (indice === 0 ? "" : "hidden") + '>' +
      '<div class="estacao-visual">' +
        '<span class="estacao-selo">Estação ' + esc(estacao.numero) + ' · ' + esc(estacao.equipe) + '</span>' +
        (selo ? '<span class="estacao-hardware">' + selo + '</span>' : '') +
        '<div class="estacao-cena">' + (svgCena || '<p class="cena-legenda">Ilustração em breve.</p>') + '</div>' +
        '<p class="cena-legenda">Ilustração da montagem — não é foto real.</p>' +
        '<div class="estacao-carimbo">' +
          '<button class="btn btn--primario btn--bloco" type="button" data-carimbar="' + esc(estacao.id) + '">Carimbar passaporte</button>' +
        '</div>' +
      '</div>' +
      '<div class="estacao-conteudo">' +
        '<p class="eyebrow">' + esc(estacao.equipe) + ' · Estação ' + esc(estacao.numero) + '</p>' +
        '<h3>' + esc(estacao.nome) + '</h3>' +
        '<p class="estacao-tema">' + esc(estacao.tema) + '</p>' +
        '<p class="estacao-resumo">' + esc(estacao.resumo) + '</p>' +
        '<div class="estacao-abas" role="tablist" aria-label="Detalhes da estação ' + esc(estacao.numero) + '">' + abas + '</div>' +
        conteudos +
        '<div class="demo" data-demo="' + esc(estacao.demo) + '" data-estacao="' + esc(estacao.numero) + '" data-estacao-id="' + esc(estacao.id) + '"></div>' +
        dica +
      '</div>' +
    '</article>';
  }

  function navegarAbas(evento) {
    const aba = evento.target.closest(".deck-aba");
    if (!aba) return;
    const abas = $$("#deck-abas .deck-aba");
    const atual = abas.indexOf(aba);
    let destino = null;
    if (evento.key === "ArrowRight") destino = (atual + 1) % abas.length;
    else if (evento.key === "ArrowLeft") destino = (atual - 1 + abas.length) % abas.length;
    else if (evento.key === "Home") destino = 0;
    else if (evento.key === "End") destino = abas.length - 1;
    if (destino == null) return;
    evento.preventDefault();
    ativarEstacao(destino, { hash: true, foco: true });
  }

  function ativarEstacao(indice, opcoes) {
    const config = opcoes || {};
    const total = dados.estacoes.length;
    const alvo = ((Number(indice) || 0) % total + total) % total;
    estado.estacaoAtiva = alvo;
    const estacao = dados.estacoes[alvo];

    $$("#deck-abas .deck-aba").forEach(function (aba, posicao) {
      const ativa = posicao === alvo;
      aba.setAttribute("aria-selected", ativa ? "true" : "false");
      aba.tabIndex = ativa ? 0 : -1;
    });
    $$("#deck-palco .estacao-slide").forEach(function (slide, posicao) {
      slide.hidden = posicao !== alvo;
    });
    $$("#deck .deck-ponto").forEach(function (ponto, posicao) {
      if (posicao === alvo) ponto.setAttribute("aria-current", "true");
      else ponto.removeAttribute("aria-current");
    });

    const status = $("#deck-status");
    if (status) status.textContent = "Estação " + estacao.numero + " de " + total + ": " + estacao.nome + ".";
    const rodape = $("#deck-rodape-texto");
    if (rodape) rodape.textContent = "Estação " + estacao.numero + " de " + total + " · use as abas ou as setas do teclado";
    const telaCheia = $("#deck-tela-cheia");
    if (telaCheia && document.fullscreenElement) {
      telaCheia.textContent = "Sair da tela cheia";
      telaCheia.setAttribute("aria-pressed", "true");
    }

    if (config.hash !== false) {
      try { history.replaceState(null, "", "#estacao-" + estacao.numero); } catch (erro) { /* file:// */ }
    }
    if (estacaoPorId(estado.plantaSelecionada) !== null) destacarMapa(estacao.id);
    if (config.hash !== false && window.matchMedia && window.matchMedia("(max-width: 760px)").matches) {
      const abaAtiva = $('#deck-abas .deck-aba[data-indice="' + alvo + '"]');
      if (abaAtiva && typeof abaAtiva.scrollIntoView === "function") {
        try { abaAtiva.scrollIntoView({ block: "nearest", inline: "center" }); } catch (erro) { /* ignora */ }
      }
    }
    if (config.foco) {
      const aba = $('#deck-abas .deck-aba[data-indice="' + alvo + '"]');
      if (aba) aba.focus();
    }
  }

  function destacarMapa(id) {
    $$("#planta-arte [data-estacao-mesa]").forEach(function (grupo) {
      const ativo = grupo.getAttribute("data-estacao-mesa") === id;
      grupo.classList.toggle("selecionada", ativo);
      grupo.setAttribute("aria-pressed", ativo ? "true" : "false");
    });
  }

  function renderizarResumo() {
    const corpo = $("#estacoes-resumo tbody");
    if (!corpo) return;
    corpo.innerHTML = dados.estacoes.map(function (estacao) {
      return '<tr class="cor-' + esc(estacao.cor) + '">' +
        '<td>' + esc(estacao.equipe) + '</td>' +
        '<td class="celula-estacao">' + esc(estacao.nome) + '</td>' +
        '<td>' + esc(estacao.tema) + '</td>' +
        '<td>' + esc((estacao.visitante || [])[0] || "") + '</td>' +
      '</tr>';
    }).join("");
  }

  /* ---------------------------------------------------------------------
     KIT AO VIVO
     --------------------------------------------------------------------- */
  function renderizarKitAoVivo() {
    const app = $("#kit-app");
    const kit = dados.kitAoVivo;
    if (!app || !kit) return;

    const estacaoAoVivo = estacaoPorId(kit.aoVivo);
    const estacaoEspelho = estacaoPorId(kit.espelho);
    const passos = (kit.passos || []).map(function (passo) {
      return "<li>" + esc(passo) + "</li>";
    }).join("");
    const cuidados = (kit.cuidados || []).map(function (cuidado) {
      return "<li>" + esc(cuidado) + "</li>";
    }).join("");
    const planoB = (kit.planoB || []).map(function (alternativa) {
      return "<li>" + esc(alternativa) + "</li>";
    }).join("");

    const tagAoVivo = estacaoAoVivo
      ? '● Estação ' + esc(estacaoAoVivo.numero) + ' · ' + esc(estacaoAoVivo.nome) + ' — AO VIVO'
      : "● AO VIVO";
    const tagEspelho = estacaoEspelho
      ? '◉ Estação ' + esc(estacaoEspelho.numero) + ' · ' + esc(estacaoEspelho.nome) + ' — PAINEL ESPELHADO'
      : "◉ PAINEL ESPELHADO";

    app.innerHTML =
      '<section class="kit-ao-vivo" data-kit="ao-vivo" aria-labelledby="kit-titulo">' +
        '<div class="kit-cabeca">' +
          '<div>' +
            '<p class="eyebrow">Hardware real</p>' +
            '<h3 id="kit-titulo">' + esc(kit.titulo) + '</h3>' +
            '<p class="kit-resumo">' + esc(kit.resumo) + '</p>' +
          '</div>' +
          '<div class="kit-selos">' +
            '<span class="tag tag--ao-vivo">' + tagAoVivo + '</span>' +
            '<span class="tag tag--espelho">' + tagEspelho + '</span>' +
          '</div>' +
        '</div>' +
        (kit.aviso ? '<p class="kit-aviso"><strong>Atenção:</strong> ' + esc(kit.aviso) + '</p>' : '') +
        '<div class="kit-grid">' +
          '<div class="kit-bloco">' +
            '<h4>Passo a passo</h4>' +
            '<ol class="kit-lista kit-passos">' + passos + '</ol>' +
          '</div>' +
          '<div class="kit-bloco">' +
            '<h4>Cuidados antes da feira</h4>' +
            '<ul class="kit-lista kit-cuidados">' + cuidados + '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="kit-bloco kit-plano-b">' +
          '<h4>Plano B</h4>' +
          '<ul class="kit-lista">' + planoB + '</ul>' +
        '</div>' +
        '<div class="kit-acoes">' +
          (estacaoAoVivo ? '<button class="btn btn--primario btn--mini" type="button" id="kit-ir-estacao">Ver a Estação ' + esc(estacaoAoVivo.numero) + '</button>' : '') +
          '<button class="btn btn--fantasma btn--mini" type="button" id="kit-imprimir">Imprimir checklist</button>' +
        '</div>' +
      '</section>';

    const irParaEstacao = $("#kit-ir-estacao");
    if (irParaEstacao && estacaoAoVivo) {
      irParaEstacao.addEventListener("click", function () {
        const indice = dados.estacoes.findIndex(function (estacao) { return estacao.id === estacaoAoVivo.id; });
        if (indice < 0) return;
        ativarEstacao(indice, { hash: true });
        const secao = $("#estacoes");
        if (secao) secao.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    const imprimirChecklist = $("#kit-imprimir");
    if (imprimirChecklist) imprimirChecklist.addEventListener("click", function () { imprimir("kit"); });
  }

  /* ---------------------------------------------------------------------
     SENSORES
     --------------------------------------------------------------------- */
  function renderizarSensores() {
    const app = $("#sensores-app");
    if (!app) return;
    const contagens = logic.contarPorTipo ? logic.contarPorTipo(dados.sensores) : { digital: 0, analogico: 0, especial: 0 };
    const categorias = [];
    dados.sensores.forEach(function (sensor) {
      if (categorias.indexOf(sensor.categoria) === -1) categorias.push(sensor.categoria);
    });

    app.innerHTML =
      '<div class="sensores-controles">' +
        '<label class="campo-busca">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16.5 16.5 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '<input type="search" id="sensores-busca" placeholder="Buscar sensor, função, categoria ou pino..." aria-label="Buscar sensor">' +
        '</label>' +
        '<div class="filtros" role="group" aria-label="Filtrar por tipo">' +
          '<button class="filtro" type="button" data-tipo="todos" aria-pressed="true">Todos <span class="filtro-conta">' + dados.sensores.length + '</span></button>' +
          '<button class="filtro" type="button" data-tipo="digital" aria-pressed="false">Digitais <span class="filtro-conta">' + contagens.digital + '</span></button>' +
          '<button class="filtro" type="button" data-tipo="analogico" aria-pressed="false">Analógicos <span class="filtro-conta">' + contagens.analogico + '</span></button>' +
          '<button class="filtro" type="button" data-tipo="especial" aria-pressed="false">Especiais <span class="filtro-conta">' + contagens.especial + '</span></button>' +
        '</div>' +
        '<div class="filtros" role="group" aria-label="Filtrar por categoria">' +
          '<button class="filtro" type="button" data-categoria="todas" aria-pressed="true">Todas as categorias</button>' +
          categorias.map(function (categoria) {
            return '<button class="filtro" type="button" data-categoria="' + esc(categoria) + '" aria-pressed="false">' + esc(categoria) + '</button>';
          }).join("") +
          '<button class="filtro filtro--limpar" type="button" id="sensores-limpar">Limpar filtros</button>' +
        '</div>' +
        '<p class="sensores-contagem" id="sensores-contagem" role="status" aria-live="polite"></p>' +
      '</div>' +
      '<div class="sensores-grade" id="sensores-grade"></div>';

    const busca = $("#sensores-busca");
    if (busca) {
      busca.addEventListener("input", function () {
        estado.sensores.busca = busca.value;
        renderizarGradeSensores();
      });
    }
    $$("[data-tipo]", app).forEach(function (botao) {
      botao.addEventListener("click", function () {
        estado.sensores.tipo = botao.getAttribute("data-tipo");
        $$("[data-tipo]", app).forEach(function (outro) {
          outro.setAttribute("aria-pressed", outro === botao ? "true" : "false");
        });
        renderizarGradeSensores();
      });
    });
    $$("[data-categoria]", app).forEach(function (botao) {
      botao.addEventListener("click", function () {
        estado.sensores.categoria = botao.getAttribute("data-categoria");
        $$("[data-categoria]", app).forEach(function (outro) {
          outro.setAttribute("aria-pressed", outro === botao ? "true" : "false");
        });
        renderizarGradeSensores();
      });
    });

    const limparFiltros = $("#sensores-limpar");
    if (limparFiltros) limparFiltros.addEventListener("click", function () {
      estado.sensores = { busca: "", tipo: "todos", categoria: "todas" };
      if (busca) busca.value = "";
      $$("[data-tipo]", app).forEach(function (botao) {
        botao.setAttribute("aria-pressed", botao.getAttribute("data-tipo") === "todos" ? "true" : "false");
      });
      $$("[data-categoria]", app).forEach(function (botao) {
        botao.setAttribute("aria-pressed", botao.getAttribute("data-categoria") === "todas" ? "true" : "false");
      });
      renderizarGradeSensores();
      if (busca) busca.focus();
    });

    renderizarGradeSensores();
  }

  function renderizarGradeSensores() {
    const grade = $("#sensores-grade");
    const contagem = $("#sensores-contagem");
    if (!grade) return;

    const busca = logic.normalizar ? logic.normalizar(estado.sensores.busca) : estado.sensores.busca.toLowerCase();
    const filtrados = dados.sensores.filter(function (sensor) {
      if (estado.sensores.tipo !== "todos" && sensor.tipo !== estado.sensores.tipo) return false;
      if (estado.sensores.categoria !== "todas" && sensor.categoria !== estado.sensores.categoria) return false;
      if (!busca) return true;
      const campos = [
        sensor.nome, sensor.categoria, sensor.descricao, sensor.ideia,
        (sensor.ligacao || []).map(function (item) { return item.gpio || item.linha; }).join(" ")
      ].join(" ");
      const normalizado = logic.normalizar ? logic.normalizar(campos) : campos.toLowerCase();
      return normalizado.indexOf(busca) !== -1;
    });

    if (contagem) {
      contagem.textContent = filtrados.length === dados.sensores.length
        ? "Mostrando os " + dados.sensores.length + " sensores."
        : "Mostrando " + filtrados.length + " de " + dados.sensores.length + " sensores.";
    }

    if (!filtrados.length) {
      grade.innerHTML = '<p class="sensores-vazio">Nenhum sensor encontrado. Tente outra busca ou limpe os filtros.</p>';
      return;
    }

    grade.innerHTML = filtrados.map(function (sensor) {
      const tipoRotulo = logic.formatarTipo ? logic.formatarTipo(sensor.tipo) : sensor.tipo;
      const ligacoes = (sensor.ligacao || []).map(function (item) {
        const rotulo = item.rotulo || item.linha;
        const classe = item.linha === "G" ? "g" : item.linha === "V" ? "v" : "s";
        const valor = item.gpio || item.valor || (item.linha === "G" ? "GND" : item.linha === "V" ? "3,3 V" : "S");
        return '<li><span class="pino-rotulo pino-rotulo--' + classe + '">' + esc(rotulo) + '</span> ' + esc(valor) + '</li>';
      }).join("");
      return '<article class="sensor-card" data-sensor-id="' + esc(sensor.id) + '">' +
        '<header class="sensor-cabeca">' +
          '<span class="sensor-num">' + String(sensor.id).padStart(2, "0") + '</span>' +
          '<div><h4>' + esc(sensor.nome) + '</h4><p class="sensor-cat">' + esc(sensor.categoria) + '</p></div>' +
          '<span class="tag tag--' + esc(sensor.tipo) + '">' + esc(tipoRotulo) + '</span>' +
        '</header>' +
        '<p class="sensor-desc">' + esc(sensor.descricao) + '</p>' +
        '<p class="sensor-ideia"><span aria-hidden="true">💡</span> ' + esc(sensor.ideia) + '</p>' +
        '<ul class="sensor-ligacao" aria-label="Como ligar">' + ligacoes + '</ul>' +
      '</article>';
    }).join("");
  }

  /* ---------------------------------------------------------------------
     MATERIAIS
     --------------------------------------------------------------------- */
  function renderizarMateriais() {
    const app = $("#materiais-app");
    if (!app || !dados.materiais) return;
    const prioritarios = dados.materiais.prioritarios || [];
    const extras = dados.materiais.extras || [];

    const todos = todosMateriais();
    const blocos = dados.materiais.blocos || [];
    const conferir = dados.materiais.conferir || {};
    const itensConferir = (conferir.ids || []).map(function (id) {
      return todos.find(function (material) { return material.id === id; });
    }).filter(Boolean);

    app.innerHTML =
      '<div class="materiais-topo">' +
        '<div class="materiais-progresso">' +
          '<p><strong id="materiais-marcados">0</strong> de ' + prioritarios.length + ' itens prioritários marcados</p>' +
          '<div class="progresso" id="materiais-progresso" role="progressbar" aria-valuemin="0" aria-valuemax="' + prioritarios.length + '" aria-valuenow="0" aria-label="Itens prioritários marcados"><span></span></div>' +
        '</div>' +
        '<div class="materiais-acoes">' +
          '<button class="btn btn--fantasma btn--mini" type="button" id="materiais-imprimir">Imprimir lista</button>' +
          '<button class="btn btn--fantasma btn--mini" type="button" id="materiais-copiar">Copiar lista</button>' +
          '<button class="btn btn--fantasma btn--mini" type="button" id="materiais-limpar">Limpar marcações</button>' +
        '</div>' +
      '</div>' +
      '<div class="materiais-filtros" role="group" aria-label="Filtrar materiais">' +
        '<button class="filtro" type="button" data-materiais-filtro="todos" aria-pressed="true">Tudo</button>' +
        '<button class="filtro" type="button" data-materiais-filtro="mesas" aria-pressed="false">Por mesa</button>' +
        '<button class="filtro" type="button" data-materiais-filtro="blocos" aria-pressed="false">Por bloco</button>' +
        '<button class="filtro" type="button" data-materiais-filtro="prioritarios" aria-pressed="false">Prioritários</button>' +
        '<button class="filtro" type="button" data-materiais-filtro="extras" aria-pressed="false">Complementares</button>' +
      '</div>' +
      '<p class="materiais-total"><strong>' + todos.length + ' itens no total:</strong> ' + prioritarios.length +
        ' prioritários do Material novo + ' + extras.length + ' complementares do Material Sugestão. ' +
        'A mesma lista aparece de dois jeitos: por mesa (para separar caixas) e por bloco (para comprar e montar).</p>' +

      /* ---- Visão 1: por mesa ---- */
      '<section class="materiais-secao" data-secao="mesas" aria-labelledby="materiais-mesas-titulo">' +
        '<div class="materiais-grupo-cabeca">' +
          '<h3 id="materiais-mesas-titulo">Material de cada mesa</h3>' +
          '<span class="tag tag--ativo">5 caixas + a sala</span>' +
        '</div>' +
        '<p class="materiais-guia">Separe um caixa por mesa e deixe o resto na caixa da sala, que fica com o professor. A Estação 2 é a única que também recebe o kit físico.</p>' +
        '<details class="caixa-estacao caixa-estacao--sala" data-caixa-estacao="sala">' +
          '<summary>' +
            '<span class="caixa-num" aria-hidden="true">⌂</span>' +
            '<span class="caixa-titulo">Material de sala (as cinco mesas)</span>' +
            '<span class="caixa-meta">' + materiaisDaSala().length + ' itens</span>' +
          '</summary>' +
          '<div class="materiais-grade caixa-grade">' + materiaisDaSala().map(function (material) {
            return montarMaterial(material, material.id.indexOf("p") !== 0);
          }).join("") + '</div>' +
        '</details>' +
        (dados.estacoes || []).map(montarCaixaEstacao).join("") +
      '</section>' +

      /* ---- Visão 2: por bloco ---- */
      '<section class="materiais-secao" data-secao="blocos" aria-labelledby="materiais-blocos-titulo">' +
        '<div class="materiais-grupo-cabeca">' +
          '<h3 id="materiais-blocos-titulo">Os mesmos itens, por bloco</h3>' +
          '<span class="tag tag--extra">como no Material Sugestão</span>' +
        '</div>' +
        blocos.map(function (bloco) {
          const itens = todos.filter(function (material) { return material.bloco === bloco.id; });
          return '<div class="materiais-bloco" data-bloco-material="' + esc(bloco.id) + '">' +
            '<h4>' + esc(bloco.titulo) + '</h4>' +
            '<p class="materiais-bloco-desc">' + esc(bloco.descricao) + '</p>' +
            '<div class="materiais-grade">' + itens.map(function (material) {
              return montarMaterial(material, material.id.indexOf("p") !== 0);
            }).join("") + '</div>' +
          '</div>';
        }).join("") +
      '</section>' +

      /* ---- Visão 3: origem da lista ---- */
      '<section class="materiais-secao" data-secao="origem" aria-labelledby="materiais-origem-titulo">' +
        '<div class="materiais-grupo-cabeca">' +
          '<h3 id="materiais-origem-titulo">De onde vem cada item</h3>' +
          '<span class="chip" id="extras-contagem">0 de ' + extras.length + ' marcados nos complementares</span>' +
        '</div>' +
        '<div class="materiais-origem">' +
          '<div class="materiais-grupo" data-bloco="prioritarios">' +
            '<h4>Prioritários — Material novo <span class="tag tag--ativo">' + prioritarios.length + '</span></h4>' +
            '<ul class="materiais-lista-simples">' + prioritarios.map(function (material) {
              return "<li>" + esc(material.item) + " — " + esc(material.qtd) + "</li>";
            }).join("") + '</ul>' +
          '</div>' +
          '<div class="materiais-grupo" data-bloco="extras">' +
            '<h4>Complementares — Material Sugestão <span class="tag tag--extra">' + extras.length + '</span></h4>' +
            '<ul class="materiais-lista-simples">' + extras.map(function (material) {
              return "<li>" + esc(material.item) + " — " + esc(material.qtd) + "</li>";
            }).join("") + '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="materiais-conferir">' +
          '<h4>' + esc(conferir.titulo || "Itens a conferir") + '</h4>' +
          '<p>' + esc(conferir.resumo || "") + '</p>' +
          '<ul>' + itensConferir.map(function (material) {
            return "<li><strong>" + esc(material.item) + "</strong> — " + esc(material.qtd) + " · " +
              (material.estacoes || []).map(function (id) { return "mesa " + numeroEstacao(id); }).join(", ") + "</li>";
          }).join("") + '</ul>' +
        '</div>' +
      '</section>';

    $$("[data-materiais-filtro]", app).forEach(function (botao) {
      botao.addEventListener("click", function () {
        estado.materiaisFiltro = botao.getAttribute("data-materiais-filtro");
        $$("[data-materiais-filtro]", app).forEach(function (outro) {
          outro.setAttribute("aria-pressed", outro === botao ? "true" : "false");
        });
        $$("[data-secao]", app).forEach(function (secao) {
          const nome = secao.getAttribute("data-secao");
          secao.hidden = estado.materiaisFiltro !== "todos" && estado.materiaisFiltro !== nome;
        });
      });
    });

    app.addEventListener("change", function (evento) {
      const caixa = evento.target.closest('input[type="checkbox"][data-material-id]');
      if (!caixa) return;
      const id = caixa.getAttribute("data-material-id");
      if (caixa.checked) estado.marcados[id] = true;
      else delete estado.marcados[id];
      salvar(CHAVES.materiais, estado.marcados);
      const cartao = caixa.closest(".material-card");
      if (cartao) cartao.classList.toggle("marcado", caixa.checked);
      atualizarProgressoMateriais();
    });

    const imprimirBotao = $("#materiais-imprimir");
    if (imprimirBotao) imprimirBotao.addEventListener("click", function () { imprimir("materiais"); });
    const copiarBotao = $("#materiais-copiar");
    if (copiarBotao) copiarBotao.addEventListener("click", copiarListaMateriais);
    const limparBotao = $("#materiais-limpar");
    if (limparBotao) limparBotao.addEventListener("click", function () {
      if (!window.confirm("Limpar todas as marcações da lista de materiais?")) return;
      estado.marcados = {};
      salvar(CHAVES.materiais, estado.marcados);
      $$('input[type="checkbox"][data-material-id]', app).forEach(function (caixa) { caixa.checked = false; });
      $$(".material-card", app).forEach(function (cartao) { cartao.classList.remove("marcado"); });
      atualizarProgressoMateriais();
      toast("Marcações limpas.");
    });

    atualizarProgressoMateriais();
  }

  function montarMaterial(material, extra) {
    const marcado = estado.marcados[material.id] === true;
    const aviso = material.aviso ? '<span class="material-aviso">⚠ ' + esc(material.aviso) + '</span>' : "";
    return '<label class="material-card' + (extra ? " material-card--extra" : "") + (marcado ? " marcado" : "") + '">' +
      '<input type="checkbox" data-material-id="' + esc(material.id) + '"' + (marcado ? " checked" : "") + '>' +
      '<span class="material-check" aria-hidden="true"></span>' +
      '<span class="material-corpo">' +
        '<strong>' + esc(material.item) + '</strong>' +
        '<span class="material-qtd">' + esc(material.qtd) + '</span>' +
        '<span class="material-uso">' + esc(material.uso) + '</span>' +
        etiquetasMaterial(material) +
        aviso +
      '</span>' +
    '</label>';
  }

  /* Etiquetas de bloco e de mesa em cada material (como separar a compra) */
  function etiquetasMaterial(material) {
    const partes = [];
    const blocos = (dados.materiais.blocos || []);
    const bloco = blocos.find(function (item) { return item.id === material.bloco; });
    if (bloco) {
      partes.push('<span class="material-tag material-tag--bloco">Bloco ' + esc(bloco.id) + '</span>');
    }
    if (material.sala) {
      partes.push('<span class="material-tag material-tag--sala">Todas as mesas</span>');
    } else if (Array.isArray(material.estacoes) && material.estacoes.length) {
      material.estacoes.forEach(function (id) {
        const numero = numeroEstacao(id);
        if (numero) partes.push('<span class="material-tag">Mesa ' + numero + '</span>');
      });
    }
    return partes.length ? '<span class="material-tags">' + partes.join("") + '</span>' : "";
  }

  function numeroEstacao(id) {
    const estacao = (dados.estacoes || []).find(function (item) { return item.id === id; });
    return estacao ? estacao.numero : 0;
  }

  /* Todos os materiais em ordem, com prioridade para os prioritários */
  function todosMateriais() {
    return (dados.materiais.prioritarios || []).concat(dados.materiais.extras || []);
  }

  function materiaisDaEstacao(id) {
    return todosMateriais().filter(function (material) {
      return !material.sala && Array.isArray(material.estacoes) && material.estacoes.indexOf(id) !== -1;
    });
  }

  function materiaisDaSala() {
    return todosMateriais().filter(function (material) { return material.sala === true; });
  }

  /* Bloco de uma estação no painel de materiais: a "caixa" dela */
  function montarCaixaEstacao(estacao) {
    const itens = materiaisDaEstacao(estacao.id);
    const prioritarios = itens.filter(function (material) { return material.id.indexOf("p") === 0; }).length;
    const nfc = estacao.id === dados.kitAoVivo.aoVivo
      ? '<p class="caixa-nfc"><strong>+ Kit físico (não é compra):</strong> ESP32-S3, PN532, tags NFC, cabo e o tablet que espelha o painel na mesa 5.</p>'
      : "";
    return '<details class="caixa-estacao" data-caixa-estacao="' + esc(estacao.id) + '" style="--cor:' + corEstacao(estacao) + '">' +
      '<summary>' +
        '<span class="caixa-num">' + esc(estacao.numero) + '</span>' +
        '<span class="caixa-titulo">' + esc(estacao.nome) + '</span>' +
        '<span class="caixa-meta">' + (itens.length ? itens.length + ' itens · ' + prioritarios + ' prioritários' : "usa só os materiais de sala") + '</span>' +
      '</summary>' +
      nfc +
      (itens.length
        ? '<div class="materiais-grade caixa-grade">' + itens.map(function (material) {
            return montarMaterial(material, material.id.indexOf("p") !== 0);
          }).join("") + '</div>'
        : '<p class="caixa-vazia">Nenhum item exclusivo: esta mesa usa apenas o material de sala e o que a Estação 2 empresta.</p>') +
      '<div class="caixa-roteiro">' +
        '<h4>O que o visitante faz</h4>' +
        '<ol>' + (estacao.visitante || []).map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + '</ol>' +
        '<h4>Como montar</h4>' +
        '<ol>' + (estacao.montagem || []).map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("") + '</ol>' +
        '<p class="caixa-dica"><strong>Dica da equipe:</strong> ' + esc(estacao.dica) + '</p>' +
      '</div>' +
    '</details>';
  }

  function corEstacao(estacao) {
    const mapa = { cyan: "var(--cyan, #22d3ee)", emerald: "#10b981", amber: "#f59e0b", rose: "#f43f5e", violet: "#8b5cf6" };
    return mapa[estacao.cor] || "var(--primario)";
  }

  function atualizarProgressoMateriais() {
    const prioritarios = dados.materiais.prioritarios || [];
    const extras = dados.materiais.extras || [];
    const marcadosPrioritarios = prioritarios.filter(function (material) {
      return estado.marcados[material.id] === true;
    }).length;
    const marcadosExtras = extras.filter(function (material) {
      return estado.marcados[material.id] === true;
    }).length;

    const contador = $("#materiais-marcados");
    if (contador) contador.textContent = String(marcadosPrioritarios);
    const barra = $("#materiais-progresso");
    if (barra) {
      barra.setAttribute("aria-valuenow", String(marcadosPrioritarios));
      const preenchimento = barra.querySelector("span");
      if (preenchimento) preenchimento.style.width = (prioritarios.length ? (marcadosPrioritarios / prioritarios.length) * 100 : 0) + "%";
    }
    const extrasContagem = $("#extras-contagem");
    if (extrasContagem) extrasContagem.textContent = marcadosExtras + " de " + extras.length + " marcados";
  }

  function copiarListaMateriais() {
    const texto = logic.textoMateriais
      ? logic.textoMateriais(dados.materiais.prioritarios, dados.materiais.extras, dados.estacoes)
      : todosMateriais().map(function (material) {
          return "[ ] " + material.item + " — " + material.qtd;
        }).join("\n");

    function fallback() {
      try {
        const area = document.createElement("textarea");
        area.value = texto;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const copiou = document.execCommand("copy");
        document.body.removeChild(area);
        toast(copiou ? "Lista copiada." : "Não foi possível copiar. Selecione o texto da lista manualmente.");
      } catch (erro) {
        toast("Não foi possível copiar neste navegador.");
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () {
        toast("Lista prioritária copiada.");
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  /* ---------------------------------------------------------------------
     PASSAPORTE E CERTIFICADO
     --------------------------------------------------------------------- */
  function carimbar(id) {
    if (!id) return;
    if (estado.passaporte.indexOf(id) !== -1) {
      toast("Este selo já está no seu passaporte.");
      return;
    }
    estado.passaporte.push(id);
    salvar(CHAVES.passaporte, estado.passaporte);
    atualizarBotoesCarimbo();
    renderizarPassaporte();
    const estacao = estacaoPorId(id);
    toast(estacao ? "Selo da estação " + estacao.numero + " coletado!" : "Selo coletado!");
  }

  function atualizarBotoesCarimbo() {
    $$("[data-carimbar]").forEach(function (botao) {
      const id = botao.getAttribute("data-carimbar");
      const coletado = estado.passaporte.indexOf(id) !== -1;
      botao.disabled = coletado;
      botao.textContent = coletado ? "Selo coletado ✓" : "Carimbar passaporte";
      botao.classList.toggle("btn--carimbado", coletado);
    });
  }

  function renderizarPassaporte() {
    const app = $("#passaporte-app");
    if (!app) return;
    const total = dados.estacoes.length;
    const coletados = dados.estacoes.filter(function (estacao) {
      return estado.passaporte.indexOf(estacao.id) !== -1;
    }).length;
    const completo = coletados === total;

    const selos = dados.estacoes.map(function (estacao) {
      const conquistado = estado.passaporte.indexOf(estacao.id) !== -1;
      return '<li class="selo cor-' + esc(estacao.cor) + (conquistado ? " conquistado" : "") + '" ' +
        'aria-label="Selo da estação ' + esc(estacao.numero) + ', ' + esc(estacao.nome) + ': ' + (conquistado ? "coletado" : "não coletado") + '">' +
        '<span class="selo-num" aria-hidden="true">' + esc(estacao.numero) + '</span>' +
        '<span class="selo-nome">' + esc(estacao.nome) + '</span>' +
      '</li>';
    }).join("");

    const nome = estado.nomeCertificado || "Visitante";
    const hoje = new Date().toLocaleDateString("pt-BR");
    const escola = (dados.meta && dados.meta.escola) || "";

    const certificado = completo
      ? '<div class="certificado-preview">' +
          '<p class="certificado-orbita">Certificado de Explorador de Tecnologia</p>' +
          '<h3>Mundo Maker — Feira de Exposição</h3>' +
          '<p>Certificamos que</p>' +
          '<p class="certificado-nome" id="certificado-nome-exibido">' + esc(nome) + '</p>' +
          '<p>completou as cinco estações da exposição e desvendou o ESP32-S3, o NFC, o LED RGB, os 37 sensores e a memória Flash.</p>' +
          '<p class="certificado-assinatura">' + esc(escola) + ' · ' + esc(hoje) + '</p>' +
        '</div>' +
        '<div class="certificado-form">' +
          '<label for="certificado-nome-input">Nome para o certificado' +
            '<input id="certificado-nome-input" type="text" maxlength="60" autocomplete="name" value="' + esc(nome) + '" placeholder="Digite seu nome">' +
          '</label>' +
        '</div>' +
        '<div class="certificado-acoes">' +
          '<button class="btn btn--primario btn--mini" type="button" id="certificado-imprimir">Imprimir certificado</button>' +
          '<button class="btn btn--fantasma btn--mini" type="button" id="passaporte-reset">Recomeçar</button>' +
        '</div>'
      : '<div class="certificado-preview certificado-bloqueio">' +
          '<p class="certificado-orbita">Certificado bloqueado</p>' +
          '<h3>Faltam ' + (total - coletados) + ' selo' + (total - coletados === 1 ? "" : "s") + '</h3>' +
          '<p>Explore as estações e carimbe o passaporte para liberar o Certificado de Explorador de Tecnologia.</p>' +
        '</div>' +
        '<div class="certificado-acoes">' +
          '<button class="btn btn--fantasma btn--mini" type="button" id="passaporte-reset">Recomeçar</button>' +
        '</div>';

    app.innerHTML =
      '<div class="passaporte-grid">' +
        '<section class="passaporte-card" aria-labelledby="passaporte-card-titulo">' +
          '<div class="passaporte-cabeca">' +
            '<h3 id="passaporte-card-titulo">Passaporte do visitante</h3>' +
            '<span class="chip" id="passaporte-contagem">' + coletados + ' de ' + total + ' selos</span>' +
          '</div>' +
          '<ol class="selos" id="selos" aria-label="Selos coletados">' + selos + '</ol>' +
          '<div class="passaporte-rodape">' +
            '<p>' + (completo ? "Passaporte completo! Seu certificado foi liberado ao lado." : "Clique em “Carimbar passaporte” em cada estação.") + '</p>' +
            '<a class="botao-texto" href="#estacoes">Ir para as estações</a>' +
          '</div>' +
        '</section>' +
        '<section class="certificado-card' + (completo ? "" : " bloqueado") + '" id="certificado-card" aria-labelledby="certificado-titulo">' +
          '<div class="passaporte-cabeca"><h3 id="certificado-titulo">Certificado</h3><span class="chip">' + (completo ? "liberado" : "bloqueado") + '</span></div>' +
          certificado +
        '</section>' +
      '</div>';

    const reset = $("#passaporte-reset");
    if (reset) reset.addEventListener("click", function () {
      if (!window.confirm("Recomeçar o passaporte e apagar os selos?")) return;
      estado.passaporte = [];
      salvar(CHAVES.passaporte, estado.passaporte);
      atualizarBotoesCarimbo();
      renderizarPassaporte();
      toast("Passaporte reiniciado.");
    });

    const entradaNome = $("#certificado-nome-input");
    if (entradaNome) {
      entradaNome.addEventListener("input", function () {
        const valor = entradaNome.value.trim() || "Visitante";
        estado.nomeCertificado = valor;
        salvar(CHAVES.nome, valor, true);
        const exibicao = $("#certificado-nome-exibido");
        if (exibicao) exibicao.textContent = valor;
      });
    }
    const imprimirCertificado = $("#certificado-imprimir");
    if (imprimirCertificado) imprimirCertificado.addEventListener("click", function () {
      if (estado.passaporte.length < total) {
        toast("Complete os cinco selos para imprimir o certificado.");
        return;
      }
      imprimir("certificado");
    });
  }

  /* ---------------------------------------------------------------------
     Navegação, tema, scroll
     --------------------------------------------------------------------- */
  function configurarNavegacao() {
    const botaoMenu = $("#menu-botao");
    const menu = $("#menu-mobile");
    function fecharMenu() {
      if (!menu || !botaoMenu) return;
      menu.hidden = true;
      botaoMenu.setAttribute("aria-expanded", "false");
      botaoMenu.setAttribute("aria-label", "Abrir menu");
    }
    if (botaoMenu && menu) {
      botaoMenu.addEventListener("click", function () {
        const aberto = menu.hidden;
        menu.hidden = !aberto;
        botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
        botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      });
      $$(".nav-mobile .nav-link").forEach(function (link) {
        link.addEventListener("click", fecharMenu);
      });
      document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") fecharMenu();
      });
      if (window.matchMedia) {
        const media = window.matchMedia("(min-width: 961px)");
        const aoMudar = function () { if (media.matches) fecharMenu(); };
        if (media.addEventListener) media.addEventListener("change", aoMudar);
        else if (media.addListener) media.addListener(aoMudar);
      }
    }

    const botaoTema = $("#tema-botao");
    if (botaoTema) botaoTema.addEventListener("click", function () {
      aplicarTema(estado.tema === "claro" ? "escuro" : "claro", true);
    });

    const tour = $("[data-tour]");
    if (tour) tour.addEventListener("click", function (evento) {
      evento.preventDefault();
      ativarEstacao(0, { hash: true, foco: false });
      const secao = $("#estacoes");
      if (secao) secao.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(function () {
        const aba = $("#deck-abas .deck-aba");
        if (aba) aba.focus();
      }, 450);
    });

    const ampliar = $("#planta-ampliar");
    if (ampliar) ampliar.addEventListener("click", abrirPlantaAmpliada);
    const fechar = $("#planta-fechar");
    if (fechar) fechar.addEventListener("click", fecharPlantaAmpliada);
    const dialogo = $("#planta-dialog");
    if (dialogo) dialogo.addEventListener("click", function (evento) {
      if (evento.target === dialogo) fecharPlantaAmpliada();
    });
    const baixar = $("#planta-baixar");
    if (baixar) baixar.addEventListener("click", baixarPlanta);
    const imprimirPlanta = $("#planta-imprimir");
    if (imprimirPlanta) imprimirPlanta.addEventListener("click", function () { imprimir("planta"); });

    // Abrir estação pelo painel da planta
    const info = $("#planta-info");
    if (info) info.addEventListener("click", function (evento) {
      const botao = evento.target.closest("[data-ir-estacao]");
      if (!botao) return;
      const numero = Number(botao.getAttribute("data-ir-estacao"));
      const indice = dados.estacoes.findIndex(function (estacao) { return estacao.numero === numero; });
      if (indice < 0) return;
      ativarEstacao(indice, { hash: true });
      const secao = $("#estacoes");
      if (secao) secao.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Tela cheia: atualizar rótulo
    document.addEventListener("fullscreenchange", function () {
      const botao = $("#deck-tela-cheia");
      if (!botao) return;
      const ativo = Boolean(document.fullscreenElement);
      botao.textContent = ativo ? "Sair da tela cheia" : "Tela cheia";
      botao.setAttribute("aria-pressed", ativo ? "true" : "false");
    });

    // Hash de estação
    window.addEventListener("hashchange", function () {
      const indice = indiceDoHash();
      if (indice != null) ativarEstacao(indice, { hash: false });
    });

    // Scrollspy + progresso + header
    window.addEventListener("scroll", function () {
      if (frameScroll) return;
      frameScroll = requestAnimationFrame(function () {
        frameScroll = 0;
        atualizarScroll();
      });
    }, { passive: true });
    atualizarScroll();
  }

  function indiceDoHash() {
    const correspondencia = /^#estacao-(\d+)$/.exec(window.location.hash);
    if (!correspondencia) return null;
    const numero = Number(correspondencia[1]);
    const indice = dados.estacoes.findIndex(function (estacao) { return estacao.numero === numero; });
    return indice >= 0 ? indice : null;
  }

  function atualizarScroll() {
    const altura = document.documentElement.scrollHeight - window.innerHeight;
    const proporcao = altura > 0 ? Math.min(1, Math.max(0, window.scrollY / altura)) : 0;
    const barra = $("#barra-progresso span");
    if (barra) barra.style.width = (proporcao * 100) + "%";

    const header = $(".site-header");
    if (header) header.classList.toggle("compacto", window.scrollY > 12);

    const secoes = ["inicio", "visao-geral", "planta", "estacoes", "sensores", "materiais", "passaporte"];
    const margem = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 90;
    const referencia = window.scrollY + margem + 40;
    let ativa = secoes[0];
    secoes.forEach(function (id) {
      const elemento = document.getElementById(id);
      if (elemento && elemento.offsetTop <= referencia) ativa = id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
      ativa = "passaporte";
    }
    $$(".nav-link").forEach(function (link) {
      link.classList.toggle("ativo", link.getAttribute("href") === "#" + ativa);
    });
  }

  /* ---------------------------------------------------------------------
     Inicialização
     --------------------------------------------------------------------- */
  function iniciar() {
    if (!dados) {
      const conteudo = $("#conteudo");
      if (conteudo) conteudo.insertAdjacentHTML("afterbegin", '<p class="aviso aviso--perigo">Não foi possível carregar o conteúdo da feira (js/data.js). Verifique se os arquivos estão na pasta correta.</p>');
      return;
    }

    // Estado persistido
    const marcadosSalvos = lerJson(CHAVES.materiais, {});
    estado.marcados = marcadosSalvos && typeof marcadosSalvos === "object" ? marcadosSalvos : {};
    const passaporteSalvo = lerJson(CHAVES.passaporte, []);
    const idsValidos = dados.estacoes.map(function (estacao) { return estacao.id; });
    estado.passaporte = Array.isArray(passaporteSalvo)
      ? passaporteSalvo.filter(function (id) { return idsValidos.indexOf(id) !== -1; })
      : [];
    estado.nomeCertificado = (lerTexto(CHAVES.nome, "") || "Visitante").slice(0, 60);

    aplicarTema(estado.tema, false);
    preencherMeta();
    desenharArtes();
    renderizarPlanta();
    renderizarResumo();
    renderizarKitAoVivo();
    renderizarDeck();
    renderizarSensores();
    renderizarMateriais();
    renderizarPassaporte();
    configurarNavegacao();

    // Hash inicial
    const indiceInicial = indiceDoHash();
    if (indiceInicial != null) {
      ativarEstacao(indiceInicial, { hash: false });
      window.setTimeout(function () {
        const secao = $("#estacoes");
        if (secao) window.scrollTo({ top: secao.offsetTop - 80, behavior: "auto" });
      }, 120);
    }
    window.setTimeout(function () {
      const indice = indiceDoHash();
      if (indice != null && indice !== estado.estacaoAtiva) ativarEstacao(indice, { hash: false });
    }, 420);

    // Se a arte ainda não existia no momento síncrono, tenta mais uma vez.
    if (!$("#hero-arte svg") && FEIRA.art && typeof FEIRA.art.hero === "function") {
      window.setTimeout(desenharArtes, 80);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})(typeof window !== "undefined" ? window : globalThis, document);
