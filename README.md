# Mundo Maker — Feira de Exposição (prévia interativa)

Site estático em português para os alunos **verem e experimentarem como será a feira** antes da montagem: a planta da sala, as 5 estações, as interações do visitante, os 37 sensores, a lista de materiais e o passaporte com certificado.

> É uma **prévia visual e navegável**, baseada no `Material Sugestão.docx` e na lista prioritária `Material novo.pdf`. O site em si é estático e não se conecta ao ESP32 nem ao Supabase; ele também documenta o kit físico que ficará na feira.

### Ordem da visita

| # | Estação | Tema |
|---:|---|---|
| 1 | **O Toque Mágico** (kit físico) | NFC: leitura sem encostar |
| 2 | **O Cérebro** | ESP32-S3 + placa de expansão |
| 3 | **O Semáforo Falante** | LED RGB e seus estados |
| 4 | **A Caixa dos Sentidos** | os 37 sensores do kit |
| 5 | **A Memória que Não Esquece** | Flash, Painel Web e fechamento com a LGPD |

A numeração vale para o site inteiro (deck, planta, passaporte, materiais e guia). A estação 5 fecha a visita com uma conversa rápida sobre a **LGPD**: quando o aluno conclui toda a jornada escolar, os dados dele são excluídos de todos os bancos de dados.

---

## Como abrir

### Opção 1 — duplo clique (funciona sem internet e sem instalar nada)

Abra `index.html` no navegador. O site usa HTML, CSS e JavaScript clássicos, então funciona direto do disco (`file://`), sem servidor e sem build.

> Em alguns navegadores, `localStorage` e a área de transferência podem ser restritos em `file://`. O site tem fallback em memória; para a experiência completa, use a opção 2.

### Opção 2 — servidor local (recomendado para testar e publicar)

Com Python instalado, na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

Não há etapa de instalação: o site não usa npm, bundler, framework, CDN ou fontes externas.

---

## O que tem no site

| Seção | O que mostra |
|---|---|
| Capa | Cena SVG animada com o ESP32, as 5 estações e as ondas NFC |
| A feira | Fluxo da visita em 4 passos, dicionário rápido, dica de ouro e resumo em números |
| Kit ao vivo | Onde fica o equipamento (Estação 1), o painel em outro tablet (Estação 5), passo a passo, cuidados e plano B no nível técnico; checklist imprimível |
| Planta | Vista de cima com a entrada, a circulação em U e as estações na ordem 1 → 2 → 3 → 4 → 5; clique para ver detalhes, ampliar, baixar SVG ou imprimir |
| Estações | Deck com as 5 equipes, cena ilustrada, abas “Para o visitante / Como montar / Materiais usados”, mapa de pinos na estação 2 e uma demo interativa por estação. A estação 5 fecha a visita com uma nota sobre a LGPD |
| Sensores | Catálogo dos 37 sensores com busca, filtros, foto real por padrão, explicação curta, 3 modos de uso e a ligação no nível técnico |
| Glossário | 25 palavras técnicas explicadas em uma frase, cada uma com um exemplo da feira |
| Materiais | Um guia por estação: material de uso comum + 5 manuais com lista de materiais, montagem e “para que serve”, com checklist persistente |
| Passaporte | 5 selos, certificado nominal e impressão |
| Celular | De 320 px a telas grandes: menu hambúrguer, tabelas roláveis, alvos de toque maiores e layout de duas colunas no celular deitado |

### Níveis de leitura (linguagem simples e detalhe técnico)

O site foi escrito para quem nunca estudou eletrônica: a primeira camada usa frases curtas e comparações, e o detalhe fica guardado.

