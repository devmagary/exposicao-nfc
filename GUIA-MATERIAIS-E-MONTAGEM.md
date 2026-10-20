# Lista de materiais e montagem de cada mesa — depois do NFC físico

Este documento atualiza o **Material Sugestão** para o que o projeto virou depois de três mudanças:

1. a lista **prioritária** passou a ser a do **Material novo** (20 itens);
2. o roteiro original do Material Sugestão virou **13 itens complementares**, porque a mecânica de cada mesa depende deles;
3. o **kit ESP32-S3 + PN532 deixou de ser “se houver”**: agora ele fica na **Estação 2** e a **Estação 5** espelha o painel web da mesma placa.

> Tudo o que está aqui também está no site, na seção **Materiais** (por mesa, por bloco e por origem) e no site da **Estação 2** (selo AO VIVO) e da **Estação 5** (selo PAINEL ESPELHADO).

---

## 1. Como ficou a lista

| Origem | Itens | Para quê |
|---|---:|---|
| **Material novo** (lista prioritária) | 20 | Comprar. Cobre papel, escrita, simulação e montagem. |
| **Material Sugestão** (complementares) | 13 | Reaproveitar. Traz o que o roteiro exige e a lista nova não tem: papelão, velcro, zip, pregadores, alumínio, bexigas, lanternas, TNT. |
| **Total** | **33** | — |

**5 itens da mecânica que não estão na lista nova** (precisam entrar na compra): papelão (5 caixas), velcro (1 m), sacos zip (20), pregadores (20) e papel alumínio (1 rolo). O colorset também é obrigatório — é ele que faz os cartões NFC de papel com os UIDs reais.

### 1.1 A lista prioritária (Material novo) — 20 itens

| # | Material | Quantidade |
|---:|---|---|
| 1 | Cartolina branca | 5 a 6 folhas |
| 2 | Papel cartão preto | 2 folhas |
| 3 | Papel cartão vermelho | 2 folhas |
| 4 | Papel cartão amarelo | 3 folhas |
| 5 | Papel metro marrom (kraft) | 4 metros |
| 6 | EVA colorido (vermelho, preto e amarelo) | 3 folhas |
| 7 | Canetinhas hidrográficas (12 cores) | 1 estojo |
| 8 | Pincel marcador permanente preto (grosso) | 2 unidades |
| 9 | Lápis de cor / giz de cera | 1 caixa |
| 10 | Etiquetas adesivas brancas | 1 cartela |
| 11 | Post-its coloridos | 3 blocos |
| 12 | Fita crepe | 2 rolos |
| 13 | Papel celofane colorido (verde, vermelho, azul) | 1 de cada |
| 14 | Kit de guache | 1 kit |
| 15 | Pincéis para guache escolar | 3 pincéis |
| 16 | Fita dupla face | 2 rolos |
| 17 | Cola branca / cola quente | 1 de cada |
| 18 | Tesouras sem ponta | 5 unidades |
| 19 | Estilete (uso do professor) | 1 unidade |
| 20 | Barbante de algodão (grosso) | 1 rolo |

### 1.2 Os complementares (Material Sugestão) — 13 itens

| # | Material | Quantidade | Por que ainda é necessário |
|---:|---|---|---|
| 1 | Papelão (caixas de supermercado) | 5 caixas médias | Suportes “L”, leitor gigante da mesa 2 e caixa furada da mesa 4 |
| 2 | Fita adesiva colorida (preta, vermelha, amarela) | 1 de cada | As três linhas G-V-S do painel da mesa 1 |
| 3 | Barbante / lã em 4 cores | 1 novelo de cada | Montar o “circuito do PN532” de barbante na mesa 2 |
| 4 | Palitos de churrasco | 1 pacote | “Pinos” de papel do mapa de EVA |
| 5 | Papel cartão colorido (colorset) | 1 bloco | **Cartões NFC com os UIDs reais** e sensores em miniatura |
| 6 | Velcro adesivo | 1 metro | Encaixe dos painéis das mesas 1 e 2 |
| 7 | Ímãs pequenos | 10 unidades | Prender cartões e simular chave magnética |
| 8 | Sacos plásticos zip pequenos | 20 unidades | Sensores de papel da Caixa dos Sentidos |
| 9 | Papel alumínio | 1 rolo | Blindagem/antena do leitor NFC |
| 10 | Bexigas | 1 pacote | Explicar o campo eletromagnético na mesa 2 |
| 11 | Lanterna pequena de LED (ou flash) | 3 unidades | Acender o “LED de papel” da mesa 3 |
| 12 | Pregadores de roupa | 20 unidades | Varal da linha do tempo |
| 13 | Saco de TNT ou tecido | 1 metro | Fundo do notebook na mesa 5 |

