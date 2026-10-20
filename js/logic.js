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

  function textoMateriais(prioritarios) {
    const linhas = ["LISTA PRIORITÁRIA — FEIRA MUNDO MAKER", ""];
    (prioritarios || []).forEach(function (material, indice) {
      const numero = String(indice + 1).padStart(2, "0");
      linhas.push("[ ] " + numero + ". " + material.item + " — " + material.qtd + " — " + material.uso);
    });
    linhas.push("", "Base: Material novo (lista prioritária).");
    return linhas.join("\n");
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
    textoMateriais: textoMateriais
  };

  root.FEIRA = root.FEIRA || {};
  root.FEIRA.logic = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