- **Padrão: simples.** Resumos das estações, roteiro do visitante e cartas dos sensores aparecem em linguagem leiga.
- **Botão “Ver detalhes técnicos”** (na seção Estações, no Kit e em Sensores): mostra descrição do componente, ligação G-V-S, dica da equipe e passo a passo de montagem. O estado fica em `localStorage` na chave `feira:v1:nivel` e vale para o site inteiro.
- **Termos sublinhados no site inteiro**: depois de renderizar, o `app.js` percorre o texto e transforma as palavras do glossário em botões `.termo` (no máximo uma vez por bloco, para não poluir). Clicar (ou usar Enter) abre um popover com a explicação e o exemplo; Esc fecha. As definições e as formas reconhecidas vêm de `glossario` em `js/data.js` (`termo` + `aliases`), então site e seção `#glossario` nunca divergem. Botões, links, títulos, rótulos e o próprio glossário ficam de fora.
- **Sempre visível**: “Para o visitante”, modos de uso dos sensores, demos e o glossário.


### Guia de materiais e montagem

O arquivo [`GUIA-MATERIAIS-E-MONTAGEM.md`](GUIA-MATERIAIS-E-MONTAGEM.md) transforma o Material Sugestão no roteiro atual: lista atualizada, como separar as caixas, as três tags físicas da Estação 1 e o passo a passo de montagem (com o plano B) de cada mesa.

### Demos interativas

1. **G-V-S** — associe os terminais de 3 sensores às linhas G, V e S.
2. **NFC** — escolha um cartão e encoste no leitor para ver LIBERADO, NEGADO ou BLOQUEADO.
3. **Roleta** — gire e descubra o significado de cada cor do LED RGB.
4. **Caixa dos Sentidos** — tire sensores da caixa e classifique em digital, analógico ou especial.
5. **Memória/offline** — simule o caminho do cartão até o painel web e ligue “Internet caiu”.

Os estados do passaporte e do checklist ficam no navegador (`localStorage`). Para zerar, use os botões “Recomeçar”/“Limpar marcações” ou apague as chaves `feira:v1:*` nas ferramentas do navegador.

### Kit ao vivo na feira

A decisão registrada no site é:

- **Estação 1 — “O Toque Mágico”:** recebe o **ESP32-S3 + PN532 reais**. É a estação cujo tema é o NFC e onde o visitante encosta uma tag de verdade e vê o LED reagir.
- **Estação 5 — “A Memória que Não Esquece”:** recebe apenas um **tablet/notebook** acessando o painel web do **mesmo ESP32**, pela rede local. Não é necessário um segundo kit.

Cuidados de montagem:

- PN532 em I2C, **3,3 V**, **SDA no IO8**, **SCL no IO9** e chaves **1 ON / 2 OFF**.
- Tags comuns têm **UID fixo**. Leia o UID real de cada tag, cadastre no painel e atualize as etiquetas dos cartões de papel; não conte com “gravar” o UID do exemplo.
- Para o painel na Estação 5, use o IP mostrado no Monitor Serial ou `http://nfc.local/`. O painel tem login; mantenha a sessão autenticada no tablet.
- O painel é local: com o roteador ligado e sem internet externa, ele continua funcionando. O modo AP do ESP32 (`ControleAcesso-S3`) também serve.
- **Plano B:** sem tablet ou rede, a Estação 5 fica com o varal de papel e o kit permanece na Estação 1.
- **Segurança:** troque as senhas padrão do painel e do AP antes da feira; use apenas dados de demonstração; não publique credenciais no site, no README ou em capturas.

O bloco “Kit ao vivo” no site e o botão **Imprimir checklist** trazem o roteiro completo.

---

## Estrutura de arquivos

```text
feira-exposicao/
├── index.html               # estrutura semântica e conteúdo de apoio
├── css/
│   ├── styles.css           # tokens, layout e componentes gerais
│   ├── arte.css             # estilos das ilustrações SVG
│   ├── demos.css            # estilos das demos interativas
│   └── print.css            # impressão (lista, planta e certificado)
├── js/
│   ├── data.js              # TODO o conteúdo: estações, materiais, sensores, cartões...
│   ├── logic.js             # funções puras (também testáveis no Node)
│   ├── art.js               # ilustrações SVG (capa, planta, cenas, roleta, pinos, 37 sensores)
│   ├── interactions.js      # as 5 demos
│   └── app.js               # renderização, deck, checklist, passaporte, navegação
├── assets/
│   ├── favicon.svg
│   ├── kit-37-sensores.jpg   # foto de referência do kit completo
│   └── sensores/             # 37 recortes com a foto de cada módulo
├── tests/
│   ├── run-tests.js         # dados, lógica, HTML, contraste e sintaxe
│   └── run-e2e.js           # Chrome headless via CDP + screenshots
├── README.md
└── .gitignore
```

