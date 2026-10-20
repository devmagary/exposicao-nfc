/* ==========================================================================
   Regras puras da feira — usadas pelo site e pelos testes.
   Não depende de DOM. Também exporta para Node (module.exports).
   ========================================================================== */
(function (root) {
  "use strict";

  const RESULTADOS = {
    liberado: { rotulo: "LIBERADO", cor: "#34d399", led: "verde", icone: "check" },
    negado: { rotulo: "NEGADO", cor: "#f87171", led: "vermelho", icone: "x" },
    bloqueado: { rotulo: "BLOQUEADO", cor: "#fbbf24", led: "amarelo", icone: "lock" }
  };

  const TIPOS = {
    digital: { rotulo: "Digital", cor: "digital" },
    analogico: { rotulo: "Analógico", cor: "analogico" },
    especial: { rotulo: "Especial", cor: "especial" }
  };

  function normalizar(texto) {
    return String(texto == null ? "" : texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizarUid(uid) {
    return String(uid == null ? "" : uid).replace(/\s+/g, "").toUpperCase();
  }

  function resultadoCartao(uid, cartoes) {
    const procurado = normalizarUid(uid);
    const lista = Array.isArray(cartoes) ? cartoes : [];
    return lista.find(function (cartao) {
      return normalizarUid(cartao && cartao.uid) === procurado;
    }) || null;
  }

  function statusDoCartao(resultado) {
    return RESULTADOS[resultado] || RESULTADOS.negado;
  }

  function formatarTipo(tipo) {
    return (TIPOS[tipo] && TIPOS[tipo].rotulo) || "Especial";
  }

  function contarPorTipo(sensores) {
    const contagem = { digital: 0, analogico: 0, especial: 0 };
    (sensores || []).forEach(function (sensor) {
      if (contagem[sensor.tipo] !== undefined) contagem[sensor.tipo] += 1;
    });
    return contagem;
  }

  function proximoIndice(atual, total, passo) {
    if (!Number.isInteger(total) || total <= 0) return 0;
    const passoNormalizado = Number.isInteger(passo) ? passo : 1;
    return ((atual + passoNormalizado) % total + total) % total;
  }

  function sortearSemRepeticao(pool, quantidade, rng) {
    const sorteio = typeof rng === "function" ? rng : Math.random;
    const copia = (pool || []).slice();
    for (let i = copia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(sorteio() * (i + 1));
      const temp = copia[i];
      copia[i] = copia[j];
      copia[j] = temp;
    }
    const limite = Math.max(0, Math.min(quantidade || 0, copia.length));
    return copia.slice(0, limite);
  }

  function anguloSetor(indice, total) {
    if (!total) return 0;
    return (360 / total) * indice;
  }

  /* O setor 0 fica centralizado no topo quando a rotação é 0.
     Para trazer o setor `indice` ao topo: voltas*360 - indice*(360/total). */
  function rotacaoParaSetor(indice, total, voltas) {
    const VOLTAS = voltas == null ? 4 : voltas;
    if (!total) return 0;
    return VOLTAS * 360 - anguloSetor(indice, total);
  }

  /* Texto para colar/levar à papelaria: um manual por estação, com o material
     de uso comum separado no começo. */
  function textoMateriais(prioritarios, extras, estacoes) {
    const listaPrioritarios = prioritarios || [];
    const listaExtras = extras || [];
    const listaEstacoes = (estacoes || []).slice().sort(function (a, b) { return a.numero - b.numero; });
    const tudo = listaPrioritarios.concat(listaExtras);
    const linhas = ["MATERIAIS E MONTAGEM — FEIRA MUNDO MAKER", ""];

    function adicionar(itens) {
      itens.forEach(function (material) {
        linhas.push("[ ] " + material.item + " — " + material.qtd);
      });
    }

    linhas.push("MATERIAL DE USO COMUM (as cinco estações)");
    adicionar(tudo.filter(function (material) { return material.sala === true; }));

    listaEstacoes.forEach(function (estacao) {
      const itens = tudo.filter(function (material) {
        return !material.sala && Array.isArray(material.estacoes) && material.estacoes.indexOf(estacao.id) !== -1;
      });
      linhas.push("", "ESTAÇÃO " + estacao.numero + " — " + estacao.nome.toUpperCase());
      linhas.push("Para que serve: " + estacao.resumo);
      linhas.push("Materiais da estação:");
      if (itens.length) adicionar(itens);
      else linhas.push("(usa apenas o material de uso comum)");
      linhas.push("Como montar:");
      (estacao.montagem || []).forEach(function (passo, indice) {
        linhas.push((indice + 1) + ". " + passo);
      });
    });

    linhas.push("", "Total: " + tudo.length + " itens (" + listaPrioritarios.length + " prioritários + " +
      listaExtras.length + " complementares).");
    return linhas.join("\n");
  }

  /* Conta quantas linhas de item saíram em `textoMateriais`, para os testes
     e para conferir que todos os itens aparecem pelo menos uma vez. */
  function contarLinhasMateriais(texto) {
    return String(texto || "").split("\n").filter(function (linha) {
      return linha.indexOf("[ ] ") === 0;
    }).length;
  }

  const api = {
    RESULTADOS: RESULTADOS,
    TIPOS: TIPOS,
    normalizar: normalizar,
    normalizarUid: normalizarUid,
    resultadoCartao: resultadoCartao,
    statusDoCartao: statusDoCartao,
    formatarTipo: formatarTipo,
    contarPorTipo: contarPorTipo,
    proximoIndice: proximoIndice,
    sortearSemRepeticao: sortearSemRepeticao,
    anguloSetor: anguloSetor,
    rotacaoParaSetor: rotacaoParaSetor,
    textoMateriais: textoMateriais,
    contarLinhasMateriais: contarLinhasMateriais
  };

  root.FEIRA = root.FEIRA || {};
  root.FEIRA.logic = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
