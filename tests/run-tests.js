#!/usr/bin/env node
/* ==========================================================================
   Testes estáticos da Feira Mundo Maker:
   dados, regras puras, referências do HTML, contraste WCAG e sintaxe dos JS.
   Uso: node tests/run-tests.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..");
const erros = [];

function falhar(mensagem) { erros.push(mensagem); }
function garantir(condicao, mensagem) { if (!condicao) falhar(mensagem); }
function iguais(obtido, esperado, mensagem) {
  if (obtido !== esperado) falhar(mensagem + " (obtido: " + JSON.stringify(obtido) + ", esperado: " + JSON.stringify(esperado) + ")");
}
function ler(relativo) { return fs.readFileSync(path.join(RAIZ, relativo), "utf8"); }
function existe(relativo) { return fs.existsSync(path.join(RAIZ, relativo)); }

/* --------------------------------------------------------------------------
   Carregamento dos módulos puros
   -------------------------------------------------------------------------- */
const dados = require(path.join(RAIZ, "js", "data.js"));
const logic = require(path.join(RAIZ, "js", "logic.js"));

/* --------------------------------------------------------------------------
   Dados: meta e estações
   -------------------------------------------------------------------------- */
garantir(dados && typeof dados === "object", "data.js não exportou um objeto.");
garantir(dados.meta && dados.meta.titulo, "meta.titulo ausente.");
garantir(dados.meta && dados.meta.subtitulo, "meta.subtitulo ausente.");
garantir(dados.meta && dados.meta.escola, "meta.escola ausente.");
garantir(Array.isArray(dados.estacoes), "estacoes deve ser uma lista.");
iguais(dados.estacoes.length, 5, "devem existir 5 estações.");

const idsEstacoes = dados.estacoes.map(function (estacao) { return estacao.id; });
garantir(new Set(idsEstacoes).size === idsEstacoes.length, "ids de estação duplicados.");
const numeros = dados.estacoes.map(function (estacao) { return estacao.numero; }).sort(function (a, b) { return a - b; });
iguais(JSON.stringify(numeros), JSON.stringify([1, 2, 3, 4, 5]), "as estações devem ser numeradas de 1 a 5.");

const demosEsperadas = ["gvs", "nfc", "roleta", "caixa", "timeline"];
const demosObtidas = dados.estacoes.map(function (estacao) { return estacao.demo; });
iguais(JSON.stringify(demosObtidas), JSON.stringify(demosEsperadas), "cada estação deve ter uma demo distinta.");
const coresValidas = ["cyan", "emerald", "amber", "rose", "violet"];
dados.estacoes.forEach(function (estacao) {
  garantir(coresValidas.indexOf(estacao.cor) !== -1, "cor inválida na estação " + estacao.numero + ".");
  garantir(Array.isArray(estacao.visitante) && estacao.visitante.length >= 2, "estação " + estacao.numero + ": visitante incompleto.");
  garantir(Array.isArray(estacao.montagem) && estacao.montagem.length >= 2, "estação " + estacao.numero + ": montagem incompleta.");
  garantir(Array.isArray(estacao.materiais) && estacao.materiais.length >= 3, "estação " + estacao.numero + ": materiais incompletos.");
  garantir(typeof estacao.resumo === "string" && estacao.resumo.length > 30, "estação " + estacao.numero + ": resumo curto.");
});

const kit = dados.kitAoVivo;
garantir(kit && typeof kit === "object", "kitAoVivo ausente.");
iguais(kit.aoVivo, "toque", "o kit ao vivo deve ficar na Estação 2 (toque).");
iguais(kit.espelho, "memoria", "o painel espelhado deve ficar na Estação 5 (memoria).");
garantir(dados.estacoes.find(function (estacao) { return estacao.id === kit.aoVivo; }).aoVivo === true, "Estação 2 deve estar marcada como aoVivo.");
garantir(dados.estacoes.find(function (estacao) { return estacao.id === kit.espelho; }).espelho === true, "Estação 5 deve estar marcada como espelho.");
["passos", "cuidados", "planoB"].forEach(function (chave) {
  garantir(Array.isArray(kit[chave]) && kit[chave].length >= 3, "kitAoVivo." + chave + " deve ter pelo menos 3 itens.");
});
garantir(kit.titulo && kit.resumo && kit.aviso, "kitAoVivo precisa de titulo, resumo e aviso.");