Carregamento (scripts clássicos, em ordem): `data.js` → `logic.js` → `art.js` → `interactions.js` → `app.js`.

---

## Como editar o conteúdo

Quase tudo está em **`js/data.js`**:

- `meta`: nome da escola, data, créditos.
- `estacoes`: textos das 5 equipes, listas de “Para o visitante”, “Como montar”, materiais e dica. A ordem do array é a **ordem da visita** (1 → 5); a estação 5 tem o campo `lgpd` com o fechamento sobre proteção de dados. `resumo` e `visitante` são a **primeira camada** (linguagem simples); `montagem`, `materiais` e `dica` são o detalhe técnico.
- `glossario`: fonte única das explicações (`id`, `termo`, `aliases`, `simples`, `exemplo`). O mesmo texto alimenta a seção Glossário, o popover dos termos e a marcação automática no site inteiro. Para um termo novo aparecer sublinhado, basta adicionar `aliases` (formas que devem ser reconhecidas no texto).
- `materiais.prioritarios`: os 20 itens do Material novo (nome, quantidade, uso).
- `materiais.extras`: os 11 itens complementares do Material Sugestão; zip e bexigas foram removidos porque não serão usados.
- `sensores`: os 37 sensores (nome, categoria, tipo, `explicacao`, descrição, ideia, ligação, `usos`, `visual` e `aparencia`).
  - `explicacao`: frase curta em linguagem simples, sempre visível na carta. `descricao`: detalhe técnico, mostrado em “Detalhes técnicos”.
  - `visual`: chave do desenho em `art.js` (`FIGURAS`) e também o nome da foto em `assets/sensores/<visual>.jpg`. `aparencia`: descrição do componente, usada como texto acessível do SVG.
  - `usos`: lista com pelo menos 3 modos de uso e aplicação de cada sensor, exibida na carta logo abaixo da explicação.
  - O catálogo abre no modo **Foto real do kit** (padrão) e permite trocar para **Desenho** (`FEIRA.art.figuraSensor`). A foto usa `alt` descritivo; o desenho mostra a quantidade de pinos do conector a partir de `ligacao`.
  - Para criar um desenho novo, adicione uma chave em `FIGURAS` (`js/art.js`), aponte o sensor para ela e salve a foto correspondente em `assets/sensores/`. Os testes exigem 37 chaves, 37 fotos, 111 modos de uso e uma explicação simples por sensor.
- `cartoes`, `roleta`, `linhaDoTempo`, `pinos`, `quizGvs`: dados das demos.

Para manter a leitura fácil: frases curtas na primeira camada, nenhum termo da lista bloqueada (GPIO, PSRAM, I2C, PN532 etc.) fora do nível técnico e todo termo novo registrado no `glossario`. Os testes verificam isso automaticamente.

Depois de editar, recarregue a página. Não é preciso compilar.

### Regra de prioridade dos materiais

- **Quantidade e nome** valem os do **Material novo** (PDF).
- **Como usar** vem do **Material Sugestão** (DOCX).
- Itens do DOCX que não estão no PDF aparecem como **complementares/opcionais**, com aviso quando a mecânica depende deles (papelão, velcro, pregadores, alumínio e colorset).

### Observações de fidelidade

- “Guaxe” foi normalizado para **guache**; “Papel Metro Marrom” para **papel kraft marrom**; “Papel cartão vermelha/amarela” para **vermelho/amarelo**.
- O PDF pede celofane **verde, vermelho e azul**; ciano pode ser obtido sobrepondo azul + verde.
- Os cartões NFC usam os UIDs do material (`2C:9D:7E:8E`, `AB:12:34:56`); o terceiro cartão (bloqueado) é **ilustrativo**.
- A roleta usa as 6 cores do DOCX; o site diferencia **estados reais do firmware** de **demonstrações de cor** (laranja ≈ falha do PN532; roxo = mistura RGB).
- As ilustrações são desenhos SVG de referência e as fotos vêm de uma imagem do kit de 37 módulos: cada módulo tem um recorte próprio em `assets/sensores/` e a foto completa fica em `assets/kit-37-sensores.jpg`. O desenho continua sendo a visão esquemática dos pinos G-V-S; a foto serve para reconhecer o componente físico.

