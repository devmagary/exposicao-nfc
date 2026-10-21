/* ==========================================================================
   FEIRA DE EXPOSIÇÃO — MUNDO MAKER
   Fonte única de conteúdo. Edite aqui textos, quantidades e dados das demos.
   Fontes: Material Sugestão.docx, Material novo.pdf e guias do ESP32-S3.
   ========================================================================== */
(function (root) {
  "use strict";

  const data = {
    meta: {
      titulo: "Mundo Maker",
      subtitulo: "Feira de Exposição — ESP32-S3, NFC e 37 sensores",
      escola: "Nossa escola",
      data: "Data a definir",
      creditos: "Projeto ProSUB · Thauan",
      aviso:
        "Prévia interativa baseada no Material Sugestão e na lista prioritária do Material novo. As ilustrações são uma referência de montagem, não fotos reais."
    },

    /* ---------------------------------------------------------------------
       KIT AO VIVO — decisão da feira
       Uma única placa ESP32-S3 + PN532 fica na Estação 1; a Estação 5
       espelha o painel web dessa mesma placa em um tablet.
       --------------------------------------------------------------------- */
    kitAoVivo: {
      aoVivo: "toque",
      espelho: "memoria",
      titulo: "Kit ao vivo: uma placa, duas estações",
      resumo:
        "O ESP32-S3 com PN532 fica na Estação 1. A Estação 5 mostra o painel web da mesma placa em um tablet — sem precisar de um segundo kit.",
      aviso:
        "As demos do site são simulações. Na feira, o hardware real fica na Estação 1.",
      passos: [
        "Leve o ESP32-S3 + PN532 para a Estação 1 e conecte o PN532 em I2C: SDA IO8, SCL IO9, 3,3 V e chaves 1 ON / 2 OFF.",
        "Leia o UID real de cada tag e cadastre no painel: uma ativa (LIBERADO), uma bloqueada (BLOQUEADO) e uma desconhecida (NEGADO).",
        "Deixe o LED RGB (GPIO 48) visível e teste as três leituras. O relé/fechadura é opcional.",
        "Na Estação 5, abra o painel do mesmo ESP32 em um tablet na mesma rede (IP ou nfc.local) e mantenha a sessão autenticada.",
        "Faça um ensaio: encoste a tag na Estação 1 e confirme o registro aparecendo na Estação 5."
      ],
      cuidados: [
        "Troque as senhas padrão do painel e do AP antes da feira; não divulgue credenciais no site.",
        "Use somente dados de demonstração; não cadastre alunos reais.",
        "Tags comuns têm UID fixo: atualize as etiquetas dos cartões de papel para os UIDs reais das tags.",
        "No firmware, negado e bloqueado acendem vermelho; o painel usa etiqueta amarela para bloqueado.",
        "Se usar relé/fechadura, use fonte externa de 5 V e supervisão; nada de 110/220 V na mesa."
      ],
      planoB: [
        "Sem tablet ou rede, a Estação 5 continua com o varal de papel e o kit fica só na Estação 1.",
        "Se o Wi-Fi da escola isolar dispositivos, use um roteador portátil ou o modo AP do ESP32.",
        "Se o PN532 falhar, o LED vermelho piscando indica falha de I2C; confira os fios e as chaves antes de abrir a feira."
      ]
    },

    /* ---------------------------------------------------------------------
       AS 5 ESTAÇÕES
       --------------------------------------------------------------------- */
    estacoes: [
      {
        id: "toque",
        numero: 1,
        equipe: "Equipe 1",
        nome: "O Toque Mágico",
        tema: "NFC: leitura sem encostar",
        cor: "emerald",
        icone: "nfc",
        aoVivo: true,
        frase: "Encostou, decidiu.",
        resumo:
          "Abrir a visita encostando uma tag de verdade. O leitor PN532 e os cartões: esta é a estação com o kit físico. Encostar uma tag acende o LED e mostra o acesso — mesmo sem internet.",
        visitante: [
          "Escolhe um cartão de papel com o UID real e encosta no leitor PN532 gigante (com velcro).",
          "Puxa uma das três respostas do envelope: LIBERADO, NEGADO ou BLOQUEADO.",
          "Encosta uma tag de verdade no leitor e vê o LED acender na hora; o painel da Estação 5 registra o mesmo acesso."
        ],
        montagem: [
          "Monte um leitor PN532 gigante de papelão com o desenho da placa vermelha.",
          "Recorte cartões de papel cartão e escreva o UID real de cada tag.",
          "Cole um envelope atrás do leitor com as três respostas.",
          "Faça um cartaz com o desenho do campo magnético: é ele que “acorda” a tag.",
          "Esta é a estação que recebe o ESP32 + PN532 reais; as demais usam as simulações de papel."
        ],
        materiais: [
          "Papelão",
          "Papel alumínio",
          "Etiquetas adesivas brancas",
          "Barbante / lã em 4 cores",
          "Papel cartão colorido",
          "EVA colorido",
          "Velcro"
        ],
        demo: "nfc",
        dica:
          "No PN532 em I2C: chave 1 ON, chave 2 OFF; SDA no IO8 e SCL no IO9. Tags comuns têm UID fixo: cadastre o UID real no painel e atualize a etiqueta do cartão."
      },
      {
        id: "cerebro",
        numero: 2,
        equipe: "Equipe 2",
        nome: "O Cérebro",
        tema: "ESP32-S3 + placa de expansão",
        cor: "cyan",
        icone: "chip",
        frase: "Onde tudo começa.",
        resumo:
          "O cérebro da exposição: o ESP32-S3 e a placa de expansão que organiza todos os sinais em três linhas coloridas.",
        visitante: [
          "Observa o cartaz com o ESP32-S3 no centro e a placa de expansão ao redor.",
          "Recebe um “sensor de papel” e descobre em qual linha ele encaixa: G (GND), V (3,3 V) ou S (sinal).",
          "Encontra a área hachurada de vermelho com os pinos 35, 36 e 37 marcados como proibidos (PSRAM)."
        ],
        montagem: [
          "Desenhe o ESP32-S3 no centro de uma cartolina e a placa de expansão ao redor.",
          "Use fita preta, vermelha e amarela para reproduzir as linhas G-V-S.",
          "Cole a resposta certa atrás de cada “sensor de papel” com velcro.",
          "Marque os pinos 35, 36 e 37 com hachura vermelha e deixe post-its para os visitantes alertarem."
        ],
        materiais: [
          "Papel cartão preto",
          "Papel cartão vermelho",
          "Papel cartão amarelo",
          "EVA colorido",
          "Fita adesiva colorida",
          "Post-its coloridos",
          "Palitos de churrasco",
          "Papel cartão colorido",
          "Velcro"
        ],
        demo: "gvs",
        dica:
          "No ESP32-S3 N16R8, os pinos IO35, IO36 e IO37 são ligados à PSRAM. Nunca ligue nada neles."
      },
      {
        id: "semaforo",
        numero: 3,
        equipe: "Equipe 3",
        nome: "O Semáforo Falante",
        tema: "LED RGB e seus estados",
        cor: "amber",
        icone: "led",
        frase: "Uma cor para cada resposta.",
        resumo:
          "O LED RGB conta o estado do acesso em cores. A roleta sorteia um estado e o visitante descobre o que ele significa.",
        visitante: [
          "Gira a roleta de papelão com seis setores coloridos.",
          "Descobre o que a cor sorteada significa no sistema.",
          "Aponta a lanterna do celular com celofane atrás do furo e acende o “LED de papel”."
        ],
        montagem: [
          "Recorte uma roleta com seis setores: ciano, verde, vermelho, laranja, roxo e azul.",
          "Faça um cartaz para cada estado, com a explicação da cor.",
          "Abra um furo na cartolina e cubra com celofane; ilumine por trás para o LED acender.",
          "Combine azul + verde para obter ciano e vermelho + amarelo para obter laranja."
        ],
        materiais: [
          "Kit de guache",
          "Pincéis escolares",
          "Papel celofane",
          "Lanterna"
        ],
        demo: "roleta",
        dica:
          "Estados reais do firmware: ciano = standby, verde = liberado, vermelho = negado, amarelo = modo AP, azul = boot e vermelho piscando = falha do PN532."
      },
      {
        id: "caixa",
        numero: 4,
        equipe: "Equipe 4",
        nome: "A Caixa dos Sentidos",
        tema: "Os 37 sensores do kit",
        cor: "rose",
        icone: "box",
        frase: "Mete a mão e descobre.",
        resumo:
          "Seis furos e 37 sensores: o visitante tira um sensor de papel, lê a etiqueta e descobre se ele é digital, analógico ou especial.",
        visitante: [
          "Mete a mão na caixa e tira um “sensor de papel”.",
          "Lê a etiqueta e tenta adivinhar: digital, analógico ou especial?",
          "Cola o sensor na coluna certa do painel — no fim, a equipe confere."
        ],
        montagem: [
          "Faça seis furos redondos em uma caixa de papelão.",
          "Recorte os sensores de papel com desenho e etiqueta; deixe-os soltos dentro da caixa.",
          "Crie um painel com três colunas: Digitais, Analógicos e Especiais.",
          "Use velcro para colar e descolar os sensores."
        ],
        materiais: [
          "Papelão",
          "Etiquetas adesivas brancas",
          "Papel cartão colorido",
          "Estilete (uso do professor)"
        ],
        demo: "caixa",
        dica:
          "As três colunas do guia são: Digitais (botão, reed, tilt...), Analógicos (LDR, joystick, hall linear...) e Especiais (DS18B20, DHT11, IR 38 kHz, NFC)."
      },
      {
        id: "memoria",
        numero: 5,
        equipe: "Equipe 5",
        nome: "A Memória que Não Esquece",
        tema: "Flash, LittleFS e Painel Web",
        cor: "violet",
        icone: "database",
        espelho: true,
        frase: "Offline também funciona.",
        resumo:
          "A memória que não esquece: o painel web do ESP32 da Estação 1 aparece espelhado aqui, em um tablet — e continua funcionando sem internet. No fim, a estação fecha a visita falando de LGPD: a memória que também sabe esquecer.",
        visitante: [
          "Vê o Painel Web do ESP32 da Estação 1 ao vivo em um notebook ou tablet.",
          "Segue o varal da linha do tempo: do cartão encostado até o registro no painel.",
          "Escreve em um post-it “o que acontece se a internet cair?” e cola na seção “Offline ainda funciona!”.",
          "Fecha a visita com uma conversa rápida sobre a LGPD: os dados do aluno são excluídos de todos os bancos quando ele conclui toda a jornada escolar."
        ],
        montagem: [
          "Deixe um notebook ou tablet rodando o Painel Web do ESP32 que está na Estação 1.",
          "Estique um barbante e prenda com pregadores os cartões da linha do tempo.",
          "Pendure um TNT ou tecido atrás da mesa para destacar a tela.",
          "Reserve um espaço no cartaz para os post-its sobre o modo offline.",
          "Imprima o cartaz da LGPD com a frase do direito à exclusão e deixe à vista no fim da mesa."
        ],
        materiais: [
          "TNT ou tecido",
          "Barbante de algodão",
          "Pregadores de madeira",
          "Post-its coloridos"
        ],
        demo: "timeline",
        lgpd: {
          titulo: "Quando a memória precisa esquecer",
          resumo:
            "A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) garante que dados pessoais não ficam guardados para sempre: eles existem enquanto houver uma finalidade.",
          pontos: [
            "O painel registra só o necessário para o acesso: matrícula, nome e horário.",
            "Quando o aluno conclui toda a jornada escolar, os dados dele são excluídos de todos os bancos de dados.",
            "Os dados do Passaporte da feira ficam apenas no seu navegador; nada é enviado para a escola."
          ]
        },
        dica:
          "Use o mesmo ESP32 da Estação 1: tablet e placa na mesma rede local (IP ou nfc.local). O painel atualiza em ~1,2 s e continua local quando a internet cai."
      }
    ],

    /* ---------------------------------------------------------------------
       MATERIAIS — PRIORITÁRIOS (Material novo) E COMPLEMENTARES (Sugestão)
       `sala: true` marca o material que serve às cinco estações (paredes,
       cartazes, ferramentas). O resto é consumido por estação.
       --------------------------------------------------------------------- */
    materiais: {
      prioritarios: [
        { id: "p01", item: "Cartolina branca", qtd: "5 a 6 folhas", uso: "Fundo dos cartazes das 5 estações.", grupo: "papel", sala: true },
        { id: "p02", item: "Papel cartão preto", qtd: "2 folhas", uso: "Linha GND e contraste dos painéis.", grupo: "papel", estacoes: ["cerebro"] },
        { id: "p03", item: "Papel cartão vermelho", qtd: "2 folhas", uso: "Linha VCC (3,3 V / 5 V).", grupo: "papel", estacoes: ["cerebro"] },
        { id: "p04", item: "Papel cartão amarelo", qtd: "3 folhas", uso: "Linha S (sinal) e fileira de GPIOs.", grupo: "papel", estacoes: ["cerebro"] },
        { id: "p05", item: "Papel metro marrom (kraft)", qtd: "4 metros", uso: "Forrar a parede/quadro como cenário único.", grupo: "papel", sala: true },
        { id: "p06", item: "EVA colorido (vermelho, preto e amarelo)", qtd: "3 folhas", uso: "Mapa de pinos em relevo na mesa 2 e camada de acabamento dos cartões NFC na mesa 1.", grupo: "papel", estacoes: ["cerebro", "toque"] },
        { id: "p07", item: "Canetinhas hidrográficas (12 cores)", qtd: "1 estojo", uso: "Diagramas, UIDs, setas e detalhes.", grupo: "escrita", sala: true },
        { id: "p08", item: "Pincel marcador permanente preto (grosso)", qtd: "2 unidades", uso: "Títulos grandes dos cartazes.", grupo: "escrita", sala: true },
        { id: "p09", item: "Lápis de cor / giz de cera", qtd: "1 caixa", uso: "Sombreamento e detalhes dos desenhos.", grupo: "escrita", sala: true },
        { id: "p10", item: "Etiquetas adesivas brancas", qtd: "1 cartela", uso: "Nome e função dos sensores de papel.", grupo: "escrita", estacoes: ["toque", "caixa"] },
        { id: "p11", item: "Post-its coloridos", qtd: "3 blocos", uso: "Quiz dos pinos proibidos e “e se a internet cair?”.", grupo: "escrita", estacoes: ["cerebro", "memoria"] },
        { id: "p12", item: "Fita crepe", qtd: "2 rolos", uso: "Prender cartazes sem estragar a parede.", grupo: "montagem", sala: true },
        { id: "p13", item: "Papel celofane colorido (verde, vermelho, azul)", qtd: "1 unidade de cada", uso: "Lanterna + celofane para acender o “LED de papel”.", grupo: "simulacao", estacoes: ["semaforo"] },
        { id: "p14", item: "Kit de guache", qtd: "1 kit", uso: "Pintura dos painéis e da roleta de seis setores.", grupo: "simulacao", estacoes: ["semaforo"] },
        { id: "p15", item: "Pincéis para guache escolar", qtd: "3 pincéis", uso: "Pintura dos cartazes e das cores da roleta.", grupo: "simulacao", estacoes: ["semaforo"] },
        { id: "p16", item: "Fita dupla face", qtd: "2 rolos", uso: "Colar EVA, papelão e elementos 3D.", grupo: "montagem", sala: true },
        { id: "p17", item: "Cola branca / cola quente", qtd: "1 de cada", uso: "Montagem geral da exposição.", grupo: "montagem", sala: true },
        { id: "p18", item: "Tesouras sem ponta", qtd: "5 unidades", uso: "Uma por equipe, com segurança.", grupo: "montagem", sala: true },
        { id: "p19", item: "Estilete (uso do professor)", qtd: "1 unidade", uso: "Furos da caixa e recortes precisos.", grupo: "montagem", estacoes: ["caixa"] },
        { id: "p20", item: "Barbante de algodão (grosso)", qtd: "1 rolo", uso: "Varal da linha do tempo e cartões pendurados.", grupo: "montagem", estacoes: ["memoria"] }
      ],
      extras: [
        { id: "e01", item: "Papelão (caixas de supermercado)", qtd: "5 caixas médias", uso: "Suportes em “L” dos cartazes, leitor gigante da mesa 1 e a caixa furada da mesa 4.", grupo: "estrutura", estacoes: ["toque", "caixa"], aviso: "A mecânica das Estações 1 e 4 usa papelão." },
        { id: "e02", item: "Fita adesiva colorida (preta, vermelha e amarela)", qtd: "1 rolo de cada", uso: "Reproduzir o padrão G-V-S na parede ou no quadro.", grupo: "simulacao", estacoes: ["cerebro"] },
        { id: "e03", item: "Barbante / lã em 4 cores", qtd: "1 novelo de cada", uso: "Representar os fios jumper (SDA, SCL, VCC, GND).", grupo: "simulacao", estacoes: ["toque"] },
        { id: "e04", item: "Palitos de churrasco", qtd: "1 pacote", uso: "Fazer “pinos” de papel para o mapa de EVA.", grupo: "simulacao", estacoes: ["cerebro"] },
        { id: "e05", item: "Papel cartão colorido (colorset)", qtd: "1 bloco", uso: "Recortar os cartões NFC com os UIDs reais e os sensores em miniatura.", grupo: "papel", estacoes: ["cerebro", "toque", "caixa"] },
        { id: "e06", item: "Velcro adesivo", qtd: "1 metro", uso: "Colar e descolar cartões e sensores nos painéis.", grupo: "montagem", estacoes: ["cerebro", "toque"], aviso: "A mecânica das Estações 1 e 2 usa velcro." },
        { id: "e07", item: "Ímãs pequenos de geladeira", qtd: "10 unidades", uso: "Prender cartões e simular chave magnética (Hall/Reed).", grupo: "simulacao", sala: true },
        { id: "e09", item: "Papel alumínio", qtd: "1 rolo", uso: "Simular blindagem/antena do leitor NFC.", grupo: "simulacao", estacoes: ["toque"] },
        { id: "e11", item: "Lanterna pequena de LED (ou flash do celular)", qtd: "3 unidades", uso: "Iluminar o “LED de papel” por trás da cartolina.", grupo: "simulacao", estacoes: ["semaforo"] },
        { id: "e12", item: "Pregadores de roupa de madeira", qtd: "20 unidades", uso: "Prender os cartões no varal da linha do tempo.", grupo: "montagem", estacoes: ["memoria"], aviso: "A mecânica da Estação 5 usa pregadores." },
        { id: "e13", item: "Saco de TNT ou tecido", qtd: "1 metro", uso: "Cortina de fundo para destacar o notebook do Painel Web.", grupo: "estrutura", estacoes: ["memoria"] }
      ]
    },

    /* ---------------------------------------------------------------------
       DADOS DAS DEMOS
       --------------------------------------------------------------------- */
    /* Cards de exemplo das simulações. Na Estação 1 real, o que vale é a tag
       física: o UID dela decide o resultado (ver `tagsFisicas`). */
    cartoes: [
      {
        uid: "2C:9D:7E:8E",
        nome: "Lucas Silva",
        situacao: "Aluno ativo",
        resultado: "liberado",
        nota: "Cadastrado e ativo: o ESP32 aciona o relé e libera a entrada."
      },
      {
        uid: "AB:12:34:56",
        nome: "Cartão não cadastrado",
        situacao: "UID fora da lista",
        resultado: "negado",
        nota: "Nenhum aluno corresponde a este UID: o acesso é negado."
      },
      {
        uid: "7F:4A:20:C1",
        nome: "Aluno com matrícula suspensa",
        situacao: "Bloqueado pela direção",
        resultado: "bloqueado",
        nota: "Existe no sistema, mas está bloqueado: a fechadura não abre."
      }
    ],

    /* ---------------------------------------------------------------------
       AS TRÊS TAGS FÍSICAS DA ESTAÇÃO 1
       Os UIDs abaixo são só exemplo: tags comuns têm UID fixo, então o ideal
       é usar os UIDs reais das tags do kit nesta lista e manter os cartões
       de papel como apoio visual.
       --------------------------------------------------------------------- */
    tagsFisicas: [
      { ordem: 1, consequencia: "LIBERADO", cor: "verde", rotulo: "Lucas Silva — aluno ativo", acao: "LED verde por 2 s e o Painel Web registra o acesso." },
      { ordem: 2, consequencia: "NEGADO", cor: "vermelho", rotulo: "tag sem cadastro", acao: "LED vermelho por 2 s e o acesso é negado." },
      { ordem: 3, consequencia: "BLOQUEADO", cor: "amarelo", rotulo: "matrícula suspensa", acao: "Negado com aviso de bloqueio no Painel Web." }
    ],

    roleta: [
      {
        cor: "ciano",
        hex: "#22d3ee",
        titulo: "Tudo pronto",
        significado: "Wi-Fi conectado e leitor PN532 online. Pode aproximar o cartão.",
        real: true
      },
      {
        cor: "verde",
        hex: "#34d399",
        titulo: "Acesso liberado",
        significado: "Aluno ativo: o ESP32 aciona o relé e libera a entrada.",
        real: true
      },
      {
        cor: "vermelho",
        hex: "#f87171",
        titulo: "Acesso negado",
        significado: "Cartão não cadastrado ou aluno bloqueado: a fechadura não abre.",
        real: true
      },
      {
        cor: "laranja",
        hex: "#fb923c",
        titulo: "Leitor desconectado",
        significado: "O PN532 não respondeu no I2C (pinos 8/9). No firmware real, isso aparece como vermelho piscando.",
        real: false
      },
      {
        cor: "roxo",
        hex: "#a78bfa",
        titulo: "Mistura RGB",
        significado: "Vermelho + azul acesos juntos. É demonstração de cor, não um estado do firmware.",
        real: false
      },
      {
        cor: "azul",
        hex: "#60a5fa",
        titulo: "Inicializando",
        significado: "O ESP32 está conectando ao Wi-Fi e montando a Flash durante o boot.",
        real: true
      }
    ],

    linhaDoTempo: [
      { icone: "card", titulo: "Cartão encostado", detalhe: "O visitante aproxima o cartão (ou a tag) do leitor." },
      { icone: "nfc", titulo: "PN532 lê o UID", detalhe: "O campo de 13,56 MHz acorda o cartão; o UID chega por I2C (SDA IO8, SCL IO9)." },
      { icone: "flash", titulo: "ESP32 consulta a Flash", detalhe: "O UID é procurado em cartoes.json no LittleFS. Sem internet, é aqui que a decisão acontece." },
      { icone: "check", titulo: "Decisão", detalhe: "Ativo? Libera. Não cadastrado ou bloqueado? Nega." },
      { icone: "led", titulo: "LED e relé", detalhe: "Verde acende e o relé abre a fechadura; vermelho acende e nada acontece." },
      { icone: "log", titulo: "Log e Painel Web", detalhe: "O acesso é gravado e aparece no painel. Offline, o log fica na Flash." },
      { icone: "cloud", titulo: "Sincronização", detalhe: "Quando a internet volta, o ESP32 sincroniza com a nuvem e atualiza a lista." }
    ],

    pinos: {
      seguros: ["IO1", "IO2", "IO4", "IO5", "IO6", "IO7", "IO8", "IO9", "IO10", "IO11", "IO12", "IO13", "IO14", "IO17", "IO18", "IO21", "IO38", "IO39", "IO40", "IO41", "IO42", "IO47"],
      proibidos: ["IO35", "IO36", "IO37"],
      strapping: ["IO0", "IO3", "IO45", "IO46"],
      especiais: [
        { pino: "IO8", uso: "SDA do I2C (PN532)" },
        { pino: "IO9", uso: "SCL do I2C (PN532)" },
        { pino: "IO48", uso: "LED RGB WS2812B da placa" },
        { pino: "IO43", uso: "TX da serial" },
        { pino: "IO44", uso: "RX da serial" }
      ]
    },

    quizGvs: [
      {
        sensor: "Sensor de luz (LDR)",
        tipo: "Analógico",
        dica: "A leitura é analógica: analogRead no pino de sinal.",
        pinos: [
          { rotulo: "−", correta: "G" },
          { rotulo: "+", correta: "V" },
          { rotulo: "S", correta: "S", gpio: "IO1" }
        ]
      },
      {
        sensor: "Botão tátil",
        tipo: "Digital",
        dica: "A leitura é digital: digitalRead no pino de sinal.",
        pinos: [
          { rotulo: "−", correta: "G" },
          { rotulo: "+", correta: "V" },
          { rotulo: "S", correta: "S", gpio: "IO6" }
        ]
      },
      {
        sensor: "Módulo de relé 5 V",
        tipo: "Saída digital",
        dica: "A bobina do relé pede 5 V; o sinal de controle continua em 3,3 V.",
        pinos: [
          { rotulo: "−", correta: "G" },
          { rotulo: "+", correta: "V" },
          { rotulo: "S", correta: "S", gpio: "IO4" }
        ]
      }
    ],

    sensorQuizIds: [10, 20, 13, 30, 23, 18, 27, 28, 31, 29, 22, 34],

    statusLed: [
      { cor: "ciano", titulo: "Standby normal", detalhe: "Efeito respiração: Wi-Fi conectado e PN532 online." },
      { cor: "verde", titulo: "Acesso liberado", detalhe: "Aceso por 2 segundos: aluno cadastrado e ativo." },
      { cor: "vermelho", titulo: "Acesso negado", detalhe: "Aceso por 2 segundos: cartão desconhecido ou aluno bloqueado." },
      { cor: "vermelho-piscando", titulo: "Falha do PN532", detalhe: "Pisca rápido: módulo solto, desconectado ou sem resposta no I2C." },
      { cor: "amarelo", titulo: "Modo ponto de acesso", detalhe: "Pulsa devagar: Wi-Fi não encontrado; rede ControleAcesso-S3 ativa." },
      { cor: "azul", titulo: "Inicializando", detalhe: "Aceso no boot: conectando ao Wi-Fi e montando o sistema de arquivos." }
    ],

    /* ---------------------------------------------------------------------
       OS 37 SENSORES — transcritos do GUIA_37_SENSORES_ESP32.md
       tipo: digital | analogico | especial
       --------------------------------------------------------------------- */
    sensores: [
      // Som, áudio e luzes
      { id: 1, nome: "Buzzer Passivo", categoria: "Som, áudio e luzes", tipo: "especial", visual: "buzzer-passivo", aparencia: "Cilindro preto sobre placa azul, com anel interno e furo no centro.", descricao: "Pastilha piezoelétrica que só vibra com pulsos alternados; com energia contínua faz apenas um clique.", ideia: "Tocar melodias 8-bit e bips de confirmação.", usos: ["Tocar melodias 8-bit em jogos e brinquedos.","Emitir bips de confirmação em teclados e painéis.","Fazer sirenes de dois tons em alarmes programados."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO4" } ] },
      { id: 2, nome: "Buzzer Ativo", categoria: "Som, áudio e luzes", tipo: "digital", visual: "buzzer-ativo", aparencia: "Cilindro preto igual ao passivo, com um sinal de mais na tampa.", descricao: "Tem oscilador interno e emite um único tom contínuo quando recebe energia.", ideia: "Sirene simples e aviso de porta aberta.", usos: ["Avisar porta aberta ou janela violada.","Soar sirene de emergência em maquetes.","Confirmar o fim de um processo em máquinas simples."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "S", linha: "S", gpio: "IO4" } ] },
      { id: 3, nome: "Emissor Laser", categoria: "Som, áudio e luzes", tipo: "digital", visual: "laser", aparencia: "Cilindro de metal com lente vermelha e um feixe de luz saindo pelo topo.", descricao: "Diodo laser de 650 nm que emite um ponto vermelho concentrado.", ideia: "Barreira de segurança combinada com LDR.", usos: ["Montar barreira de segurança com LDR.","Contar peças que passam na frente do feixe.","Acender a luz quando alguém cruza a porta."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "S", linha: "S", gpio: "IO5" } ] },
      { id: 4, nome: "LED Infravermelho", categoria: "Som, áudio e luzes", tipo: "digital", visual: "led-ir", aparencia: "LED transparente com um cristal interno e ondas roxas tracejadas.", descricao: "LED IR de 940 nm, invisível a olho nu, igual ao do controle remoto.", ideia: "Controle remoto universal via Wi-Fi.", usos: ["Emitir comandos para TVs e aparelhos via controle remoto.","Iluminar câmeras de visão noturna.","Fazer barreira invisível com receptor IR."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "S", linha: "S", gpio: "IO6" } ] },
      { id: 5, nome: "LED RGB 5 mm", categoria: "Som, áudio e luzes", tipo: "especial", visual: "led-rgb", aparencia: "LED transparente com três cristais coloridos e raios vermelho, verde e azul.", descricao: "Três LEDs (R, G, B) no mesmo encapsulamento; misturando as intensidades surgem todas as cores.", ideia: "Semáforo de status e luz de notificação.", usos: ["Indicar estados com cores: verde livre, vermelho ocupado.","Misturar cores em aulas de lógica PWM.","Criar luz de notificação para mensagens."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "R", linha: "S", gpio: "IO1" }, { rotulo: "G", linha: "S", gpio: "IO2" }, { rotulo: "B", linha: "S", gpio: "IO4" } ] },
      { id: 6, nome: "LED RGB SMD", categoria: "Som, áudio e luzes", tipo: "especial", visual: "led-rgb-smd", aparencia: "Pastilha quadrada preta com quatro terminais dourados e três cores no centro.", descricao: "Versão plana (SMD 5050) do LED RGB, mais brilhante e com difusão angular maior.", ideia: "Luz piloto de painéis compactos.", usos: ["Iluminar painéis compactos com pouca altura.","Indicar status em placas pequenas.","Criar efeitos de cor em maquetes."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "R", linha: "S", gpio: "IO1" }, { rotulo: "G", linha: "S", gpio: "IO2" }, { rotulo: "B", linha: "S", gpio: "IO4" } ] },
      { id: 7, nome: "LED Duas Cores", categoria: "Som, áudio e luzes", tipo: "digital", visual: "led-duas-cores", aparencia: "LED transparente partido ao meio em vermelho e verde.", descricao: "LED de 3 pernas com vermelho e verde; os dois juntos produzem amarelo.", ideia: "Indicador de porta livre/ocupada.", usos: ["Mostrar porta livre ou ocupada em banheiros.","Sinalizar ligado ou desligado em painéis.","Simular semáforo de dois estados."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "R", linha: "S", gpio: "IO1" }, { rotulo: "G", linha: "S", gpio: "IO2" } ] },
      { id: 8, nome: "LED Bicolor 3 mm", categoria: "Som, áudio e luzes", tipo: "digital", visual: "led-bicolor", aparencia: "LED transparente menor, também com metade vermelha e metade verde.", descricao: "Versão menor do LED bicolor, com resistores integrados na plaquinha.", ideia: "Luzes discretas em caixas de comando.", usos: ["Indicar presença em caixas de comando.","Mostrar nível de bateria com duas cores.","Sinalizar erros discretos em equipamentos."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "R", linha: "S", gpio: "IO1" }, { rotulo: "G", linha: "S", gpio: "IO2" } ] },
      { id: 9, nome: "LED Pisca 7 Cores", categoria: "Som, áudio e luzes", tipo: "digital", visual: "led-pisca", aparencia: "LED transparente com arcos coloridos, indicando troca automática de cor.", descricao: "Microchip interno alterna 7 cores sozinho; só precisa de energia.", ideia: "Efeito festivo sem gastar código.", usos: ["Decorar maquetes com efeito festivo.","Chamar atenção para um brinde ou prêmio.","Criar luz de sinalização sem programar."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "S", linha: "S", gpio: "IO5" } ] },

      // Toque, movimento e chaves
      { id: 10, nome: "Módulo de Chave (Botão)", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "botao", aparencia: "Botão quadrado preto com capa redonda e quatro pernas de solda.", descricao: "Chave tátil com resistor pull-up/pull-down embutido.", ideia: "Campainha, botoeira e contadores.", usos: ["Acionar campainha ou botoeira.","Contar toques em um contador digital.","Iniciar e parar uma demo no ESP32."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO6" } ] },
      { id: 11, nome: "Sensor de Batida (Knock)", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "knock", aparencia: "Disco branco de cerâmica com anéis concêntricos e marcas de impacto.", descricao: "Peso flexível que toca o contato ao receber batidas.", ideia: "Detector de batidas na porta.", usos: ["Detectar batidas na porta como senha.","Transformar batidas em comandos musicais.","Acordar o sistema com um toque na mesa."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO7" } ] },
      { id: 12, nome: "Sensor de Vibração", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "vibracao", aparencia: "Mola metálica em zigue-zague entre dois apoios.", descricao: "Mola interna que fecha o circuito com vibração.", ideia: "Alarme de moto/bicicleta e medidor de vibração.", usos: ["Proteger moto ou bicicleta com alarme.","Avisar quando uma máquina começa a vibrar.","Contar impactos em embalagens de transporte."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO7" } ] },
      { id: 13, nome: "Sensor TILT (Esfera)", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "tilt-esfera", aparencia: "Tubo de vidro com uma esfera de aço que rola de um lado ao outro.", descricao: "Esfera de aço que fecha ou abre o contato conforme a inclinação.", ideia: "Alarme de tombamento e tampa de caixa.", usos: ["Detectar tampa de caixa aberta.","Alertar tombamento de equipamento.","Acender luz ao inclinar um brinquedo."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO10" } ] },
      { id: 14, nome: "Sensor TILT (Mercúrio)", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "tilt-mercurio", aparencia: "Tubo de vidro com uma gota vermelha de mercúrio e dois eletrodos.", descricao: "Gota de mercúrio que conduz suavemente conforme a inclinação.", ideia: "Portão basculante e nível de caçamba.", usos: ["Monitorar portão basculante.","Medir a inclinação de caçamba ou rampa.","Desligar aparelho quando é deitado."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO10" } ] },
      { id: 15, nome: "Magic Light Cup", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "magic-cup", aparencia: "Trilho inclinado com esfera de aço e uma taça iluminada ao lado.", descricao: "Sensor de inclinação e LED na mesma placa.", ideia: "Brinquedo de transferir luz entre dois copos.", usos: ["Brinquedo de transferir luz entre copos.","Demonstrar inclinação e LED no mesmo módulo.","Criar jogo de equilíbrio com duas bases."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO11" }, { rotulo: "LED", linha: "S", gpio: "IO12" } ] },
      { id: 16, nome: "Chave Óptica (Fenda)", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "chave-optica", aparencia: "Bloco preto em U com uma fenda no meio e um feixe atravessando.", descricao: "LED IR e fototransistor frente a frente; um objeto na fenda interrompe o feixe.", ideia: "Fim de curso de impressora 3D e contador de moedas.", usos: ["Fim de curso em impressoras 3D.","Contar moedas que passam pela fenda.","Detectar tampa fechada em caixas."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO11" } ] },
      { id: 17, nome: "Encoder Rotativo", categoria: "Toque, movimento e chaves", tipo: "especial", visual: "encoder", aparencia: "Botão giratório grande com ranhuras e um botão de clique ao lado.", descricao: "Knob infinito com dois canais em quadratura e clique ao pressionar.", ideia: "Navegar em menus de OLED e controlar volume.", usos: ["Navegar em menus de display OLED.","Controlar volume ou brilho girando o knob.","Ajustar setpoint de temperatura com clique."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "CLK", linha: "S", gpio: "IO12" }, { rotulo: "DT", linha: "S", gpio: "IO13" }, { rotulo: "SW", linha: "S", gpio: "IO14" } ] },
      { id: 18, nome: "Joystick XY com Botão", categoria: "Toque, movimento e chaves", tipo: "analogico", visual: "joystick", aparencia: "Base preta com alavanca e dois potenciômetros nos cantos.", descricao: "Dois potenciômetros (X/Y) e um botão de clique.", ideia: "Controle de câmera Pan-Tilt e robôs com rodas.", usos: ["Controlar câmera Pan-Tilt.","Dirigir robô de rodas em duas direções.","Navegar por jogos simples no display."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "VRx", linha: "S", gpio: "IO1" }, { rotulo: "VRy", linha: "S", gpio: "IO2" }, { rotulo: "SW", linha: "S", gpio: "IO4" } ] },
      { id: 19, nome: "Sensor de Toque Metálico", categoria: "Toque, movimento e chaves", tipo: "digital", visual: "toque-metal", aparencia: "Placa metálica quadrada com arcos de toque em volta.", descricao: "Comuta ao encostar o dedo no terminal metálico, sem partes móveis.", ideia: "Interruptor invisível e botão sem desgaste.", usos: ["Criar interruptor invisível em maquete.","Acionar luz ao encostar na maçaneta.","Fazer botão sem desgaste mecânico."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO7" } ] },

      // Sensores magnéticos
      { id: 20, nome: "Mini Reed Magnético", categoria: "Sensores magnéticos", tipo: "digital", visual: "reed-mini", aparencia: "Ampola de vidro curta com duas lâminas e um ímã ao lado.", descricao: "Lâminas ferromagnéticas que se tocam com a aproximação de um ímã.", ideia: "Alarme de porta e janela.", usos: ["Alarme de porta e janela.","Detectar ímã de abertura em gaveta.","Contar voltas com ímã no eixo."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO6" } ] },
      { id: 21, nome: "Ampola Reed Grande", categoria: "Sensores magnéticos", tipo: "digital", visual: "reed-grande", aparencia: "Ampola de vidro comprida com lâminas e um ímã bicolor acima.", descricao: "Versão maior e mais sensível da ampola reed.", ideia: "Hidrômetro e velocímetro de bicicleta.", usos: ["Medir vazão em hidrômetro.","Velocímetro de bicicleta com ímã na roda.","Detectar portão aberto à distância."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO6" } ] },
      { id: 22, nome: "Sensor Hall Digital", categoria: "Sensores magnéticos", tipo: "digital", visual: "hall-digital", aparencia: "Cápsula preta de três pernas com a letra H e uma onda quadrada.", descricao: "Sensor de efeito Hall de estado sólido, sem partes móveis, que comuta na presença do polo sul.", ideia: "RPM de motores e contadores rápidos.", usos: ["Medir RPM de motores.","Contar peças metálicas em esteira.","Detectar fim de curso sem contato."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO7" } ] },
      { id: 23, nome: "Sensor Hall Linear", categoria: "Sensores magnéticos", tipo: "analogico", visual: "hall-linear", aparencia: "Cápsula preta de três pernas com a letra H e uma rampa analógica.", descricao: "Entrega tensão proporcional à força e à distância do ímã.", ideia: "Medir corrente sem cortar fio e distância magnética.", usos: ["Medir distância até um ímã.","Ler corrente elétrica sem cortar o fio.","Detectar a posição de uma alavanca."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO1" } ] },
      { id: 24, nome: "Hall Linear com Trimpot", categoria: "Sensores magnéticos", tipo: "analogico", visual: "hall-trimpot", aparencia: "Chip preto de oito pernas ao lado de um trimpot azul com parafuso.", descricao: "Hall linear + comparador LM393 com ajuste; saídas analógica (AO) e digital (DO).", ideia: "Sensor de proximidade com limite ajustável.", usos: ["Sensor de proximidade com limite ajustável.","Contar ímãs com sensibilidade calibrada.","Detectar tampa magnética em caixas."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "AO", linha: "S", gpio: "IO1" }, { rotulo: "DO", linha: "S", gpio: "IO2" } ] },

      // Temperatura, clima e fogo
      { id: 25, nome: "Sensor de Temperatura PTC", categoria: "Temperatura, clima e fogo", tipo: "analogico", visual: "ptc", aparencia: "Pequena conta laranja com duas pernas e ondas de calor.", descricao: "Termistor cuja resistência varia com a temperatura.", ideia: "Termômetro analógico e proteção térmica.", usos: ["Fazer termômetro analógico.","Proteger motor contra superaquecimento.","Ligar ventoinha ao esquentar."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO1" } ] },
      { id: 26, nome: "PTC com Ajuste Digital", categoria: "Temperatura, clima e fogo", tipo: "analogico", visual: "ptc-ajuste", aparencia: "Conta laranja com chip preto e trimpot azul de ajuste.", descricao: "Termistor + LM393 com limite ajustável no trimpot.", ideia: "Termostato de ventoinha.", usos: ["Montar termostato de ventoinha.","Avisar quando a água da estufa esquenta.","Criar alarme de temperatura com limite."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "AO", linha: "S", gpio: "IO1" }, { rotulo: "DO", linha: "S", gpio: "IO2" } ] },
      { id: 27, nome: "DS18B20 (1-Wire)", categoria: "Temperatura, clima e fogo", tipo: "especial", visual: "ds18b20", aparencia: "Cápsula preta de três pernas com a marca DS e um termômetro.", descricao: "Sensor digital de alta precisão; vários podem compartilhar o mesmo pino.", ideia: "Aquários, chocadeiras e cervejaria artesanal.", usos: ["Monitorar aquário e chocadeira.","Controlar temperatura de fermentação.","Ler vários pontos com um único pino."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO4" } ] },
      { id: 28, nome: "DHT11 (Temperatura e Umidade)", categoria: "Temperatura, clima e fogo", tipo: "especial", visual: "dht11", aparencia: "Caixa azul-clara com grade de furos e três pernas.", descricao: "Temperatura e umidade empacotadas em um único fio digital.", ideia: "Estação meteorológica e controle de estufa.", usos: ["Montar estação meteorológica.","Controlar umidade de estufa.","Avisar sobre mofo em ambientes fechados."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO5" } ] },
      { id: 29, nome: "Sensor de Chama", categoria: "Temperatura, clima e fogo", tipo: "digital", visual: "chama", aparencia: "LED transparente com uma chama laranja desenhada dentro.", descricao: "Fototransistor calibrado para o infravermelho do fogo (760–1100 nm).", ideia: "Robô bombeiro e alarme de incêndio.", usos: ["Montar robô bombeiro.","Disparar alarme de incêndio.","Detectar vela acesa em experimento."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO6" } ] },

      // Luz, visão e presença
      { id: 30, nome: "LDR (Luminosidade)", categoria: "Luz, visão e presença", tipo: "analogico", visual: "ldr", aparencia: "Círculo branco com trilha em zigue-zague e raios de sol.", descricao: "Fotoresistor que perde resistência quando a luz bate nele.", ideia: "Acender a luz ao anoitecer e ajustar brilho.", usos: ["Acender luz ao anoitecer.","Ajustar brilho do display conforme o ambiente.","Contar pessoas que passam na frente."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO1" } ] },
      { id: 31, nome: "Receptor IR 38 kHz", categoria: "Luz, visão e presença", tipo: "especial", visual: "receptor-ir", aparencia: "Cúpula preta com lente e uma onda quadrada de 38 kHz.", descricao: "Recebe apenas pulsos infravermelhos modulados em 38 kHz.", ideia: "Controlar o ESP32 com o controle remoto da TV.", usos: ["Controlar o ESP32 com o controle da TV.","Receber comandos de um emissor IR.","Decodificar códigos de controle remoto."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO7" } ] },
      { id: 32, nome: "Desvio de Obstáculo IR", categoria: "Luz, visão e presença", tipo: "digital", visual: "obstaculo-ir", aparencia: "Dois LEDs lado a lado disparando feixes contra uma parede.", descricao: "Emissor e receptor infravermelhos frontais; o reflexo indica um obstáculo.", ideia: "Robô aspirador e torneira automática.", usos: ["Desviar de obstáculos em robô aspirador.","Abrir torneira automática.","Contar objetos que passam na frente."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO6" } ] },
      { id: 33, nome: "Seguidor de Linha", categoria: "Luz, visão e presença", tipo: "digital", visual: "seguidor-linha", aparencia: "Dois sensores apontando para baixo sobre uma faixa preta.", descricao: "Reflexão óptica que distingue superfície branca de linha preta.", ideia: "Robô seguidor de linha.", usos: ["Fazer robô seguir linha preta.","Detectar borda de mesa.","Separar peças claras e escuras."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO6" } ] },
      { id: 34, nome: "Detector de Batimentos", categoria: "Luz, visão e presença", tipo: "analogico", visual: "batimentos", aparencia: "Coração vermelho com uma linha de pulso atravessando.", descricao: "LED IR + fototransistor que mede a variação de luz no dedo (fotopletismografia).", ideia: "Medidor didático de frequência cardíaca.", usos: ["Medir frequência cardíaca didática.","Detectar a presença do dedo no sensor.","Criar gráfico de batimentos no display."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO1" } ] },

      // Microfones e potência
      { id: 35, nome: "Microfone Pequeno", categoria: "Microfones e potência", tipo: "analogico", visual: "mic-pequeno", aparencia: "Cápsula metálica pequena com furos e ondas de som.", descricao: "Cápsula de eletreto que entrega variações de tensão proporcionais ao som.", ideia: "Detector de palmas e sensor de ruído ambiente.", usos: ["Detectar palmas para ligar luzes.","Medir ruído ambiente.","Acionar brinquedo por som."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "S", linha: "S", gpio: "IO1" } ] },
      { id: 36, nome: "Microfone Grande com Ajuste", categoria: "Microfones e potência", tipo: "analogico", visual: "mic-grande", aparencia: "Cápsula metálica com chip preto, trimpot azul e ondas de som.", descricao: "Cápsula maior + LM393, com saída analógica e digital ajustável.", ideia: "Alarme de vidro quebrado e medidor de decibéis.", usos: ["Alarme de vidro quebrado.","Medidor de decibéis.","Ativar gravação com som alto."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V" }, { rotulo: "DO", linha: "S", gpio: "IO6" }, { rotulo: "AO", linha: "S", gpio: "IO1" } ] },
      { id: 37, nome: "Módulo de Relé 5 V", categoria: "Microfones e potência", tipo: "digital", visual: "rele", aparencia: "Caixa azul de relé com três bornes dourados e símbolo de bobina.", descricao: "Chave eletromecânica isolada que liga cargas de 110/220 V ou fechaduras de 12 V.", ideia: "Acionar fechadura, lâmpada ou portão.", usos: ["Acionar fechadura elétrica.","Ligar lâmpada ou ventilador.","Abrir portão com comando remoto."], ligacao: [ { rotulo: "−", linha: "G" }, { rotulo: "+", linha: "V", valor: "5 V" }, { rotulo: "S", linha: "S", gpio: "IO4" } ] }
    ]
  };

  root.FEIRA = root.FEIRA || {};
  root.FEIRA.data = data;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }
})(typeof window !== "undefined" ? window : globalThis);