/* --------------------------------------------------------------------------
   Dados: materiais
   -------------------------------------------------------------------------- */
const prioritarios = dados.materiais.prioritarios;
const extras = dados.materiais.extras;
garantir(Array.isArray(prioritarios), "materiais.prioritarios deve ser uma lista.");
garantir(Array.isArray(extras), "materiais.extras deve ser uma lista.");
iguais(prioritarios.length, 20, "a lista prioritária deve ter 20 itens (Material novo).");
iguais(extras.length, 11, "a lista complementar deve ter 11 itens (sem zip e sem bexigas).");

const idsMateriais = prioritarios.concat(extras).map(function (material) { return material.id; });
garantir(new Set(idsMateriais).size === idsMateriais.length, "ids de material duplicados.");
prioritarios.concat(extras).forEach(function (material) {
  garantir(material.item && material.qtd && material.uso, "material incompleto: " + JSON.stringify(material));
});

function materialPorNome(nome) {
  return prioritarios.find(function (material) { return material.item.indexOf(nome) !== -1; });
}
garantir(materialPorNome("Cartolina branca"), "falta Cartolina branca.");
garantir(materialPorNome("Papel cartão preto"), "falta Papel cartão preto.");
garantir(materialPorNome("Papel cartão vermelho"), "falta Papel cartão vermelho.");
garantir(materialPorNome("Papel cartão amarelo"), "falta Papel cartão amarelo.");
garantir(materialPorNome("Papel metro marrom"), "falta Papel metro marrom (kraft).");
garantir(materialPorNome("EVA"), "falta EVA colorido.");
garantir(materialPorNome("guache"), "falta Kit de guache.");
garantir(materialPorNome("Barbante de algodão"), "falta Barbante de algodão.");
iguais(materialPorNome("Papel cartão preto").qtd, "2 folhas", "quantidade do papel cartão preto deve ser 2 folhas.");
iguais(materialPorNome("Papel cartão amarelo").qtd, "3 folhas", "quantidade do papel cartão amarelo deve ser 3 folhas.");
iguais(materialPorNome("Cartolina branca").qtd, "5 a 6 folhas", "quantidade da cartolina branca deve ser 5 a 6 folhas.");
garantir(materialPorNome("EVA").qtd.indexOf("3") !== -1, "EVA deve ter 3 folhas.");

const extrasTexto = extras.map(function (material) { return material.item; }).join(" | ");
garantir(/papel[aã]o/i.test(extrasTexto), "os complementares devem citar papelão.");
garantir(/velcro/i.test(extrasTexto), "os complementares devem citar velcro.");
garantir(/pregadores/i.test(extrasTexto), "os complementares devem citar pregadores.");
garantir(!/zip/i.test(extrasTexto), "a lista não deve ter sacos zip.");
garantir(!/bexiga|bal[aã]o/i.test(extrasTexto), "a lista não deve ter bexigas/balões.");
const todoConteudo = JSON.stringify(dados);
garantir(!/sacos?\s+pl[aá]sticos?\s+zip|saquinhos?\s+zip/i.test(todoConteudo), "nenhuma estação deve usar saquinhos zip.");
garantir(!/bexiga|bal[aã]o/i.test(todoConteudo), "nenhuma estação deve usar bexigas/balões.");

/* --------------------------------------------------------------------------
   Dados: sensores
   -------------------------------------------------------------------------- */
const sensores = dados.sensores;
garantir(Array.isArray(sensores), "sensores deve ser uma lista.");
iguais(sensores.length, 37, "devem existir 37 sensores.");
const numerosSensores = sensores.map(function (sensor) { return sensor.id; }).sort(function (a, b) { return a - b; });
iguais(JSON.stringify(numerosSensores), JSON.stringify(Array.from({ length: 37 }, function (_, i) { return i + 1; })), "ids dos sensores devem ser 1..37.");
iguais(new Set(sensores.map(function (sensor) { return sensor.nome; })).size, 37, "nomes de sensores duplicados.");