---

## Testes

Os testes usam o Node.js (não são necessários para abrir o site):

```bash
node tests/run-tests.js
node tests/run-e2e.js
```

- `run-tests.js`: valida dados (5 estações na ordem da visita, 37 sensores, 20 + 11 materiais, separação por estação, cartões, tags físicas, roleta, fechamento LGPD), os 111 modos de uso, as 37 explicações simples e a ausência de jargão na primeira camada, o glossário (ids/termos únicos e frases curtas), o nível de leitura padrão, os 37 desenhos de sensores (chaves distintas, SVG autocontido e descrição acessível), as 37 fotos, a foto do kit completo, o modo foto como padrão, regras puras, referências de arquivos, ausência de URLs externas, contraste WCAG e sintaxe dos JS.
- `run-e2e.js`: sobe um servidor local próprio, abre o Chrome headless via CDP e testa os fluxos principais (NFC, roleta, caixa, offline, foto como padrão e alternância com desenho, modos de uso, nível simples/técnico com persistência, glossário e popover de termos, linguagem da primeira camada, manuais de materiais, passaporte/certificado), além de gerar screenshots e PDFs de impressão em `tests/artifacts/`.
- O E2E usa o `WebSocket` nativo do Node 22+; para abrir o site, o Node não é necessário.
- Variável opcional `CHROME_PATH` para apontar outro navegador Chromium. Em ambientes onde o Chromium é bloqueado por sandbox de sistema, rode o E2E em uma máquina normal ou abra o site diretamente para a revisão visual.

Os artefatos de teste ficam em `tests/artifacts/` e `.tmp/` (ignorados pelo Git).

---

## Publicação

O site é 100% estático. Qualquer hospedagem serve:

- **Vercel/Netlify**: arraste a pasta `feira-exposicao` ou aponte o repositório; não há comando de build.
- **GitHub Pages**: publique o conteúdo da pasta (ou configure a pasta como raiz).
- **Google Drive/pen drive**: também funciona para abrir localmente; para acesso por link, prefira uma hospedagem estática.

Se publicar dentro de um subdiretório, mantenha a estrutura de pastas (`css/`, `js/`, `assets/`).

---

## Acessibilidade e desempenho

- Navegação por teclado nas abas do deck, nas demos e no checklist; foco visível.
- Termos do glossário viram botões com `aria-expanded`; o popover fecha com Esc, clique fora ou rolagem e devolve o foco.
- Nível de leitura simples por padrão, com alternância acessível (`aria-pressed`) e preferência salva.
- Resultados anunciados com `aria-live`; botões com rótulos claros.
- `prefers-reduced-motion`: animações e giros são reduzidos/instantâneos.
- Tema escuro (padrão) e claro, com preferência salva.
- Sem requisições externas, sem cookies, sem rastreamento.
- **LGPD:** os dados do passaporte e do checklist ficam apenas no `localStorage` do navegador; a última estação explica a exclusão dos dados ao fim da jornada escolar.
- Impressão dedicada para lista de materiais, planta e certificado.

---

## Créditos e fontes

- **Projeto ProSUB · Thauan** (conforme o Material novo).
- Roteiro e mecânicas: `Material Sugestão.docx`.
- Lista prioritária: `Material novo.pdf`.
- Dados técnicos: `MANUAL_DO_SISTEMA.md`, `GUIA_DE_PINOS_E_EXPANSAO.md` e `GUIA_37_SENSORES_ESP32.md` (pasta `esp32s3-nfc-acesso`).

Site feito para a feira de exposição da escola. Sinta-se livre para adaptar textos, cores e quantidades em `js/data.js`.
