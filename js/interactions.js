/* ==========================================================================
   MUNDO MAKER — FEIRA DE EXPOSIÇÃO
   Demos interativas das 5 estações (interactions.js).

   API pública:
     FEIRA.games.montar(elemento)  → monta uma demo específica
     FEIRA.games.montarTodos(root) → varre [data-demo] e monta cada uma, uma vez

   Depende apenas de FEIRA.data e FEIRA.logic; usa FEIRA.art quando disponível.
   Nenhum estado global é compartilhado entre as demos: cada instância guarda
   o próprio estado no fechamento do seu montador.
   ========================================================================== */
(function (root) {
  "use strict";

  var doc = root.document;

  /* ------------------------------------------------------------------------
     Helpers gerais
     ------------------------------------------------------------------------ */

  var MAPA_TEXTO = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  function esc(valor) {
    return String(valor == null ? "" : valor).replace(/[&<>"']/g, function (caractere) {
      return MAPA_TEXTO[caractere];
    });
  }

  function pegar(seletor, escopo) {
    var alvo = escopo || doc;
    return alvo ? alvo.querySelector(seletor) : null;
  }

  function pegarTodos(seletor, escopo) {
    var alvo = escopo || doc;
    if (!alvo) return [];
    return Array.prototype.slice.call(alvo.querySelectorAll(seletor));
  }

  function dadosFeira() {
    return (root.FEIRA && root.FEIRA.data) || null;
  }

  function logicaFeira() {
    return (root.FEIRA && root.FEIRA.logic) || null;
  }

  function semMovimento() {
    try {
      return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (erro) {
      return false;
    }
  }

  function limparTimer(estado) {
    if (estado && estado.timer) {
      root.clearTimeout(estado.timer);
      estado.timer = null;
    }
  }

  function agendar(estado, ms, tarefa) {
    limparTimer(estado);
    estado.timer = root.setTimeout(function () {
      estado.timer = null;
      tarefa();
    }, ms);
  }

  function agora() {
    var data = new Date();
    function doisDigitos(numero) {
      return String(numero).padStart(2, "0");
    }
    return doisDigitos(data.getHours()) + ":" + doisDigitos(data.getMinutes()) + ":" + doisDigitos(data.getSeconds());
  }

  function focar(escopo, seletor) {
    var alvo = pegar(seletor, escopo);
    if (!alvo || typeof alvo.focus !== "function") return;
    try {
      alvo.focus({ preventScroll: true });
    } catch (erro) {
      alvo.focus();
    }
  }

  function embaralhar(lista) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var troca = copia[i];
      copia[i] = copia[j];
      copia[j] = troca;
    }
    return copia;
  }

  function sortearIndice(total, evitar) {
    if (!(total > 0)) return 0;
    if (total === 1) return 0;
    var indice = Math.floor(Math.random() * total);
    if (indice === evitar) indice = (indice + 1 + Math.floor(Math.random() * (total - 1))) % total;
    return indice;
  }

  function cabecalho(titulo, frase, instrucao) {
    return '<header class="demo-cabeca">' +
      '<p class="demo-eyebrow">Experimente</p>' +
      '<h4 class="demo-titulo">' + esc(titulo) + '</h4>' +
      '<p class="demo-texto">' + esc(frase) + '</p>' +
      '<p class="demo-instrucao"><span class="demo-instrucao-seta" aria-hidden="true">▸</span>' + esc(instrucao) + '</p>' +
    '</header>';
  }

  function semDados(nome) {
    return '<p class="demo-erro" role="status">Não foi possível carregar os dados da demo (' + esc(nome) + ').</p>';
  }

  function rotuloTipo(chave) {
    var logic = logicaFeira();
    if (logic && typeof logic.formatarTipo === "function") return logic.formatarTipo(chave);
    return chave === "digital" ? "Digital" : chave === "analogico" ? "Analógico" : "Especial";
  }

  function statusDoCartao(chave) {
    var logic = logicaFeira();
    if (logic && typeof logic.statusDoCartao === "function") return logic.statusDoCartao(chave);
    var padrao = {
      liberado: { rotulo: "LIBERADO", cor: "#34d399", led: "verde" },
      negado: { rotulo: "NEGADO", cor: "#f87171", led: "vermelho" },
      bloqueado: { rotulo: "BLOQUEADO", cor: "#fbbf24", led: "amarelo" }
    };
    return padrao[chave] || padrao.negado;
  }

  function acharCartao(uid, cartoes) {
    var logic = logicaFeira();
    if (logic && typeof logic.resultadoCartao === "function") return logic.resultadoCartao(uid, cartoes);
    var procurado = String(uid == null ? "" : uid).replace(/\s+/g, "").toUpperCase();
    if (!procurado) return null;
    for (var i = 0; i < cartoes.length; i += 1) {
      var atual = String(cartoes[i] && cartoes[i].uid ? cartoes[i].uid : "").replace(/\s+/g, "").toUpperCase();
      if (atual === procurado) return cartoes[i];
    }
    return null;
  }

  /* ======================================================================
     DEMO 1 — G-V-S: encaixe na linha certa
     ====================================================================== */

  function montarGvs(alvo) {
    var dados = dadosFeira();
    var sensores = dados && Array.isArray(dados.quizGvs) ? dados.quizGvs : [];
    if (!sensores.length) {
      alvo.innerHTML = semDados("quizGvs");
      return;
    }

    var totalSensores = sensores.length;
    var totalPontos = totalSensores * 3;
    var estado = {
      indice: 0,
      selecoes: [],
      conferido: false,
      tentativas: [],
      pontos: 0,
      final: false,
      timer: null
    };

    function sensorAtual() {
      return sensores[estado.indice];
    }

    function totalPinos() {
      var sensor = sensorAtual();
      return sensor && Array.isArray(sensor.pinos) ? sensor.pinos.length : 3;
    }

    function reiniciarPinos() {
      var quantidade = totalPinos();
      estado.selecoes = new Array(quantidade).fill(null);
      estado.tentativas = new Array(quantidade).fill(false);
      estado.conferido = false;
    }

    function todosEscolhidos() {
      return estado.selecoes.length > 0 && estado.selecoes.every(function (valor) {
        return valor === "G" || valor === "V" || valor === "S";
      });
    }

    function todosCertos() {
      if (!estado.conferido) return false;
      var sensor = sensorAtual();
      if (!sensor || !Array.isArray(sensor.pinos)) return false;
      return sensor.pinos.every(function (pino, indice) {
        return estado.selecoes[indice] === pino.correta;
      });
    }

    function renderPino(pino, indice) {
      var escolha = estado.selecoes[indice];
      var certo = estado.conferido && escolha === pino.correta;
      var errado = estado.conferido && !!escolha && escolha !== pino.correta;
      var classes = "gvs-pino" + (certo ? " gvs-pino--certo" : "") + (errado ? " gvs-pino--errado" : "");
      var opcoes = ["G", "V", "S"].map(function (opcao) {
        var nomes = { G: "GND", V: "VCC", S: "Sinal" };
        var ativo = escolha === opcao;
        var classesOpcao = "gvs-opcao" + (ativo ? " gvs-opcao--ativo" : "");
        if (estado.conferido && ativo) {
          classesOpcao += opcao === pino.correta ? " gvs-opcao--certo" : " gvs-opcao--errado";
        }
        var travado = estado.final || todosCertos();
        return '<button type="button" class="' + classesOpcao + '" data-gvs-opcao="' + opcao + '"' +
          ' aria-pressed="' + (ativo ? "true" : "false") + '"' +
          ' aria-label="Pino ' + esc(pino.rotulo) + ': ligar em ' + nomes[opcao] + '"' +
          (travado ? " disabled" : "") + '>' +
          '<span class="gvs-letra" aria-hidden="true">' + opcao + '</span>' +
          '<span class="gvs-nome" aria-hidden="true">' + nomes[opcao] + '</span>' +
        '</button>';
      }).join("");
      var status = "";
      if (estado.conferido) {
        status = certo
          ? '<span class="gvs-status gvs-status--ok" aria-hidden="true">✓</span>'
          : '<span class="gvs-status gvs-status--erro" aria-hidden="true">✗</span>';
      }
      return '<div class="' + classes + '" data-gvs-pino="' + indice + '" role="group" aria-label="Pino ' + esc(pino.rotulo) + ' do sensor">' +
        '<div class="gvs-pino-topo">' +
          '<span class="gvs-pino-rotulo" aria-hidden="true">' + esc(pino.rotulo) + '</span>' +
          status +
        '</div>' +
        '<div class="gvs-opcoes">' + opcoes + '</div>' +
      '</div>';
    }

    function feedbackHtml() {
      if (!estado.conferido) {
        return '<p class="gvs-vazio">Escolha uma opção para cada pino e clique em <strong>Conferir</strong>. ' +
          '<span class="gvs-legenda">G = terra · V = energia (3,3 V) · S = sinal que a placa lê.</span></p>';
      }
      var sensor = sensorAtual();
      var linhas = sensor.pinos.map(function (pino, indice) {
        var escolha = estado.selecoes[indice];
        var certo = escolha === pino.correta;
        var esperado = pino.correta + (pino.gpio ? " (" + pino.gpio + ")" : "");
        return '<li class="gvs-linha ' + (certo ? "gvs-linha--ok" : "gvs-linha--erro") + '">' +
          '<span class="gvs-linha-pino" aria-hidden="true">' + esc(pino.rotulo) + '</span>' +
          '<span class="gvs-linha-escolha">' + esc(escolha) + '</span>' +
          '<span class="gvs-linha-icon" aria-hidden="true">' + (certo ? "✓" : "✗") + '</span>' +
          '<span class="gvs-linha-txt">' + (certo ? "correto" : "esperado: " + esc(esperado)) + '</span>' +
        '</li>';
      }).join("");
      if (todosCertos()) {
        return '<ul class="gvs-linhas" aria-label="Conferência dos pinos">' + linhas + '</ul>' +
          '<p class="gvs-ok"><strong>Todos os pinos certos!</strong> ' +
          'O sinal do sensor vai para <strong>' + esc(sensor.pinos[sensor.pinos.length - 1].gpio || "um pino seguro") + '</strong>.</p>';
      }
      return '<ul class="gvs-linhas" aria-label="Conferência dos pinos">' + linhas + '</ul>' +
        '<p class="gvs-erro"><strong>Quase!</strong> Revise os pinos em vermelho. ' +
        'Lembre: G é o terra, V é a alimentação e S é o sinal.</p>';
    }

    function render() {
      var sensor = sensorAtual();
      var html = cabecalho(
        "Encaixe na linha certa",
        "Cada módulo tem três pernas. Descubra qual delas vai na linha de terra, na de energia e na de sinal.",
        "Escolha G, V ou S para cada pino e confira. Você pode corrigir antes de avançar."
      );

      if (estado.final) {
        html += '<div class="demo-corpo"><div class="gvs-final">' +
          '<p class="gvs-final-selo" aria-hidden="true">✓</p>' +
          '<p class="gvs-final-titulo">Circuito completo!</p>' +
          '<p class="gvs-final-placar">Placar: <strong>' + estado.pontos + ' de ' + totalPontos + '</strong> pinos certos na primeira tentativa.</p>' +
          '<div class="aviso aviso--perigo"><strong>⛔ Pinos proibidos:</strong> IO35, IO36 e IO37 são ligados à PSRAM no ESP32-S3. Nunca ligue nada neles.</div>' +
          '<button class="btn btn--primario" type="button" id="gvs-reiniciar">Jogar de novo</button>' +
        '</div></div>';
        alvo.innerHTML = html;
        return;
      }

      html += '<div class="demo-corpo"><div class="demo-placar gvs-placar">' +
          '<span class="chip"><span class="gvs-placar-rotulo">Sensor</span> <strong>' + (estado.indice + 1) + '</strong> de ' + totalSensores + '</span>' +
          '<span class="chip"><span class="gvs-placar-rotulo">Acertos</span> <strong>' + estado.pontos + '</strong> de ' + totalPontos + '</span>' +
        '</div>' +
        '<div class="gvs-sensor" data-gvs-sensor="' + estado.indice + '" tabindex="-1">' +
          '<div class="gvs-sensor-topo">' +
            '<p class="gvs-sensor-nome">' + esc(sensor.sensor) + '</p>' +
            '<span class="tag gvs-sensor-tipo">' + esc(sensor.tipo) + '</span>' +
          '</div>' +
          '<p class="gvs-dica"><span aria-hidden="true">💡</span> ' + esc(sensor.dica) + '</p>' +
          '<div class="gvs-pinos">' + sensor.pinos.map(renderPino).join("") + '</div>' +
        '</div>' +
        '<div class="demo-acoes gvs-acoes">' +
          '<button class="btn btn--primario" type="button" id="gvs-conferir"' +
            (todosEscolhidos() && !todosCertos() ? "" : " disabled") + '>Conferir</button>' +
          '<button class="btn btn--fantasma" type="button" id="gvs-proximo"' +
            (todosCertos() ? "" : " hidden") + '>' + (estado.indice >= totalSensores - 1 ? "Concluir" : "Próximo sensor") + '</button>' +
        '</div>' +
        '<div class="gvs-feedback demo-resultado' +
          (estado.conferido ? todosCertos() ? " demo-resultado--ok" : " demo-resultado--erro" : " demo-resultado--info") +
          '" id="gvs-feedback" role="status" aria-live="polite" aria-atomic="true" tabindex="-1">' +
          feedbackHtml() +
        '</div>' +
      '</div>';
      alvo.innerHTML = html;
    }

    function conferir() {
      if (estado.final || !todosEscolhidos()) return;
      var sensor = sensorAtual();
      estado.conferido = true;
      sensor.pinos.forEach(function (pino, indice) {
        if (!estado.tentativas[indice]) {
          estado.tentativas[indice] = true;
          if (estado.selecoes[indice] === pino.correta) estado.pontos += 1;
        }
      });
      render();
      focar(alvo, "#gvs-feedback");
    }

    function proximo() {
      if (!todosCertos()) return;
      if (estado.indice >= totalSensores - 1) {
        estado.final = true;
        render();
        focar(alvo, "#gvs-feedback");
        return;
      }
      estado.indice += 1;
      reiniciarPinos();
      render();
      focar(alvo, "[data-gvs-sensor]");
    }

    function reiniciar() {
      estado.indice = 0;
      estado.pontos = 0;
      estado.final = false;
      reiniciarPinos();
      render();
      focar(alvo, "[data-gvs-sensor]");
    }

    alvo.addEventListener("click", function (evento) {
      var botao = evento.target && evento.target.closest ? evento.target.closest("button") : null;
      if (!botao || !alvo.contains(botao)) return;
      var opcao = botao.getAttribute("data-gvs-opcao");
      if (opcao) {
        if (estado.final || (estado.conferido && todosCertos())) return;
        var grupo = botao.closest("[data-gvs-pino]");
        if (!grupo) return;
        var indice = Number(grupo.getAttribute("data-gvs-pino"));
        estado.selecoes[indice] = opcao;
        estado.conferido = false;
        render();
        focar(alvo, '[data-gvs-pino="' + indice + '"] [data-gvs-opcao="' + opcao + '"]');
        return;
      }
      if (botao.id === "gvs-conferir") conferir();
      else if (botao.id === "gvs-proximo") proximo();
      else if (botao.id === "gvs-reiniciar") reiniciar();
    });

    reiniciarPinos();
    render();
  }

  /* ======================================================================
     DEMO 2 — NFC: toque mágico
     ====================================================================== */

  function montarNfc(alvo) {
    var dados = dadosFeira();
    var cartoes = dados && Array.isArray(dados.cartoes) ? dados.cartoes : [];
    if (!cartoes.length) {
      alvo.innerHTML = semDados("cartoes");
      return;
    }

    var estado = {
      selecionado: null,
      resultado: null,
      aviso: null,
      lendo: false,
      timer: null
    };

    function cartaoSelecionado() {
      if (!estado.selecionado) return null;
      return acharCartao(estado.selecionado, cartoes);
    }

    function leitorHtml() {
      return '<span class="nfc-placa" aria-hidden="true">' +
          '<span class="nfc-antena"></span>' +
          '<span class="nfc-ondas"><span class="nfc-onda"></span><span class="nfc-onda"></span><span class="nfc-onda"></span></span>' +
          '<span class="nfc-chip-mini">PN532</span>' +
        '</span>' +
        '<span class="nfc-leitor-texto">' + (estado.lendo ? "Lendo o UID..." : "Toque para ler") + '</span>';
    }

    function resultadoHtml() {
      if (estado.lendo) {
        return '<p class="nfc-lendo"><span class="nfc-lendo-ponto" aria-hidden="true"></span> Aproximando o cartão... aguarde a leitura do PN532.</p>';
      }
      if (!estado.resultado) {
        if (estado.aviso) return '<p class="nfc-aviso">' + esc(estado.aviso) + '</p>';
        return '<p class="nfc-vazio">O resultado da leitura aparece aqui.</p>';
      }
      var cartao = estado.resultado;
      var status = statusDoCartao(cartao.resultado);
      return '<div class="nfc-res" style="--nfc-cor: ' + esc(status.cor) + '">' +
          '<div class="nfc-res-topo">' +
            '<span class="nfc-led" aria-hidden="true"></span>' +
            '<span class="nfc-res-rotulo">' + esc(status.rotulo) + '</span>' +
            '<span class="nfc-res-led">LED ' + esc(status.led) + '</span>' +
          '</div>' +
          '<dl class="nfc-dados">' +
            '<div class="nfc-dado"><dt>Nome</dt><dd>' + esc(cartao.nome) + '</dd></div>' +
            '<div class="nfc-dado"><dt>Situação</dt><dd>' + esc(cartao.situacao || "—") + '</dd></div>' +
            '<div class="nfc-dado"><dt>UID</dt><dd class="nfc-uid">' + esc(cartao.uid) + '</dd></div>' +
          '</dl>' +
          '<p class="nfc-nota">' + esc(cartao.nota) + '</p>' +
        '</div>';
    }

    function render() {
      var selecionado = estado.selecionado;
      var html = cabecalho(
        "Toque mágico",
        "Aproxime um cartão do leitor: ele acorda só com a proximidade e devolve o número de identidade do cartão.",
        "Escolha um cartão da lista e toque no leitor. O sistema mostra se o acesso é liberado, negado ou bloqueado."
      );
      html += '<div class="demo-corpo"><div class="nfc-grid">' +
          '<div class="nfc-cartoes-wrap">' +
            '<p class="nfc-rotulo" id="nfc-rotulo-cartoes">Cartões da exposição</p>' +
            '<ul class="nfc-lista" aria-labelledby="nfc-rotulo-cartoes">' +
              cartoes.map(function (cartao) {
                var ativo = selecionado === cartao.uid;
                return '<li>' +
                  '<button type="button" class="nfc-cartao' + (ativo ? " nfc-cartao--ativo" : "") + '"' +
                    ' data-nfc-cartao="' + esc(cartao.uid) + '" aria-pressed="' + (ativo ? "true" : "false") + '">' +
                    '<span class="nfc-cartao-icone" aria-hidden="true">' +
                      '<svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9.5h18" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 14h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
                    '</span>' +
                    '<span class="nfc-cartao-info">' +
                      '<span class="nfc-cartao-nome">' + esc(cartao.nome) + '</span>' +
                      '<span class="nfc-cartao-situacao">' + esc(cartao.situacao || "") + '</span>' +
                      '<span class="nfc-cartao-uid">' + esc(cartao.uid) + '</span>' +
                    '</span>' +
                    '<span class="nfc-cartao-marca" aria-hidden="true"></span>' +
                  '</button>' +
                '</li>';
              }).join("") +
            '</ul>' +
            '<p class="nfc-dica">O UID é como o “documento” do cartão: só o número não decide nada — a lista de alunos é consultada na Flash.</p>' +
          '</div>' +
          '<div class="nfc-leitor-wrap">' +
            '<button type="button" class="nfc-leitor' + (estado.lendo ? " nfc-leitor--lendo" : "") + '" id="nfc-leitor"' +
              ' aria-label="' + (estado.lendo ? "Lendo cartão..." : "Aproximar o cartão do leitor NFC") + '"' +
              (estado.lendo ? ' aria-busy="true" disabled' : "") + '>' + leitorHtml() + '</button>' +
            '<p class="nfc-status">' +
              (estado.lendo ? "Campo de 13,56 MHz ativo..." : selecionado ? "Cartão selecionado. Toque no leitor." : "Escolha um cartão acima.") +
            '</p>' +
          '</div>' +
        '</div>' +
        '<div class="nfc-resultado demo-resultado' +
          (estado.resultado ? (estado.resultado.resultado === "liberado" ? " demo-resultado--ok" : " demo-resultado--erro") : " demo-resultado--info") +
          '" id="nfc-resultado" role="status" aria-live="polite" aria-atomic="true" tabindex="-1">' +
          resultadoHtml() +
        '</div>' +
        '<div class="demo-acoes nfc-acoes">' +
          '<button class="btn btn--fantasma" type="button" id="nfc-limpar"' + (estado.resultado || estado.lendo ? "" : " disabled") + '>Ler outro cartão</button>' +
        '</div></div>';
      alvo.innerHTML = html;
    }

    function selecionar(uid) {
      if (estado.lendo) return;
      limparTimer(estado);
      estado.selecionado = uid;
      estado.resultado = null;
      estado.aviso = null;
      render();
      focar(alvo, '[data-nfc-cartao="' + uid + '"]');
    }

    function ler() {
      if (estado.lendo) return;
      var cartao = cartaoSelecionado();
      if (!cartao) {
        estado.aviso = "Escolha um cartão na lista antes de tocar no leitor.";
        render();
        focar(alvo, "#nfc-resultado");
        return;
      }
      estado.lendo = true;
      estado.resultado = null;
      estado.aviso = null;
      render();
      agendar(estado, semMovimento() ? 10 : 700, function () {
        estado.lendo = false;
        estado.resultado = cartao;
        render();
        focar(alvo, "#nfc-resultado");
      });
    }

    function limpar() {
      limparTimer(estado);
      estado.lendo = false;
      estado.resultado = null;
      estado.selecionado = null;
      estado.aviso = null;
      render();
      focar(alvo, "[data-nfc-cartao]");
    }

    alvo.addEventListener("click", function (evento) {
      var botao = evento.target && evento.target.closest ? evento.target.closest("button") : null;
      if (!botao || !alvo.contains(botao)) return;
      var uid = botao.getAttribute("data-nfc-cartao");
      if (uid) selecionar(uid);
      else if (botao.id === "nfc-leitor") ler();
      else if (botao.id === "nfc-limpar") limpar();
    });

    render();
  }

  /* ======================================================================
     DEMO 3 — ROLETA: semáforo falante
     ====================================================================== */

  function montarRoleta(alvo) {
    var dados = dadosFeira();
    var setores = dados && Array.isArray(dados.roleta) ? dados.roleta : [];
    if (!setores.length) {
      alvo.innerHTML = semDados("roleta");
      return;
    }

    var estado = {
      rotacao: 0,
      girando: false,
      resultado: null,
      pendente: null,
      ultimo: -1,
      timer: null
    };
    var refs = {};

    function corCurta(setor) {
      var cor = String(setor.cor || "");
      return cor.charAt(0).toUpperCase() + cor.slice(1);
    }
    function pontoCaminho(raio, anguloGraus) {
      var rad = (anguloGraus * Math.PI) / 180;
      return (Math.cos(rad) * raio).toFixed(3) + " " + (Math.sin(rad) * raio).toFixed(3);
    }

    function setorCaminho(inicio, fim) {
      return "M " + pontoCaminho(98, inicio) +
        " A 98 98 0 0 1 " + pontoCaminho(98, fim) +
        " L 0 0 Z";
    }

    function rodaInline() {
      var total = setores.length;
      var fatia = 360 / total;
      var paths = setores.map(function (setor, indice) {
        var centro = -90 + indice * fatia;
        return '<path d="' + setorCaminho(centro - fatia / 2, centro + fatia / 2) + '"' +
          ' fill="' + esc(setor.hex) + '" fill-opacity="0.86" stroke="var(--surface)" stroke-width="1.2"></path>';
      }).join("");
      var rotulos = setores.map(function (setor, indice) {
        var angulo = -90 + indice * fatia;
        var rad = (angulo * Math.PI) / 180;
        var raio = 61;
        var x = (Math.cos(rad) * raio).toFixed(2);
        var y = (Math.sin(rad) * raio).toFixed(2);
        return '<text x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="middle"' +
          ' font-size="6.8" font-weight="700" fill="#04121c" transform="rotate(' + (angulo + 90) + ' ' + x + ' ' + y + ')">' +
          esc(corCurta(setor)) + '</text>';
      }).join("");
      return '<svg viewBox="-108 -108 216 216" role="img" aria-label="Roleta com ' + total + ' setores coloridos">' +
          '<circle cx="0" cy="0" r="104" fill="var(--surface-2)" stroke="var(--border-forte)" stroke-width="1.6"></circle>' +
          paths +
          '<circle cx="0" cy="0" r="20" fill="var(--surface)" stroke="var(--border-forte)" stroke-width="1.4"></circle>' +
          '<text x="0" y="-2" text-anchor="middle" font-size="6.4" font-weight="700" fill="var(--texto)">MUNDO</text>' +
          '<text x="0" y="7" text-anchor="middle" font-size="5.4" fill="var(--muted)">MAKER</text>' +
          rotulos +
        '</svg>';
    }

    function conteudoPalco() {
      var art = root.FEIRA && root.FEIRA.art;
      var arte = "";
      if (art && typeof art.roleta === "function") {
        try {
          arte = art.roleta(setores);
        } catch (erro) {
          arte = "";
        }
      }
      if (typeof arte === "string" && /\S/.test(arte) && arte.indexOf("data-roleta-rotor") !== -1) {
        return arte;
      }
      return '<span class="roleta-ponteiro-demo" aria-hidden="true"></span>' +
        '<div class="roleta-rotor" data-roleta-rotor>' + rodaInline() + '</div>';
    }

    function resultadoGirandoHtml() {
      return '<p class="roleta-girando"><span class="roleta-spinner" aria-hidden="true"></span> Girando a roleta...</p>';
    }

    function resultadoHtml() {
      if (estado.girando) return resultadoGirandoHtml();
      if (!estado.resultado) {
        return '<p class="roleta-vazio">Gire para sortear uma cor e descobrir o estado correspondente do firmware.</p>';
      }
      var setor = estado.resultado;
      var real = !!setor.real;
      var luz = setor.luz ? '<span class="roleta-res-luz">' + esc(setor.luz) + '</span>' : "";
      return '<div class="roleta-res" style="--roleta-cor: ' + esc(setor.hex) + '">' +
          '<div class="roleta-res-topo">' +
            '<span class="roleta-led" aria-hidden="true"></span>' +
            '<span class="roleta-res-cor">' + esc(corCurta(setor)) + '</span>' +
            '<span class="roleta-selo ' + (real ? "roleta-selo--real" : "roleta-selo--demo") + '">' +
              (real ? "Estado real do firmware" : "Demonstração de cor") +
            '</span>' +
            luz +
          '</div>' +
          '<p class="roleta-res-titulo">' + esc(setor.titulo) + '</p>' +
          '<p class="roleta-res-significado">' + esc(setor.significado) + '</p>' +
        '</div>';
    }

    function tabelaEstados() {
      var lista = dados && Array.isArray(dados.statusLed) ? dados.statusLed : [];
      var eventos = dados && Array.isArray(dados.eventosLed) ? dados.eventosLed : [];
      if (!lista.length) return "";
      var cores = {};
      setores.forEach(function (setor) { cores[setor.cor] = setor.hex; });
      var linhas = lista.map(function (item, indice) {
        var hex = cores[item.cor] || "#94a3b8";
        return '<tr>' +
          '<td><span class="led-estados-cor" style="--led-cor: ' + esc(hex) + '">' +
            '<span class="led-estados-bola" aria-hidden="true"></span>' + esc(item.titulo) +
          '</span></td>' +
          '<td data-rotulo="Como a luz se comporta">' + esc(item.detalhe) + '</td>' +
        '</tr>';
      }).join("");
      var linhasEventos = eventos.map(function (item) {
        var hex = cores[item.cor] || "#94a3b8";
        return '<tr>' +
          '<td><span class="led-estados-cor" style="--led-cor: ' + esc(hex) + '">' +
            '<span class="led-estados-bola" aria-hidden="true"></span>' + esc(item.momento) +
          '</span></td>' +
          '<td data-rotulo="O que acontece">' + esc(item.detalhe) + '</td>' +
          '<td data-rotulo="Duração"><span class="led-estados-luz">' + esc(item.duracao) + '</span></td>' +
        '</tr>';
      }).join("");
      return '<section class="led-estados" aria-labelledby="led-estados-titulo">' +
        '<h5 class="led-estados-titulo" id="led-estados-titulo">O que cada luz quer dizer</h5>' +
        '<table class="led-estados-tabela">' +
          '<caption>Estados contínuos do LED RGB, do mais comum ao mais raro.</caption>' +
          '<thead><tr><th scope="col">Luz</th><th scope="col">Comportamento</th></tr></thead>' +
          '<tbody>' + linhas + '</tbody>' +
        '</table>' +
        (linhasEventos
          ? '<table class="led-estados-tabela led-estados-tabela--eventos">' +
              '<caption>Momentos pontuais</caption>' +
              '<thead><tr><th scope="col">Momento</th><th scope="col">O que acontece</th><th scope="col">Tempo</th></tr></thead>' +
              '<tbody>' + linhasEventos + '</tbody>' +
            '</table>'
          : "") +
      '</section>';
    }

    function montarEstrutura() {
      var html = cabecalho(
        "Semáforo falante",
        "Gire a roleta: cada cor e cada jeito de piscar conta um estado do LED na feira.",
        "Clique em girar, espere a roda parar e leia o estado sorteado."
      );
      html += '<div class="demo-corpo"><div class="roleta-palco">' + conteudoPalco() + '</div>' +
        '<div class="demo-acoes roleta-acoes">' +
          '<button class="btn btn--primario" type="button" id="roleta-girar">Girar a roleta</button>' +
          '<span class="roleta-aviso-movimento">A roda gira por cerca de 4 segundos.</span>' +
        '</div>' +
        '<div class="roleta-resultado demo-resultado demo-resultado--info" id="roleta-resultado" role="status" aria-live="polite" aria-atomic="true" tabindex="-1">' +
          resultadoHtml() +
        '</div></div>' +
        tabelaEstados();
      alvo.innerHTML = html;

      refs.palco = pegar(".roleta-palco", alvo);
      refs.resultado = pegar("#roleta-resultado", alvo);
      refs.girar = pegar("#roleta-girar", alvo);
      refs.rotor = pegar("[data-roleta-rotor]", alvo);
      if (!refs.rotor && refs.palco) {
        refs.rotor = refs.palco.querySelector("svg") || refs.palco.firstElementChild;
        if (refs.rotor) refs.rotor.setAttribute("data-roleta-rotor", "");
      }
      if (refs.rotor) {
        if (!refs.rotor.classList.contains("roleta-rotor")) refs.rotor.classList.add("roleta-rotor");
        var ehSvg = refs.rotor.namespaceURI && /svg/i.test(refs.rotor.namespaceURI);
        /* Contrato combinado com o art.js: o grupo giratório usa
           transform-box: view-box e origem no centro do SVG (arte.css). */
        if (ehSvg) {
          refs.rotor.style.transformBox = "view-box";
          refs.rotor.style.transformOrigin = "50% 50%";
        } else {
          refs.rotor.style.transformOrigin = "50% 50%";
        }
        refs.rotor.style.transform = "rotate(0deg)";
        refs.rotor.addEventListener("transitionend", function (evento) {
          if (evento.target === refs.rotor && evento.propertyName === "transform") finalizar();
        });
      }
    }

    function finalizar() {
      if (!estado.girando) return;
      limparTimer(estado);
      estado.girando = false;
      estado.resultado = estado.pendente;
      estado.pendente = null;
      if (refs.rotor) refs.rotor.classList.remove("roleta-rotor--reduzido");
      if (refs.girar) {
        refs.girar.disabled = false;
        refs.girar.textContent = "Girar de novo";
      }
      if (refs.resultado) refs.resultado.innerHTML = resultadoHtml();
      focar(alvo, "#roleta-resultado");
    }

    function girar() {
      if (estado.girando || !refs.rotor) return;
      var total = setores.length;
      var indice = sortearIndice(total, estado.ultimo);
      var setor = setores[indice];
      estado.ultimo = indice;
      estado.girando = true;
      estado.pendente = setor;

      var logic = logicaFeira();
      var voltas = semMovimento() ? 0 : 4;
      var base = logic && typeof logic.rotacaoParaSetor === "function"
        ? logic.rotacaoParaSetor(indice, total, voltas)
        : voltas * 360 - (360 / total) * indice;
      var desejado = ((base % 360) + 360) % 360;
      var atual = ((estado.rotacao % 360) + 360) % 360;
      var delta = ((desejado - atual) % 360 + 360) % 360;
      var alvo = estado.rotacao + voltas * 360 + delta;
      estado.rotacao = alvo;

      if (refs.rotor) {
        refs.rotor.classList.toggle("roleta-rotor--reduzido", voltas === 0);
        refs.rotor.style.transform = "rotate(" + alvo + "deg)";
      }
      if (refs.girar) {
        refs.girar.disabled = true;
        refs.girar.textContent = "Girando...";
      }
      if (refs.resultado) refs.resultado.innerHTML = resultadoGirandoHtml();

      agendar(estado, voltas === 0 ? 30 : 4400, finalizar);
    }

    alvo.addEventListener("click", function (evento) {
      var botao = evento.target && evento.target.closest ? evento.target.closest("button") : null;
      if (!botao || !alvo.contains(botao)) return;
      if (botao.id === "roleta-girar") girar();
    });

    montarEstrutura();
  }

  /* ======================================================================
     DEMO 4 — CAIXA DOS SENTIDOS: qual é o tipo do sensor?
     ====================================================================== */

  function montarCaixa(alvo) {
    var dados = dadosFeira();
    var ids = dados && Array.isArray(dados.sensorQuizIds) ? dados.sensorQuizIds : [];
    var sensores = dados && Array.isArray(dados.sensores) ? dados.sensores : [];
    if (!ids.length || !sensores.length) {
      alvo.innerHTML = semDados("sensorQuizIds");
      return;
    }

    var porId = {};
    sensores.forEach(function (sensor) {
      porId[sensor.id] = sensor;
    });
    var candidatos = ids.map(function (id) {
      return porId[id];
    }).filter(Boolean);
    if (!candidatos.length) {
      alvo.innerHTML = semDados("sensores");
      return;
    }

    var quantidadeRodadas = Math.min(6, candidatos.length);
    var estado = {
      fila: [],
      indice: 0,
      puxado: false,
      respondido: false,
      escolha: null,
      acertos: 0,
      final: false,
      timer: null
    };

    var TIPOS = [
      { chave: "digital", nome: "Digital", detalhe: "Lê apenas 0 ou 1 (ligado/desligado)." },
      { chave: "analogico", nome: "Analógico", detalhe: "Lê uma faixa contínua de valores." },
      { chave: "especial", nome: "Especial", detalhe: "Usa um protocolo ou temporização próprios." }
    ];

    var EXPLICACOES = {
      digital: "Sensores digitais respondem com dois estados: HIGH ou LOW. O ESP32 lê com digitalRead.",
      analogico: "Sensores analógicos variam a tensão de saída; o ESP32 lê com analogRead e converte em valores.",
      especial: "Sensores especiais precisam de um protocolo ou biblioteca (1-Wire, IR, PWM etc.), não só um digitalRead."
    };

    function sortearFila() {
      var logic = logicaFeira();
      var sorteados = logic && typeof logic.sortearSemRepeticao === "function"
        ? logic.sortearSemRepeticao(candidatos, quantidadeRodadas)
        : embaralhar(candidatos).slice(0, quantidadeRodadas);
      return sorteados;
    }

    function totalRodadas() {
      return estado.fila.length || quantidadeRodadas;
    }

    function sensorAtual() {
      return estado.fila[estado.indice] || null;
    }

    function rotuloLinha(linha) {
      if (linha === "G") return "GND";
      if (linha === "V") return "VCC";
      return "Sinal";
    }

    function ligacaoHtml(sensor) {
      var ligacao = Array.isArray(sensor.ligacao) ? sensor.ligacao : [];
      if (!ligacao.length) return "";
      return '<div class="caixa-ligacao">' +
          '<p class="caixa-ligacao-titulo">Ligação G-V-S</p>' +
          '<ul class="caixa-ligacao-lista">' +
            ligacao.map(function (pino) {
              var classe = "caixa-linha caixa-linha--" + String(pino.linha || "s").toLowerCase();
              return '<li class="' + classe + '">' +
                '<span class="caixa-linha-rotulo">' + esc(pino.rotulo) + '</span>' +
                '<span class="caixa-linha-seta" aria-hidden="true">→</span>' +
                '<span class="caixa-linha-valor">' + esc(pino.linha || "S") + ' · ' + rotuloLinha(pino.linha) + '</span>' +
                (pino.gpio ? '<span class="caixa-linha-gpio">' + esc(pino.gpio) + '</span>' : "") +
              '</li>';
            }).join("") +
          '</ul>' +
        '</div>';
    }

    function sensorHtml() {
      if (estado.final) {
        return '<div class="caixa-final">' +
            '<p class="caixa-final-selo" aria-hidden="true">✓</p>' +
            '<p class="caixa-final-titulo">Caixa dos Sentidos concluída!</p>' +
            '<p class="caixa-final-placar"><strong>' + estado.acertos + ' de ' + totalRodadas() + '</strong> sensores classificados corretamente.</p>' +
            '<p class="caixa-final-texto">Cada sensor tem um tipo de leitura diferente. ' +
            'Na estação 4, o visitante abre a caixa, sente o sensor e tenta descobrir qual é.</p>' +
          '</div>';
      }
      if (!estado.puxado) {
        return '<div class="caixa-fechada">' +
            '<span class="caixa-fechada-icone" aria-hidden="true">' +
              '<svg viewBox="0 0 48 48" focusable="false"><path d="M8 20 24 10l16 10v20H8z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 20h32M18 40V28h12v12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>' +
            '</span>' +
            '<p class="caixa-fechada-titulo">Caixa fechada</p>' +
            '<p class="caixa-fechada-texto">Puxe um sensor para ver o nome, a categoria e a ligação — mas a classificação fica escondida.</p>' +
          '</div>';
      }
      var sensor = sensorAtual();
      if (!sensor) return "";
      return '<div class="caixa-sensor-card">' +
          '<p class="caixa-sensor-cat"><span class="tag">' + esc(sensor.categoria) + '</span></p>' +
          '<p class="caixa-sensor-nome">' + esc(sensor.nome) + '</p>' +
          '<p class="caixa-sensor-desc">' + esc(sensor.descricao) + '</p>' +
          ligacaoHtml(sensor) +
          '<p class="caixa-escondido"><span aria-hidden="true">🔒</span> Classificação escondida: digital, analógico ou especial?</p>' +
        '</div>';
    }

    function tiposHtml() {
      var sensor = sensorAtual();
      var travado = estado.final || !estado.puxado || estado.respondido;
      return TIPOS.map(function (tipo) {
        var ativo = estado.escolha === tipo.chave;
        var classes = "caixa-tipo caixa-tipo--" + tipo.chave + (ativo ? " caixa-tipo--ativo" : "");
        var revelado = estado.respondido && sensor && sensor.tipo === tipo.chave;
        if (revelado) classes += " caixa-tipo--correto";
        return '<button type="button" class="' + classes + '" data-caixa-tipo="' + tipo.chave + '"' +
          ' aria-pressed="' + (ativo ? "true" : "false") + '" aria-label="Classificar como ' + tipo.nome + '"' +
          (travado ? " disabled" : "") + '>' +
          '<span class="caixa-tipo-nome">' + tipo.nome + '</span>' +
          '<span class="caixa-tipo-desc">' + tipo.detalhe + '</span>' +
        '</button>';
      }).join("");
    }

    function feedbackHtml() {
      if (!estado.puxado) {
        return '<p class="caixa-vazio">Puxe o primeiro sensor para começar.</p>';
      }
      if (!estado.respondido) {
        return '<p class="caixa-vazio">Observe a descrição e a ligação. Depois escolha <strong>digital</strong>, <strong>analógico</strong> ou <strong>especial</strong>.</p>';
      }
      var sensor = sensorAtual();
      if (!sensor) return "";
      var acertou = estado.escolha === sensor.tipo;
      var resposta = '<div class="caixa-resposta">' +
          '<p class="caixa-resposta-titulo ' + (acertou ? "caixa-resposta-titulo--ok" : "caixa-resposta-titulo--erro") + '">' +
            '<span aria-hidden="true">' + (acertou ? "✓" : "✗") + '</span> ' +
            (acertou ? "Acertou!" : "Quase!") +
          '</p>' +
          '<p class="caixa-resposta-tipo">A classificação correta é <strong>' + esc(rotuloTipo(sensor.tipo)) + '</strong>.</p>' +
          '<p class="caixa-resposta-explica">' + esc(EXPLICACOES[sensor.tipo] || "") + '</p>' +
          '<p class="caixa-resposta-dica"><strong>Dica de uso:</strong> ' + esc(sensor.ideia || "") + '</p>' +
        '</div>';
      if (estado.final) {
        resposta += '<p class="caixa-fim">Fim das 6 rodadas! Veja o placar na caixa acima e jogue de novo se quiser.</p>';
      }
      return resposta;
    }

    function render() {
      var total = totalRodadas();
      var rodada = estado.final ? total : estado.indice + 1;
      var html = cabecalho(
        "Caixa dos Sentidos",
        "Seis sensores do kit saem da caixa por sorteio. Descubra se cada um só liga e desliga, mede uma quantidade ou é especial.",
        "Puxe um sensor, leia a descrição e a ligação e escolha o tipo. As 12 opções da caixa nunca se repetem."
      );
      html += '<div class="demo-corpo"><div class="demo-placar caixa-topo">' +
          '<span class="chip caixa-progresso" id="caixa-progresso">Sensor <strong>' + rodada + '</strong> de ' + total + '</span>' +
          '<span class="chip caixa-placar">Acertos: <strong>' + estado.acertos + '</strong> de ' + total + '</span>' +
        '</div>' +
        '<div class="caixa-sensor" id="caixa-sensor" tabindex="-1" aria-live="polite">' + sensorHtml() + '</div>' +
        '<div class="demo-acoes caixa-acoes">' +
          '<button class="btn btn--primario" type="button" id="caixa-puxar"' +
            (estado.final || (estado.puxado && !estado.respondido) ? " disabled" : "") + '>' +
            (!estado.puxado ? "Puxar sensor" : estado.respondido && !estado.final ? "Puxar próximo sensor" : "Puxar sensor") +
          '</button>' +
          '<button class="btn btn--fantasma" type="button" id="caixa-reiniciar"' + (estado.final ? "" : " hidden") + '>Jogar de novo</button>' +
        '</div>' +
        '<div class="caixa-tipos" role="group" aria-label="Classifique o sensor">' + tiposHtml() + '</div>' +
        '<div class="caixa-feedback demo-resultado' +
          (estado.final ? " demo-resultado--ok" : estado.respondido ? (estado.escolha === (sensorAtual() && sensorAtual().tipo) ? " demo-resultado--ok" : " demo-resultado--erro") : " demo-resultado--info") +
          '" id="caixa-feedback" role="status" aria-live="polite" aria-atomic="true" tabindex="-1">' +
          feedbackHtml() +
        '</div></div>';
      alvo.innerHTML = html;
    }

    function puxar() {
      if (estado.final) return;
      if (estado.puxado && !estado.respondido) return;
      if (estado.respondido) {
        estado.indice += 1;
        if (estado.indice >= totalRodadas()) {
          estado.final = true;
          estado.puxado = false;
          render();
          focar(alvo, "#caixa-feedback");
          return;
        }
        estado.respondido = false;
        estado.escolha = null;
      }
      estado.puxado = true;
      render();
      focar(alvo, "#caixa-sensor");
    }

    function responder(tipo) {
      if (estado.final || !estado.puxado || estado.respondido) return;
      var sensor = sensorAtual();
      if (!sensor) return;
      estado.respondido = true;
      estado.escolha = tipo;
      if (tipo === sensor.tipo) estado.acertos += 1;
      if (estado.indice >= totalRodadas() - 1) estado.final = true;
      render();
      focar(alvo, "#caixa-feedback");
    }

    function reiniciar() {
      estado.fila = sortearFila();
      estado.indice = 0;
      estado.puxado = false;
      estado.respondido = false;
      estado.escolha = null;
      estado.acertos = 0;
      estado.final = false;
      render();
      focar(alvo, "#caixa-puxar");
    }

    alvo.addEventListener("click", function (evento) {
      var botao = evento.target && evento.target.closest ? evento.target.closest("button") : null;
      if (!botao || !alvo.contains(botao)) return;
      var tipo = botao.getAttribute("data-caixa-tipo");
      if (tipo) responder(tipo);
      else if (botao.id === "caixa-puxar") puxar();
      else if (botao.id === "caixa-reiniciar") reiniciar();
    });

    estado.fila = sortearFila();
    render();
  }

  /* ======================================================================
     DEMO 5 — LINHA DO TEMPO: a memória que não esquece
     ====================================================================== */

  function montarTimeline(alvo) {
    var dados = dadosFeira();
    var passos = dados && Array.isArray(dados.linhaDoTempo) ? dados.linhaDoTempo : [];
    if (!passos.length) {
      alvo.innerHTML = semDados("linhaDoTempo");
      return;
    }

    var total = passos.length;
    var estado = {
      offline: false,
      passo: -1,
      concluidos: 0,
      simulando: false,
      registros: [],
      timer: null
    };
    var refs = {};

    function detalheDoPasso(indice) {
      if (estado.offline && indice === 2) {
        return "Sem internet: o UID é procurado na lista local gravada na Flash — a decisão acontece aqui mesmo.";
      }
      if (estado.offline && indice === 5) {
        return "Offline: o log é gravado na Flash e entra na fila para sincronizar quando a internet voltar.";
      }
      return passos[indice].detalhe;
    }

    function seloDoPasso(indice) {
      if (!estado.offline) return "";
      if (indice === 2) return "consulta local na Flash";
      if (indice === 5) return "log local; sincroniza depois";
      return "";
    }

    function itensHtml() {
      return passos.map(function (passo, indice) {
        var selo = seloDoPasso(indice);
        return '<li class="timeline-item' + (selo ? " timeline-item--offline" : "") + '" data-timeline-passo="' + indice + '">' +
            '<span class="timeline-pregador" aria-hidden="true"></span>' +
            '<div class="timeline-cartao">' +
              '<span class="timeline-num" aria-hidden="true">' + (indice + 1) + '</span>' +
              '<p class="timeline-titulo">' + esc(passo.titulo) + '</p>' +
              '<p class="timeline-detalhe">' + esc(detalheDoPasso(indice)) + '</p>' +
              '<span class="timeline-selo"' + (selo ? "" : " hidden") + '>' + esc(selo) + '</span>' +
              '<span class="timeline-check" aria-hidden="true">✓</span>' +
            '</div>' +
          '</li>';
      }).join("");
    }

    function montarEstrutura() {
      var html = cabecalho(
        "A memória que não esquece",
        "Acompanhe o caminho do cartão até virar uma linha no painel — com internet ou sem.",
        "Clique em Simular acesso. Marque “Internet caiu” para ver a consulta local na Flash e o log offline."
      );
      html += '<div class="demo-corpo"><div class="timeline-chave">' +
          '<label class="timeline-switch" for="timeline-offline">' +
            '<input type="checkbox" id="timeline-offline" class="timeline-switch-input">' +
            '<span class="timeline-switch-trilho" aria-hidden="true"><span class="timeline-switch-bolinha"></span></span>' +
            '<span class="timeline-switch-texto">' +
              '<strong>Internet caiu</strong>' +
              '<small>O ESP32 continua decidindo com a lista local na Flash.</small>' +
            '</span>' +
          '</label>' +
        '</div>' +
        '<div class="timeline-varal">' +
          '<ol class="timeline-cartoes" aria-label="Etapas do acesso">' + itensHtml() + '</ol>' +
        '</div>' +
        '<div class="timeline-progresso" id="timeline-progresso" role="progressbar" aria-label="Progresso do acesso" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="0">' +
          '<span class="timeline-progresso-fill"></span>' +
        '</div>' +
        '<p class="timeline-status demo-resultado demo-resultado--info" id="timeline-status" role="status" aria-live="polite" tabindex="-1"></p>' +
        '<div class="demo-acoes timeline-acoes">' +
          '<button class="btn btn--primario" type="button" id="timeline-simular">Simular acesso</button>' +
          '<button class="btn btn--fantasma" type="button" id="timeline-reiniciar" disabled>Reiniciar</button>' +
        '</div>' +
        '<div class="timeline-painel" id="timeline-painel" role="status" aria-live="polite" aria-atomic="true">' +
          '<div class="timeline-painel-topo">' +
            '<span class="timeline-painel-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
            '<span class="timeline-painel-titulo">Painel Web · Controle de Acesso</span>' +
            '<span class="timeline-painel-conexao" id="timeline-conexao">online</span>' +
          '</div>' +
          '<div class="timeline-painel-corpo">' +
            '<ul class="timeline-registros" id="timeline-registros"></ul>' +
            '<p class="timeline-registros-vazio" id="timeline-registros-vazio">Nenhum acesso registrado nesta sessão.</p>' +
          '</div>' +
        '</div></div>';
      alvo.innerHTML = html;

      refs.itens = pegarTodos("[data-timeline-passo]", alvo);
      refs.progresso = pegar("#timeline-progresso", alvo);
      refs.fill = pegar(".timeline-progresso-fill", alvo);
      refs.status = pegar("#timeline-status", alvo);
      refs.simular = pegar("#timeline-simular", alvo);
      refs.reiniciar = pegar("#timeline-reiniciar", alvo);
      refs.offline = pegar("#timeline-offline", alvo);
      refs.registros = pegar("#timeline-registros", alvo);
      refs.vazio = pegar("#timeline-registros-vazio", alvo);
      refs.conexao = pegar("#timeline-conexao", alvo);
      refs.painel = pegar("#timeline-painel", alvo);

      if (refs.offline) {
        refs.offline.addEventListener("change", function () {
          estado.offline = !!refs.offline.checked;
          aplicar();
        });
      }
    }

    function statusTexto() {
      if (estado.simulando && estado.passo >= 0) {
        return "Etapa " + (estado.passo + 1) + " de " + total + ": " + passos[estado.passo].titulo + ". Aguarde...";
      }
      if (estado.concluidos >= total) {
        var ultimo = estado.registros[estado.registros.length - 1];
        return "Acesso concluído: Lucas Silva — LIBERADO." +
          (ultimo && ultimo.offline
            ? " Log gravado na Flash; será sincronizado quando a internet voltar."
            : " Registro sincronizado com o Painel Web.");
      }
      return "Pressione Simular acesso para acompanhar o caminho do cartão, do leitor ao Painel Web.";
    }

    function renderizarPainel() {
      if (!refs.registros) return;
      refs.registros.innerHTML = estado.registros.map(function (registro) {
        return '<li class="timeline-registro">' +
            '<span class="timeline-registro-hora">' + esc(registro.hora) + '</span>' +
            '<span class="timeline-registro-quem">Lucas Silva</span>' +
            '<span class="timeline-registro-status">LIBERADO</span>' +
            '<span class="timeline-registro-nota">' +
              (registro.offline ? "Offline: log na Flash; sincroniza depois" : "Sincronizado com a nuvem") +
            '</span>' +
          '</li>';
      }).join("");
      if (refs.vazio) refs.vazio.hidden = estado.registros.length > 0;
      if (refs.conexao) {
        refs.conexao.textContent = estado.offline ? "offline" : "online";
        refs.conexao.className = "timeline-painel-conexao" +
          (estado.offline ? " timeline-painel-conexao--off" : " timeline-painel-conexao--on");
      }
    }

    function aplicar() {
      var feito = estado.simulando ? estado.passo : estado.concluidos;
      refs.itens.forEach(function (item, indice) {
        var detalhe = pegar(".timeline-detalhe", item);
        if (detalhe) detalhe.textContent = detalheDoPasso(indice);
        var selo = pegar(".timeline-selo", item);
        var textoSelo = seloDoPasso(indice);
        if (selo) {
          selo.textContent = textoSelo;
          selo.hidden = !textoSelo;
        }
        item.classList.toggle("timeline-item--offline", !!textoSelo);
        item.classList.toggle("timeline-item--ativo", estado.simulando && estado.passo === indice);
        item.classList.toggle("timeline-item--feito", indice < feito);
        if (estado.simulando && estado.passo === indice) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });

      var andamento = estado.simulando ? estado.passo + 1 : estado.concluidos;
      var percentual = Math.round((andamento / total) * 100);
      if (refs.fill) refs.fill.style.width = percentual + "%";
      if (refs.progresso) refs.progresso.setAttribute("aria-valuenow", String(Math.max(0, andamento)));
      if (refs.status) refs.status.textContent = statusTexto();

      if (refs.simular) {
        refs.simular.disabled = estado.simulando;
        refs.simular.textContent = estado.simulando
          ? "Simulando..."
          : estado.concluidos >= total ? "Simular de novo" : "Simular acesso";
      }
      if (refs.reiniciar) refs.reiniciar.disabled = estado.simulando;
      if (refs.offline) refs.offline.checked = estado.offline;
      renderizarPainel();
    }

    function concluir() {
      limparTimer(estado);
      estado.simulando = false;
      estado.passo = -1;
      estado.concluidos = total;
      estado.registros.push({ hora: agora(), offline: estado.offline });
      aplicar();
      focar(alvo, "#timeline-painel");
    }

    function proximoPasso(indice) {
      if (!estado.simulando) return;
      if (indice >= total) {
        concluir();
        return;
      }
      estado.passo = indice;
      aplicar();
      agendar(estado, 700, function () {
        proximoPasso(indice + 1);
      });
    }

    function simular() {
      if (estado.simulando) return;
      limparTimer(estado);
      estado.simulando = true;
      estado.passo = -1;
      estado.concluidos = 0;
      aplicar();
      focar(alvo, "#timeline-status");
      if (semMovimento()) {
        concluir();
        return;
      }
      proximoPasso(0);
    }

    function reiniciar() {
      limparTimer(estado);
      estado.offline = false;
      estado.passo = -1;
      estado.concluidos = 0;
      estado.simulando = false;
      estado.registros = [];
      aplicar();
      focar(alvo, "#timeline-simular");
    }

    alvo.addEventListener("click", function (evento) {
      var botao = evento.target && evento.target.closest ? evento.target.closest("button") : null;
      if (!botao || !alvo.contains(botao)) return;
      if (botao.id === "timeline-simular") simular();
      else if (botao.id === "timeline-reiniciar") reiniciar();
    });

    montarEstrutura();
    aplicar();
  }

  /* ======================================================================
     API pública
     ====================================================================== */

  var MONTADORES = {
    gvs: montarGvs,
    nfc: montarNfc,
    roleta: montarRoleta,
    caixa: montarCaixa,
    timeline: montarTimeline
  };

  function montar(elemento) {
    if (!elemento || elemento.nodeType !== 1) return false;
    if (elemento.getAttribute("data-montado") === "1") return false;
    var tipo = elemento.getAttribute("data-demo");
    var montador = MONTADORES[tipo];
    if (!montador) {
      elemento.innerHTML = '<p class="demo-erro" role="status">Demo desconhecida: ' + esc(tipo || "sem nome") + '.</p>';
      elemento.setAttribute("data-montado", "1");
      return false;
    }
    montador(elemento);
    elemento.setAttribute("data-montado", "1");
    return true;
  }

  function montarTodos(raiz) {
    var escopo = raiz && raiz.nodeType === 1 ? raiz : doc;
    if (!escopo) return 0;
    var containers = [];
    if (escopo.matches && escopo.matches("[data-demo]")) containers.push(escopo);
    containers = containers.concat(pegarTodos("[data-demo]", escopo));
    var montados = 0;
    containers.forEach(function (container) {
      if (montar(container)) montados += 1;
    });
    return montados;
  }

  root.FEIRA = root.FEIRA || {};
  root.FEIRA.games = {
    montarTodos: montarTodos,
    montar: montar
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.FEIRA.games;
  }
})(typeof window !== "undefined" ? window : globalThis);