const contagem = logic.contarPorTipo(sensores);
iguais(contagem.digital, 21, "devem existir 21 sensores digitais.");
iguais(contagem.analogico, 9, "devem existir 9 sensores analógicos.");
iguais(contagem.especial, 7, "devem existir 7 sensores especiais.");

const categorias = new Set(sensores.map(function (sensor) { return sensor.categoria; }));
iguais(categorias.size, 6, "devem existir 6 categorias de sensores.");

const pinosProibidos = /IO\s*35|IO\s*36|IO\s*37/i;
sensores.forEach(function (sensor) {
  garantir(["digital", "analogico", "especial"].indexOf(sensor.tipo) !== -1, "tipo inválido no sensor " + sensor.nome + ".");
  garantir(Array.isArray(sensor.ligacao) && sensor.ligacao.length >= 2, "ligação incompleta no sensor " + sensor.nome + ".");
  const gpios = sensor.ligacao.map(function (item) { return item.gpio || ""; }).join(" ");
  garantir(!pinosProibidos.test(gpios), "sensor " + sensor.nome + " usa pino proibido.");
  sensor.ligacao.forEach(function (item) {
    garantir(["G", "V", "S"].indexOf(item.linha) !== -1, "linha inválida no sensor " + sensor.nome + ".");
  });
});

const rele = sensores.find(function (sensor) { return sensor.id === 37; });
garantir(rele && rele.ligacao.some(function (item) { return item.valor === "5 V"; }), "o módulo de relé deve indicar alimentação de 5 V.");

/* --------------------------------------------------------------------------
   Desenhos dos 37 sensores
   -------------------------------------------------------------------------- */
