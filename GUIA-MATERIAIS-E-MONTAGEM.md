# Materiais e montagem de cada estação

Este guia substitui o roteiro do **Material Sugestão** e já reflete o projeto atual:

1. A compra segue a lista prioritária do **Material novo** (20 itens).
2. O roteiro do Material Sugestão entra como **11 complementares** — sem zip e sem bexigas, que não serão usados.
3. O **ESP32-S3 + PN532** fica na **Estação 1**; a **Estação 5** só espelha o painel da mesma placa.

> A mesma informação está no site, na seção **Materiais**: material de uso comum + um manual por estação com lista, montagem e “para que serve”.
>
> **No site, este guia fica no nível técnico.** A visita abre no modo simples (linguagem para quem nunca viu eletrônica); para ver montagem, ligação dos pinos e dicas da equipe, use o botão **“Ver detalhes técnicos”** na seção Estações, no Kit ou em Sensores. As palavras técnicas têm explicação no **Glossário do maker**.

---

## 1. Como a lista ficou

| Origem | Itens | Para quê |
|---|---:|---|
| **Material novo** (prioritários) | 20 | Comprar. Papel, escrita, pintura e montagem. |
| **Material Sugestão** (complementares) | 11 | Reaproveitar: papelão, velcro, colorset, alumínio, lanternas, TNT etc. |
| **Total** | **31** | — |

**O que mudou:** saíram os **sacos zip** (a Caixa dos Sentidos usa os sensores soltos) e as **bexigas** (o campo magnético agora é um cartaz). Com isso, a lista caiu de 33 para 31 itens.

**4 itens da mecânica que não estão na lista nova** (precisam entrar na compra): papelão (5 caixas), velcro (1 m), pregadores (20) e papel alumínio (1 rolo). O **colorset** também é obrigatório: é ele que faz os cartões NFC com os UIDs reais.

### 1.1 Prioritários — Material novo (20)

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

### 1.2 Complementares — Material Sugestão (11)

| # | Material | Quantidade | Onde entra |
|---:|---|---|---|
| 1 | Papelão (caixas de supermercado) | 5 caixas médias | Suportes “L”, leitor gigante da mesa 1 e caixa da mesa 4 |
| 2 | Fita adesiva colorida (preta, vermelha, amarela) | 1 de cada | Linhas G-V-S da mesa 2 |
| 3 | Barbante / lã em 4 cores | 1 novelo de cada | “Circuito do PN532” na mesa 1 |
| 4 | Palitos de churrasco | 1 pacote | “Pinos” de papel do mapa de EVA |
| 5 | Papel cartão colorido (colorset) | 1 bloco | Cartões NFC e sensores em miniatura |
| 6 | Velcro adesivo | 1 metro | Encaixe dos painéis das mesas 1 e 2 |
| 7 | Ímãs pequenos | 10 unidades | Prender cartões; simular Hall/Reed |
| 8 | Papel alumínio | 1 rolo | Blindagem/antena do leitor NFC |
| 9 | Lanterna pequena de LED (ou flash) | 3 unidades | “LED de papel” da mesa 3 |
| 10 | Pregadores de roupa | 20 unidades | Varal da linha do tempo |
| 11 | Saco de TNT ou tecido | 1 metro | Fundo do tablet na mesa 5 |

---

## 2. Material de uso comum (10)

Fica com o professor e serve às cinco equipes. Separe uma vez só:

- Cartolina branca
- Papel metro marrom (kraft)
- Canetinhas hidrográficas
- Pincel marcador permanente preto
- Lápis de cor / giz de cera
- Fita crepe
- Fita dupla face
- Cola branca / cola quente
- Tesouras sem ponta
- Ímãs pequenos

---

## 3. Cada estação

### Estação 1 — O Toque Mágico (kit físico)

**Para que serve:** abrir a visita mostrando o NFC de verdade: a tag acorda o leitor, o ESP32 decide e o LED responde — mesmo sem internet.

**Materiais próprios (7):** papelão, papel alumínio, etiquetas adesivas brancas, barbante/lã em 4 cores, papel cartão colorido, EVA colorido e velcro. **Use também o material de uso comum.**

**Kit (não é compra):** ESP32-S3, PN532, três tags NFC, cabo USB e o tablet que espelha o painel na Estação 5.

**Montagem**
1. Monte o leitor PN532 gigante em papelão, com o desenho da placa vermelha e uma janela para o leitor real.
2. Ligue o PN532 em I2C: **SDA no IO8, SCL no IO9, 3,3 V**, chaves **1 ON / 2 OFF**.
3. Leia o UID real das três tags e cadastre no painel: uma ativa, uma fora da lista e uma bloqueada.
4. Recorte os cartões de colorset e escreva o UID real de cada tag; use velcro para “encostar” no leitor.
5. Cole o envelope com as três respostas atrás do leitor.
6. Faça o cartaz do campo magnético: é o campo que “acorda” a tag.

**O visitante faz:** escolhe um cartão, encosta no leitor de papelão, puxa a resposta e depois encosta a tag de verdade para ver o LED e o registro na Estação 5.

**Dica:** LED vermelho piscando = PN532 sem resposta no I2C. Confira fios e chaves antes de abrir a feira.

---

### Estação 2 — O Cérebro

**Para que serve:** mostrar o ESP32-S3 e a placa de expansão, e explicar as três linhas G-V-S e os pinos proibidos da PSRAM.