### 1.3 Como separar na hora de montar

A lista é a mesma, mas se organiza em **uma caixa de sala + cinco caixas de mesa**. O site mostra exatamente isso no filtro **Por mesa**.

| Caixa | Itens | Quem guarda |
|---|---:|---|
| Sala (as cinco mesas) | 10 | Professor |
| Mesa 1 — O Cérebro | 9 | Equipe 1 |
| Mesa 2 — O Toque Mágico | 8 + kit físico | Equipe 2 |
| Mesa 3 — O Semáforo Falante | 4 | Equipe 3 |
| Mesa 4 — A Caixa dos Sentidos | 5 | Equipe 4 |
| Mesa 5 — A Memória que Não Esquece | 4 | Equipe 5 |

*Os números contam cada item uma vez pela mesa. Itens finos (EVA, colorset, velcro, papelão, post-its, etiquetas) aparecem em duas mesas — a caixa de sala guarda o estoque e cada mesa leva o pedaço que precisa.*

**O que fica na caixa de sala (10 itens):** cartolina branca, papel kraft, canetinhas, pincel preto, lápis de cor/giz, fita crepe, fita dupla face, cola, tesouras e ímãs.

---

## 2. O que mudou com o NFC físico

Antes, a Estação 2 era só papelão, e o kit entrava “se houver”. Agora:

- **Estação 2** — recebe o ESP32-S3 + PN532, o LED RGB e as três tags de verdade. É a mesa do “uau!”.
- **Estação 5** — deixa de ser uma tela de notebook solta: passa a **espelhar o painel web do mesmo ESP32** da mesa 2. Não existe segundo kit.
- **Estação 3** — continua de papel, mas agora *explica* o que o LED da mesa 2 faz (standby, liberado, negado, falha, AP, boot).
- **Mesa 1** — continua explicando os pinos, e passa a ser o “mapa” do que os fios da mesa 2 estão usando: SDA no IO8, SCL no IO9, LED no IO48.

### 2.1 Três tags, não três UIDs de papel

As tags que acompanham o kit são fisicamente diferentes e **têm UID fixo** — não dá para “escrever” o UID de exemplo nelas. Use as três tags do jeito que vieram:

| Tag | Papel na feira | O que acontece |
|---:|---|---|
| 1 | “Lucas Silva” — aluno ativo | LED verde por 2 s, o painel registra o acesso |
| 2 | Tag sem cadastro | LED vermelho por 2 s, acesso negado |
| 3 | Matrícula suspensa | Negado com aviso de bloqueio no painel |

1. Leia o UID real de cada tag no painel web.
2. Cadastre nas `cartoes.json` da Flash: tag 1 ativa, tag 3 bloqueada, tag 2 fora da lista.
3. Escreva esse UID na etiqueta do cartão de papel correspondente — o cartão de papel continua servindo de apoio visual e de “fila”.
4. Não publique o UID real nem as senhas no site: o site usa UIDs de exemplo só para simular.

---

## 3. Como fica cada mesa

### Estação 1 — "O Cérebro" (ESP32-S3 + Placa de Expansão)

**Papel:** continua 100% de papel. Agora serve de mapa do que está plugado na mesa 2.

**Material**
- Papel cartão preto, vermelho e amarelo (as linhas G, V e S).
- EVA colorido e palitos de churrasco (pinos em relevo).
- Fita adesiva colorida, colorset, velcro.
- Post-its, canetinhas, pincel preto, cartolina branca.