const art = require(path.join(RAIZ, "js", "art.js"));
garantir(art && typeof art.figuraSensor === "function", "art.figuraSensor deve existir.");
const desenhos = sensores.map(function (sensor) {
  garantir(typeof sensor.visual === "string" && sensor.visual.length > 2, "sensor " + sensor.id + ": campo visual ausente.");
  garantir(typeof sensor.aparencia === "string" && sensor.aparencia.length >= 20, "sensor " + sensor.id + ": aparencia curta.");
  garantir(!/"/.test(sensor.aparencia), "sensor " + sensor.id + ": aparencia não pode ter aspas.");
  const svg = art.figuraSensor(sensor);
  garantir(svg.indexOf("<svg") === 0 && svg.slice(-6) === "</svg>", "sensor " + sensor.id + ": figura inválida.");
  garantir(/class="sensor-svg"/.test(svg), "sensor " + sensor.id + ": figura sem a classe sensor-svg.");
  garantir(/role="img"/.test(svg) && svg.indexOf(sensor.aparencia) !== -1, "sensor " + sensor.id + ": figura sem descrição acessível.");
  garantir(!/https?:\/\/(?!www\.w3\.org)/i.test(svg), "sensor " + sensor.id + ": figura com recurso externo.");
  garantir(!/<image|href="/.test(svg), "sensor " + sensor.id + ": figura deve ser vetorial e autocontida.");
  return sensor.visual;
});
iguais(new Set(desenhos).size, 37, "cada sensor deve ter um desenho próprio (visual duplicado).");
garantir(art.figuraSensor(null) === "", "figuraSensor deve ser defensiva sem dados.");
garantir(art.figuraSensor({ id: 1, visual: "inexistente" }) === "", "figuraSensor deve ignorar desenhos desconhecidos.");

/* --------------------------------------------------------------------------
   Fotos dos 37 sensores (recortes do kit de referência)
   -------------------------------------------------------------------------- */
const PASTA_FOTOS = path.join(RAIZ, "assets", "sensores");
garantir(fs.existsSync(PASTA_FOTOS), "assets/sensores deve existir.");
const arquivosFotos = fs.existsSync(PASTA_FOTOS) ? fs.readdirSync(PASTA_FOTOS).filter(function (nome) { return /\.jpg$/i.test(nome); }) : [];
iguais(arquivosFotos.length, 37, "devem existir 37 fotos de sensores em assets/sensores.");
sensores.forEach(function (sensor) {
  const relativo = "assets/sensores/" + sensor.visual + ".jpg";
  garantir(existe(relativo), "sensor " + sensor.id + ": falta a foto " + relativo + ".");
  if (existe(relativo)) {
    const tamanho = fs.statSync(path.join(RAIZ, relativo)).size;
    garantir(tamanho > 1500, "sensor " + sensor.id + ": foto pequena demais (" + tamanho + " bytes).");
  }
});
garantir(existe("assets/kit-37-sensores.jpg"), "falta a foto do kit completo em assets/kit-37-sensores.jpg.");
if (existe("assets/kit-37-sensores.jpg")) {
  garantir(fs.statSync(path.join(RAIZ, "assets/kit-37-sensores.jpg")).size > 50000, "a foto do kit completo está pequena demais.");
}
const appTexto = ler("js/app.js");
garantir(appTexto.indexOf("assets/sensores/") !== -1, "app.js deve montar a foto a partir de assets/sensores/.");
garantir(/sensor-foto/.test(appTexto), "app.js deve renderizar a classe sensor-foto.");
garantir(/sensor-figura--foto/.test(appTexto), "app.js deve marcar a figura quando estiver no modo foto.");
const htmlTexto = ler("index.html");
garantir(htmlTexto.indexOf("assets/kit-37-sensores.jpg") !== -1, "index.html deve exibir a foto do kit completo.");
garantir(/class="kit-foto"/.test(htmlTexto), "index.html deve ter o bloco recolhível com a foto do kit.");
garantir(/data-vista="foto"/.test(appTexto) && /data-vista="desenho"/.test(appTexto), "deve existir o seletor desenho/foto.");
garantir(!/https?:\/\/[^"']*\.(?:jpe?g|png|webp)/i.test(appTexto + htmlTexto), "as fotos devem ser locais, sem imagem externa.");

/* --------------------------------------------------------------------------
   Dados: demos
   -------------------------------------------------------------------------- */
iguais(dados.cartoes.length, 3, "devem existir 3 cartões NFC.");
const resultadosValidos = Object.keys(logic.RESULTADOS);
dados.cartoes.forEach(function (cartao) {
  garantir(/^[0-9A-F]{2}(:[0-9A-F]{2}){3}$/i.test(cartao.uid), "UID inválido: " + cartao.uid);
  garantir(resultadosValidos.indexOf(cartao.resultado) !== -1, "resultado inválido no cartão " + cartao.uid + ".");
});
garantir(dados.cartoes.some(function (cartao) { return cartao.uid === "2C:9D:7E:8E" && cartao.resultado === "liberado"; }), "falta o cartão 2C:9D:7E:8E liberado.");
garantir(dados.cartoes.some(function (cartao) { return cartao.uid === "AB:12:34:56" && cartao.resultado === "negado"; }), "falta o cartão AB:12:34:56 negado.");
garantir(dados.cartoes.some(function (cartao) { return cartao.resultado === "bloqueado"; }), "falta um cartão bloqueado.");

iguais(dados.roleta.length, 6, "a roleta deve ter 6 setores.");
const coresRoleta = dados.roleta.map(function (setor) { return setor.cor; });
["ciano", "verde", "vermelho", "laranja", "roxo", "azul"].forEach(function (cor) {
  garantir(coresRoleta.indexOf(cor) !== -1, "falta o setor " + cor + " na roleta.");
});
dados.roleta.forEach(function (setor) {
  garantir(/^#[0-9a-f]{6}$/i.test(setor.hex), "hex inválido na roleta: " + setor.cor);
  garantir(setor.titulo && setor.significado, "setor incompleto: " + setor.cor);
  garantir(typeof setor.real === "boolean", "setor " + setor.cor + " deve indicar se é estado real.");
});
garantir(dados.roleta.some(function (setor) { return setor.real === false; }), "a roleta deve ter pelo menos uma demonstração de cor.");

iguais(dados.linhaDoTempo.length, 7, "a linha do tempo deve ter 7 etapas.");
const textoLinha = dados.linhaDoTempo.map(function (etapa) { return etapa.titulo + " " + etapa.detalhe; }).join(" ");
garantir(/PN532/i.test(textoLinha), "a linha do tempo deve citar o PN532.");
garantir(/cartoes\.json/i.test(textoLinha), "a linha do tempo deve citar cartoes.json.");
garantir(/Flash/i.test(textoLinha), "a linha do tempo deve citar a Flash.");

iguais(dados.pinos.proibidos.join(","), "IO35,IO36,IO37", "os pinos proibidos devem ser IO35, IO36 e IO37.");
garantir(dados.pinos.seguros.indexOf("IO8") !== -1 && dados.pinos.seguros.indexOf("IO9") !== -1, "IO8/IO9 devem estar entre os pinos seguros.");
iguais(dados.pinos.strapping.join(","), "IO0,IO3,IO45,IO46", "os strapping pins devem ser IO0, IO3, IO45 e IO46.");

iguais(dados.quizGvs.length, 3, "o quiz G-V-S deve ter 3 sensores.");
dados.quizGvs.forEach(function (desafio) {
  iguais(desafio.pinos.length, 3, "quiz G-V-S: cada sensor deve ter 3 pinos.");
  const corretas = desafio.pinos.map(function (pino) { return pino.correta; }).sort().join(",");
  iguais(corretas, "G,S,V", "quiz G-V-S: cada sensor deve cobrir G, V e S.");
});

iguais(dados.sensorQuizIds.length, 12, "o sorteio da caixa deve ter 12 sensores.");
dados.sensorQuizIds.forEach(function (id) {
  garantir(sensores.some(function (sensor) { return sensor.id === id; }), "id de sensor inválido no sorteio: " + id);
});

/* --------------------------------------------------------------------------
   Regras puras
   -------------------------------------------------------------------------- */
iguais(logic.normalizar("Analógico"), "analogico", "normalizar deve remover acentos.");
iguais(logic.normalizarUid(" 2c:9d:7e:8e "), "2C:9D:7E:8E", "normalizarUid deve limpar espaços e caixa.");
iguais(logic.resultadoCartao("2c:9d:7e:8e", dados.cartoes).resultado, "liberado", "resultadoCartao deve achar o UID sem diferenciar caixa.");
iguais(logic.resultadoCartao("00:00:00:00", dados.cartoes), null, "UID desconhecido deve retornar null.");
iguais(logic.statusDoCartao("bloqueado").rotulo, "BLOQUEADO", "statusDoCartao(bloqueado) deve ser BLOQUEADO.");
iguais(logic.statusDoCartao("inexistente").rotulo, "NEGADO", "status desconhecido deve cair em NEGADO.");
iguais(logic.proximoIndice(4, 5, 1), 0, "próximo índice deve voltar ao começo.");
iguais(logic.proximoIndice(0, 5, -1), 4, "índice anterior deve dar a volta.");
iguais(logic.proximoIndice(2, 5, 0), 2, "passo 0 mantém o índice.");
iguais(logic.rotacaoParaSetor(0, 6, 4), 1440, "rotação do setor 0 deve ser 4 voltas.");
iguais(logic.rotacaoParaSetor(1, 6, 4), 1380, "rotação do setor 1 deve descontar 60 graus.");
iguais(logic.anguloSetor(3, 6), 180, "ângulo do setor 3 deve ser 180.");
iguais(logic.formatarTipo("analogico"), "Analógico", "formatarTipo deve usar rótulo com acento.");

const sorteio = logic.sortearSemRepeticao([1, 2, 3, 4, 5, 6, 7, 8], 4, function () { return 0.42; });
iguais(sorteio.length, 4, "sorteio deve respeitar a quantidade pedida.");
iguais(new Set(sorteio).size, 4, "sorteio não deve repetir.");
garantir(sorteio.every(function (item) { return item >= 1 && item <= 8; }), "sorteio deve usar apenas o conjunto.");

const textoMateriais = logic.textoMateriais(prioritarios, extras, dados.estacoes);
const todosMateriais = prioritarios.concat(extras);
garantir(textoMateriais.indexOf("Cartolina branca") !== -1, "textoMateriais deve citar a cartolina.");
const linhasTextoMateriais = textoMateriais.split("\n").filter(function (linha) { return linha.indexOf("[ ] ") === 0; });
garantir(linhasTextoMateriais.length >= 31, "textoMateriais deve listar todos os 31 itens.");
iguais(logic.contarLinhasMateriais(textoMateriais), linhasTextoMateriais.length, "contarLinhasMateriais deve bater com as linhas de item.");
todosMateriais.forEach(function (material) {
  garantir(textoMateriais.indexOf("[ ] " + material.item + " —") !== -1, "textoMateriais omitiu: " + material.item);
});
garantir(textoMateriais.indexOf("MATERIAL DE USO COMUM") !== -1, "textoMateriais deve abrir pelo material de uso comum.");
garantir(textoMateriais.indexOf("Para que serve:") !== -1, "textoMateriais deve dizer para que cada estação serve.");
garantir(textoMateriais.indexOf("Como montar:") !== -1, "textoMateriais deve trazer o manual de montagem.");
["1", "2", "3", "4", "5"].forEach(function (numero) {
  garantir(textoMateriais.indexOf("ESTAÇÃO " + numero + " —") !== -1, "textoMateriais deve ter a estação " + numero + ".");
});
garantir(!/zip|bexiga|bal[aã]o/i.test(textoMateriais), "o guia não deve citar zip nem bexigas.");

/* --------------------------------------------------------------------------
   Materiais: uma caixa por estação, sem menus de bloco/origem
   -------------------------------------------------------------------------- */
const idsMateriaisSala = todosMateriais.filter(function (material) { return material.sala === true; });
garantir(idsMateriaisSala.length >= 8, "o material de uso comum deve ter pelo menos 8 itens.");
const idsEstacoesConhecidas = dados.estacoes.map(function (estacao) { return estacao.id; });
todosMateriais.forEach(function (material) {
  if (material.sala) {
    garantir(!material.estacoes, "material de uso comum não deve apontar para uma estação só: " + material.item);
    return;
  }
  garantir(Array.isArray(material.estacoes) && material.estacoes.length > 0, "material sem estação: " + material.item);
  material.estacoes.forEach(function (id) {
    garantir(idsEstacoesConhecidas.indexOf(id) !== -1, "material " + material.item + " aponta para estação inexistente: " + id);
  });
});
["cerebro", "toque", "semaforo", "caixa", "memoria"].forEach(function (id) {
  const itens = todosMateriais.filter(function (material) {
    return !material.sala && material.estacoes.indexOf(id) !== -1;
  });
  garantir(itens.length >= 4, "a estação " + id + " deve ter pelo menos 4 materiais próprios.");
});
garantir(!dados.materiais.blocos, "os blocos devem sair da interface e dos dados.");
garantir(!dados.materiais.conferir, "a lista paralela de conferência deve sair dos dados.");

/* Cada estação tem um manual completo: resumo, materiais, montagem e visita */
dados.estacoes.forEach(function (estacao) {
  garantir(estacao.resumo && estacao.resumo.length > 40, "estação " + estacao.numero + " sem propósito.");
  garantir(Array.isArray(estacao.montagem) && estacao.montagem.length >= 3, "estação " + estacao.numero + " sem manual de montagem.");
  garantir(Array.isArray(estacao.materiais) && estacao.materiais.length >= 3, "estação " + estacao.numero + " sem lista de materiais.");
  garantir(Array.isArray(estacao.visitante) && estacao.visitante.length >= 2, "estação " + estacao.numero + " sem roteiro do visitante.");
});

/* Tags físicas da Estação 2: três resultados distintos, sem expor UID real */
garantir(Array.isArray(dados.tagsFisicas) && dados.tagsFisicas.length === 3, "tagsFisicas deve ter 3 tags.");
const consequencias = dados.tagsFisicas.map(function (tag) { return tag.consequencia; }).sort().join(",");
iguais(consequencias, "BLOQUEADO,LIBERADO,NEGADO", "as três tags devem cobrir LIBERADO, NEGADO e BLOQUEADO.");

/* --------------------------------------------------------------------------
   HTML: arquivos, IDs, scripts e ausência de dependências externas
   -------------------------------------------------------------------------- */
const html = ler("index.html");
garantir(/<html[^>]+lang="pt-BR"/i.test(html), "index.html deve declarar lang=pt-BR.");
garantir(/<meta[^>]+name="viewport"/i.test(html), "index.html deve ter meta viewport.");
garantir(/<meta[^>]+name="description"/i.test(html), "index.html deve ter meta description.");
garantir(/<title>[^<]+<\/title>/i.test(html), "index.html deve ter title.");
garantir(/data-tema="escuro"/i.test(html), "index.html deve iniciar no tema escuro.");

const idsObrigatorios = [
  "inicio", "visao-geral", "planta", "estacoes", "sensores", "materiais", "passaporte",
  "hero-arte", "planta-arte", "planta-info", "planta-ampliar", "planta-baixar", "planta-imprimir", "planta-dialog",
  "planta-ampliada", "planta-fechar", "deck-abas", "deck-palco", "deck-status", "deck-anterior",
  "deck-proxima", "deck-tela-cheia", "estacoes-resumo", "sensores-app", "materiais-app",
  "passaporte-app", "kit-app", "tema-botao", "menu-botao", "menu-mobile", "toast", "conteudo"
];
idsObrigatorios.forEach(function (id) {
  garantir(new RegExp('id="' + id + '"').test(html), "index.html: falta o id #" + id + ".");
});

const segredosProibidos = ["admin123", "Uai-Fai", "alohomora", "12345678", "WIFI_SSID", "WIFI_SENHA"];
const conteudoDoSite = [
  html,
  ler("js/data.js"),
  ler("js/app.js"),
  ler("README.md")
].join("\n");
segredosProibidos.forEach(function (segredo) {
  garantir(conteudoDoSite.indexOf(segredo) === -1, "credencial/segredo não deve aparecer no site: " + segredo);
});

const idsHtml = [];
html.replace(/\bid="([^"]+)"/g, function (_, id) { idsHtml.push(id); });
const idsDuplicados = idsHtml.filter(function (id, indice) { return idsHtml.indexOf(id) !== indice; });
iguais(new Set(idsDuplicados).size, 0, "index.html tem ids duplicados: " + Array.from(new Set(idsDuplicados)).join(", "));

const referencias = [];
html.replace(/\b(?:src|href)="([^"]+)"/g, function (_, referencia) { referencias.push(referencia); });
referencias.forEach(function (referencia) {
  if (/^https?:/i.test(referencia)) {
    falhar("index.html referencia recurso externo: " + referencia);
    return;
  }
  if (referencia.charAt(0) === "#" || referencia.indexOf("data:") === 0) return;
  const caminho = referencia.split("#")[0].split("?")[0];
  if (!existe(caminho)) falhar("index.html referencia arquivo inexistente: " + caminho);
});

const scripts = [];
html.replace(/<script[^>]+src="([^"]+)"/g, function (_, src) { scripts.push(path.basename(src)); });
iguais(JSON.stringify(scripts), JSON.stringify(["data.js", "logic.js", "art.js", "interactions.js", "app.js"]), "a ordem dos scripts deve ser data, logic, art, interactions, app.");

garantir(!/<[^>]+\son(?:click|load|error|change|input|submit)\s*=/i.test(html), "index.html não deve usar manipuladores inline (onclick etc.).");

/* --------------------------------------------------------------------------
   Sintaxe dos JS e CSS
   -------------------------------------------------------------------------- */
["data.js", "logic.js", "art.js", "interactions.js", "app.js"].forEach(function (arquivo) {
  const relativo = "js/" + arquivo;
  if (!existe(relativo)) { falhar("arquivo ausente: " + relativo); return; }
  try {
    new vm.Script(ler(relativo), { filename: relativo });
  } catch (erro) {
    falhar("erro de sintaxe em " + relativo + ": " + erro.message);
  }
});

["css/styles.css", "css/arte.css", "css/demos.css", "css/print.css"].forEach(function (relativo) {
  if (!existe(relativo)) { falhar("arquivo ausente: " + relativo); return; }
  const css = ler(relativo);
  const abre = (css.match(/\{/g) || []).length;
  const fecha = (css.match(/\}/g) || []).length;
  iguais(abre, fecha, "chaves desbalanceadas em " + relativo);
  garantir(!/@import\s+url\(\s*["']?https?:/i.test(css), relativo + " não pode importar CSS externo.");
  garantir(!/url\(\s*["']?https?:/i.test(css), relativo + " não pode referenciar URL externa.");
});

/* --------------------------------------------------------------------------
   Contraste WCAG dos tokens de tema
   -------------------------------------------------------------------------- */
function luminancia(hex) {
  const limpo = hex.replace("#", "");
  const tamanho = limpo.length === 3 ? 1 : 2;
  const canais = [0, 1, 2].map(function (indice) {
    let valor = parseInt(limpo.substr(indice * tamanho, tamanho), 16);
    if (tamanho === 1) valor = valor * 17;
    valor /= 255;
    return valor <= 0.03928 ? valor / 12.92 : Math.pow((valor + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}
function contraste(corA, corB) {
  const a = luminancia(corA);
  const b = luminancia(corB);
  const claro = Math.max(a, b);
  const escuro = Math.min(a, b);
  return (claro + 0.05) / (escuro + 0.05);
}
function blocoCss(css, seletor) {
  const inicio = css.indexOf(seletor);
  if (inicio === -1) return {};
  const abre = css.indexOf("{", inicio);
  let profundidade = 0;
  let fim = abre;
  for (let i = abre; i < css.length; i += 1) {
    if (css[i] === "{") profundidade += 1;
    else if (css[i] === "}") {
      profundidade -= 1;
      if (profundidade === 0) { fim = i; break; }
    }
  }
  const trecho = css.slice(abre, fim);
  const tokens = {};
  trecho.replace(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g, function (_, nome, valor) {
    tokens[nome] = valor;
  });
  return tokens;
}

const css = ler("css/styles.css");
const tokensEscuros = blocoCss(css, ":root");
const tokensClaros = Object.assign({}, tokensEscuros, blocoCss(css, '[data-tema="claro"]'));

function verificarContraste(tokens, tema) {
  const pares = [
    ["texto", "bg"], ["texto", "surface"], ["muted", "bg"], ["muted", "surface"],
    ["primario", "bg"], ["primario", "surface"],
    ["cyan", "surface"], ["emerald", "surface"], ["amber", "surface"], ["rose", "surface"], ["violet", "surface"]
  ];
  pares.forEach(function (par) {
    const frente = tokens[par[0]];
    const fundo = tokens[par[1]];
    if (!frente || !fundo) { falhar("tema " + tema + ": token ausente para " + par.join("/")); return; }
    const razao = contraste(frente, fundo);
    if (razao < 4.5) {
      falhar("tema " + tema + ": contraste " + par.join("/") + " = " + razao.toFixed(2) + " (mínimo 4,5).");
    }
  });
}
verificarContraste(tokensEscuros, "escuro");
verificarContraste(tokensClaros, "claro");

/* --------------------------------------------------------------------------
   Arquivos de apoio
   -------------------------------------------------------------------------- */
garantir(existe("README.md"), "README.md ausente.");
garantir(existe("assets/favicon.svg"), "assets/favicon.svg ausente.");
garantir(existe("tests/run-e2e.js"), "tests/run-e2e.js ausente.");
garantir(/modo-impressao-materiais/.test(ler("css/print.css")), "print.css deve ter o modo de impressão da lista.");
garantir(/modo-impressao-planta/.test(ler("css/print.css")), "print.css deve ter o modo de impressão da planta.");
garantir(/modo-impressao-certificado/.test(ler("css/print.css")), "print.css deve ter o modo de impressão do certificado.");
garantir(/\.demo\b/.test(css), "styles.css deve definir a base .demo.");
garantir(/\.estacao-slide\[hidden\]/.test(css), "styles.css deve esconder slides inativos.");

/* --------------------------------------------------------------------------
   Resultado
   -------------------------------------------------------------------------- */
const resumo = {
  estacoes: dados.estacoes.length,
  materiaisPrioritarios: prioritarios.length,
  materiaisExtras: extras.length,
  sensores: sensores.length,
  sensoresPorTipo: contagem,
  cartoes: dados.cartoes.length,
  setoresRoleta: dados.roleta.length,
  etapasLinhaDoTempo: dados.linhaDoTempo.length
};

if (erros.length) {
  console.error("✖ " + erros.length + " falha(s):");
  erros.forEach(function (erro) { console.error("  - " + erro); });
  process.exit(1);
}

console.log("✔ Testes estáticos passaram.");
console.log(JSON.stringify(resumo, null, 2));