**Materiais próprios (9):** papel cartão preto, vermelho e amarelo; EVA colorido; fita adesiva colorida; post-its; palitos de churrasco; papel cartão colorido; velcro. **Use também o material de uso comum.**

**Montagem**
1. Desenhe o ESP32-S3 no centro da cartolina e a placa de expansão ao redor.
2. Reproduza as linhas G-V-S com fita preta, vermelha e amarela.
3. Monte os “pinos” de papel nos palitos e cole no EVA; fixe o painel com velcro.
4. Marque **IO35, IO36 e IO37** com hachura vermelha e “PROIBIDOS — PSRAM”.
5. Acrescente uma etiqueta com **IO8 (SDA), IO9 (SCL) e IO48 (LED)**, os pinos usados pela mesa 1.

**O visitante faz:** recebe um sensor de papel, descobre se ele vai em G, V ou S e confere atrás do velcro; depois encontra a área proibida.

**Dica:** se faltar EVA, use cartolina colorida nos pinos — o encaixe com velcro continua.

---

### Estação 3 — O Semáforo Falante

**Para que serve:** traduzir o LED RGB da mesa 1 em cores e significados: standby, liberado, negado, modo AP, boot e falha.

**Materiais próprios (4):** kit de guache, pincéis, papel celofane e lanterna. **Use também o material de uso comum.**

**Montagem**
1. Recorte a roleta de seis setores: ciano, verde, vermelho, laranja, roxo e azul.
2. Pinte com guache e monte um cartaz para cada estado real do firmware.
3. Abra um furo na cartolina, cubra com celofane e ilumine por trás com a lanterna.
4. Deixe claro que “leitor desconectado” é o **vermelho piscando**, igual ao da mesa 1.

**O visitante faz:** gira a roleta, descobre o significado da cor e acende o “LED de papel” com a lanterna.

**Dica:** sem lanterna, use a luz da janela ou uma luminária; o efeito de cor continua.

---

### Estação 4 — A Caixa dos Sentidos

**Para que serve:** apresentar os 37 sensores e fazer o visitante classificá-los em digitais, analógicos e especiais.

**Materiais próprios (4):** papelão, etiquetas adesivas brancas, papel cartão colorido e estilete (uso do professor). **Use também o material de uso comum.**

**Montagem**
1. Abra seis furos redondos na caixa de papelão (estilete, só o professor).
2. Recorte os sensores de papel com desenho e etiqueta; deixe-os **soltos dentro da caixa**, sem saquinhos.
3. Monte o painel com três colunas: Digitais, Analógicos e Especiais.
4. Use velcro para colar e descolar os sensores no painel.

**O visitante faz:** mete a mão, tira um sensor de papel, lê a etiqueta, adivinha o tipo e cola na coluna certa; a equipe confere no fim.

**Dica:** os sensores soltos são mais rápidos de repor e não rasgam como os saquinhos.

---

### Estação 5 — A Memória que Não Esquece

**Para que serve:** mostrar que o acesso lido na mesa 1 vira registro na Flash e aparece no Painel Web — e continua funcionando offline. No fim, fechar a visita com a LGPD: a memória que também sabe esquecer.

**Materiais próprios (4):** TNT ou tecido, barbante de algodão, pregadores e post-its. **Use também o material de uso comum.**

**Painel espelhado (não é compra):** um tablet ou notebook na mesma rede do ESP32 da Estação 1. Não precisa de segundo kit.

**Montagem**
1. Conecte o tablet na mesma rede do ESP32, abra o painel por IP ou `nfc.local` e deixe a sessão autenticada.
2. Prenda o TNT atrás do tablet para destacar a tela.
3. Estique o barbante e pendure os sete cartões da linha do tempo com os pregadores.
4. Reserve o espaço dos post-its “o que acontece se a internet cair?”.
5. Ensaiem: tag na mesa 1 → LED → linha nova aparecendo na mesa 5.
6. Imprima o cartaz da LGPD com a frase do direito à exclusão e deixe à vista no fim da mesa.

**O visitante faz:** vê o painel ao vivo, segue o varal da linha do tempo, cola um post-it sobre o modo offline e ouve a explicação rápida sobre a LGPD.

**LGPD (fechamento):** a Lei nº 13.709/2018 garante que dados pessoais existem só enquanto houver finalidade. Quando o aluno conclui toda a jornada escolar, os registros dele são excluídos de **todos os bancos de dados**. O painel guarda apenas matrícula, nome e horário; os dados do passaporte do site ficam só no navegador.

**Dica:** sem tablet ou rede, a mesa continua com o varal; o painel fica só na Estação 1.

---

## 4. Checklist rápido

- [ ] Comprar os 20 itens do Material novo.
- [ ] Separar os 11 complementares (papelão, velcro, colorset, alumínio, pregadores, TNT etc.).
- [ ] Separar os 10 itens de uso comum.
- [ ] Ler os UIDs reais das 3 tags e cadastrar no painel.
- [ ] Atualizar as etiquetas dos cartões de papel.
- [ ] Testar o painel espelhado da Estação 5.
- [ ] Imprimir o cartaz da LGPD da Estação 5.
- [ ] Ensaiar o circuito completo: tag → LED → registro.
- [ ] Trocar as senhas do painel e do AP (sem publicar no site).

---

*Base: Material novo (prioritários), Material Sugestão (roteiro e complementares) e os guias do ESP32-S3.*