**Montagem**
1. Desenhe o ESP32-S3 no centro da cartolina e a placa de expansão ao redor.
2. Passe as fitas preta, vermelha e amarela formando G-V-S.
3. Cole no EVA os “pinos” de papel montados nos palitos; fixe o painel com velcro.
4. Marque com hachura vermelha os pinos **IO35, IO36 e IO37 — PROIBIDOS (PSRAM)** e deixe post-its para as respostas.

**Novo detalhe:** acrescente uma etiqueta ao lado dos pinos usados pelo kit — **IO8 (SDA), IO9 (SCL), IO48 (LED)** — para ligar esta mesa ao que os visitantes vão ver na mesa 2.

**O visitante faz**
1. Observa o cartaz e recebe um “sensor de papel”.
2. Descobre em qual linha ele encaixa: G, V ou S.
3. Confere a resposta atrás do velcro e acha a área proibida da PSRAM.

**Deu errado?** Se faltar EVA, substitua os pinos por recortes de cartolina colorida — a mecânica do velcro continua igual.

---

### Estação 2 — "O Toque Mágico" (NFC) — **a mesa do kit físico**

**Papel:** é a única mesa com o hardware ligado. Cai a simulação “se houver hardware”: agora ela é o centro.

**Material**
- Kit ESP32-S3 + PN532, três tags NFC, cabo USB, fonte/energia e LED RGB da placa.
- Papelão (leitor gigante), papel alumínio (antena simulada), bexiga (campo magnético).
- Colorset com os UIDs reais, EVA para o acabamento dos cartões, etiquetas brancas.
- Velcro, barbante/lã em 4 cores (circuito SDA-SCL-VCC-GND).

**Montagem**
1. Monte o leitor PN532 gigante em papelão com o desenho do módulo vermelho e uma janela para o leitor real.
2. Coloque o PN532 real atrás do leitor gigante, com a tag encostando à frente: SDA no IO8, SCL no IO9, 3,3 V, chaves **1 ON e 2 OFF**.
3. Recorte os cartões de colorset, cole a etiqueta com o UID real de cada tag e use velcro para “encostar” no leitor.
4. Cole o envelope com as três respostas atrás do leitor e encha a bexiga com a frase do campo magnético.
5. Passando o barbante pelos pinos certos, monte o “circuito do PN532” como atividade de aquecimento da fila.

**O visitante faz**
1. Escolhe um cartão de papel e encosta no leitor de papelão (velcro).
2. Puxa a resposta correspondente: LIBERADO, NEGADO ou BLOQUEADO.
3. Encosta uma **tag de verdade** no leitor e vê o LED acender na hora; o painel da mesa 5 registra o mesmo acesso no mesmo momento.

**Deu errado?** Cabo solto ou chave errada deixam o LED vermelho piscando (falha do I2C). A tabela das três tags, o roteiro de teste e o plano B estão no bloco “Kit ao vivo” do site. Sem energia, a mesa funciona só com o leitor de papelão e o envelope.

---

### Estação 3 — "O Semáforo Falante" (LED RGB)

**Papel:** continua de papel, mas agora o cartaz das cores explica o LED que está aceso na mesa 2.

**Material**
- Roleta de seis setores pintada com guache e pincéis (é a mesa que mais usa tinta).
- Papel celofane (verde, vermelho, ciano), lanternas ou flash do celular.
- Cartolina branca para o cartaz dos estados.

**Montagem**
1. Recorte a roleta com seis setores: ciano, verde, vermelho, laranja, roxo e azul; pinte com o guache.
2. Faça um cartaz por estado **usando os estados reais do firmware**: ciano = standby, verde = liberado, vermelho = negado, amarelo = modo AP, azul = boot, vermelho piscando = falha do PN532.
3. Recorte um furo na cartolina, cubra com celofane e ilumine por trás com a lanterna.

**Novo detalhe:** o setor “leitor desconectado” da roleta deixa de ser um estado inventado — ele vira **vermelho piscando**, que é exatamente o que acontece na mesa 2 quando o PN532 falha.

**O visitante faz**
1. Gira a roleta e cai num estado.
2. Descobre o que a cor significa.
3. Aponta a lanterna com o celofane atrás do furo e acende o “LED de papel”.

**Deu errado?** Sem lanterna, o furo pode ser iluminado pela luz da janela ou por uma luminária — o efeito de cor continua.

---

### Estação 4 — "A Caixa dos Sentidos" (37 sensores)

**Papel:** sem mudança de papel, mas o catálogo de sensores do site continua sendo a referência para as etiquetas.

**Material**
- Papelão para a caixa com seis furos (furos feitos com o estilete, pelo professor).
- 20 saquinhos zip com os sensores de papel, etiquetas brancas e colorset.
- Velcro para colar o saquinho na coluna certa.

**Montagem**
1. Abra seis furos redondos na caixa (estilete, só o professor).
2. Monte cada saquinho com um “sensor de papel” e a etiqueta com nome e função.
3. Monte o painel com três colunas: **Digitais** (botão, reed, tilt), **Analógicos** (LDR, joystick, hall) e **Especiais** (DS18B20, DHT11, IR 38 kHz, NFC).
4. Fixe o painel com velcro para descolar e recolocar a cada rodada.

**O visitante faz**
1. Mete a mão, tira um saquinho e lê a etiqueta.
2. Tenta adivinhar: digital, analógico ou especial?
3. Cola o saquinho na coluna certa; a equipe confere no final.

**Deu errado?** Faltando zip, use envelopes pequenos ou caixinhas de papel no lugar.

---

### Estação 5 — "A Memória que Não Esquece" (Flash + Painel Web) — **a mesa do painel espelhado**

**Papel:** deixou de ser “um notebook com o painel” e virou **o espelho do painel da mesa 2**. É aqui que o visitante entende que o cartão encostado na mesa 2 vira registro.

**Material**
- Tablet ou notebook na mesma rede do ESP32, com o painel já autenticado.
- Barbante de algodão, pregadores e cartões da linha do tempo (7 passos).
- TNT/tecido de fundo, post-its e canetinhas.

**Montagem**
1. Conecte o tablet na mesma rede do ESP32 (wifi da escola, roteador portátil ou modo AP) e abra o painel por IP ou `nfc.local`.
2. Deixe a sessão autenticada e a tela travada em modo quiosque, com brilho alto e o carregador plugado.
3. Estique o barbante e prenda os sete cartões com os pregadores: cartão encostado → UID lido → consulta na Flash → decisão → LED/relé → log no painel → sincronização.
4. Pendure o TNT atrás do tablet para dar destaque à tela.

**Novo detalhe:** faça um **ensaio combinado com a mesa 2** — alguém encosta a tag na mesa 2 e a equipe 5 aponta para a linha nova aparecendo no painel. É o momento que fecha o raciocínio do visitante.

**O visitante faz**
1. Vê o Painel Web da mesa 2 ao vivo.
2. Segue o varal da linha do tempo.
3. Escreve num post-it “o que acontece se a internet cair?” e cola na seção “Offline ainda funciona!”.

**Deu errado?** Sem tablet ou rede, a mesa continua com o varal e os cartões, e o painel fica só na mesa 2.

---

## 4. Checklist rápido de montagem

- [ ] Comprar os 20 itens do Material novo.
- [ ] Separar os 13 complementares (principalmente papelão, velcro, zip, pregadores e alumínio).
- [ ] Ler os UIDs reais das 3 tags e cadastrar no painel (1 ativa, 1 bloqueada, 1 fora da lista).
- [ ] Atualizar as etiquetas dos cartões de papel com os UIDs reais.
- [ ] Publicar o painel na rede da escola e testar a mesa 5 espelhando a mesa 2.
- [ ] Trocar as senhas do painel e do AP (sem publicar no site).
- [ ] Ensaiar o circuito: tag na mesa 2 → LED → registro na mesa 5.
- [ ] Testar o plano B de cada mesa.

---

*Base: Material novo (lista prioritária), Material Sugestão (roteiro e complementares) e os guias do ESP32-S3 (`MANUAL_DO_SISTEMA.md`, `GUIA_DE_PINOS_E_EXPANSAO.md`, `GUIA_37_SENSORES_ESP32.md`).*
