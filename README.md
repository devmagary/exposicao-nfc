# Mundo Maker — Feira de Exposição (prévia interativa)

Site estático em português para os alunos **verem e experimentarem como será a feira** antes da montagem: a planta da sala, as 5 estações, as interações do visitante, os 37 sensores, a lista de materiais e o passaporte com certificado.

> É uma **prévia visual e navegável**, baseada no `Material Sugestão.docx` e na lista prioritária `Material novo.pdf`. O site em si é estático e não se conecta ao ESP32 nem ao Supabase; ele também documenta o kit físico que ficará na feira.

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
| A feira | Fluxo da visita em 4 passos, dica de ouro e resumo em números |
| Kit ao vivo | Onde fica o hardware real (Estação 2), o painel espelhado (Estação 5), passo a passo, cuidados e plano B; checklist imprimível |
| Planta | Vista de cima com a entrada, a circulação em U e as estações na ordem 1 → 2 → 3 → 4 → 5; clique para ver detalhes, ampliar, baixar SVG ou imprimir |
| Estações | Deck com as 5 equipes, cena ilustrada, abas “Para o visitante / Como montar / Materiais usados”, mapa de pinos na estação 1 e uma demo interativa por estação |
| Sensores | Catálogo dos 37 sensores com busca, filtros e ligação G-V-S/GPIO |
| Materiais | Lista prioritária do Material novo (20 itens) com checklist persistente + complementares do Material Sugestão (13 itens) |
| Passaporte | 5 selos, certificado nominal e impressão |

### Demos interativas

1. **G-V-S** — associe os terminais de 3 sensores às linhas G, V e S.
2. **NFC** — escolha um cartão e encoste no leitor para ver LIBERADO, NEGADO ou BLOQUEADO.
3. **Roleta** — gire e descubra o significado de cada cor do LED RGB.
4. **Caixa dos Sentidos** — tire sensores da caixa e classifique em digital, analógico ou especial.
5. **Memória/offline** — simule o caminho do cartão até o painel web e ligue “Internet caiu”.

Os estados do passaporte e do checklist ficam no navegador (`localStorage`). Para zerar, use os botões “Recomeçar”/“Limpar marcações” ou apague as chaves `feira:v1:*` nas ferramentas do navegador.

### Kit ao vivo na feira

A decisão registrada no site é:

- **Estação 2 — “O Toque Mágico”:** recebe o **ESP32-S3 + PN532 reais**. É a estação cujo tema é o NFC e onde o visitante encosta uma tag de verdade e vê o LED reagir.
- **Estação 5 — “A Memória que Não Esquece”:** recebe apenas um **tablet/notebook** acessando o painel web do **mesmo ESP32**, pela rede local. Não é necessário um segundo kit.

Cuidados de montagem:

- PN532 em I2C, **3,3 V**, **SDA no IO8**, **SCL no IO9** e chaves **1 ON / 2 OFF**.
- Tags comuns têm **UID fixo**. Leia o UID real de cada tag, cadastre no painel e atualize as etiquetas dos cartões de papel; não conte com “gravar” o UID do exemplo.
- Para o painel na Estação 5, use o IP mostrado no Monitor Serial ou `http://nfc.local/`. O painel tem login; mantenha a sessão autenticada no tablet.
- O painel é local: com o roteador ligado e sem internet externa, ele continua funcionando. O modo AP do ESP32 (`ControleAcesso-S3`) também serve.
- **Plano B:** sem tablet ou rede, a Estação 5 fica com o varal de papel e o kit permanece na Estação 2.
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
│   ├── art.js               # ilustrações SVG (capa, planta, cenas, roleta, pinos)
│   ├── interactions.js      # as 5 demos
│   └── app.js               # renderização, deck, checklist, passaporte, navegação
├── assets/favicon.svg
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
- `estacoes`: textos das 5 equipes, listas de “Para o visitante”, “Como montar”, materiais e dica.
- `materiais.prioritarios`: os 20 itens do Material novo (nome, quantidade, uso).
- `materiais.extras`: os 13 itens complementares do Material Sugestão.
- `sensores`: os 37 sensores (nome, categoria, tipo, descrição, ideia e ligação).
- `cartoes`, `roleta`, `linhaDoTempo`, `pinos`, `quizGvs`: dados das demos.

Depois de editar, recarregue a página. Não é preciso compilar.

### Regra de prioridade dos materiais

- **Quantidade e nome** valem os do **Material novo** (PDF).
- **Como usar** vem do **Material Sugestão** (DOCX).
- Itens do DOCX que não estão no PDF aparecem como **complementares/opcionais**, com aviso quando a mecânica depende deles (papelão, velcro, sacos zip, pregadores).

### Observações de fidelidade

- “Guaxe” foi normalizado para **guache**; “Papel Metro Marrom” para **papel kraft marrom**; “Papel cartão vermelha/amarela” para **vermelho/amarelo**.
- O PDF pede celofane **verde, vermelho e azul**; ciano pode ser obtido sobrepondo azul + verde.
- Os cartões NFC usam os UIDs do material (`2C:9D:7E:8E`, `AB:12:34:56`); o terceiro cartão (bloqueado) é **ilustrativo**.
- A roleta usa as 6 cores do DOCX; o site diferencia **estados reais do firmware** de **demonstrações de cor** (laranja ≈ falha do PN532; roxo = mistura RGB).
- As ilustrações são desenhos SVG de referência, não fotos dos materiais.

---

## Testes

Os testes usam o Node.js (não são necessários para abrir o site):

```bash
node tests/run-tests.js
node tests/run-e2e.js
```

- `run-tests.js`: valida dados (5 estações, 37 sensores, 20 + 13 materiais, cartões, roleta), regras puras, referências de arquivos, ausência de URLs externas, contraste WCAG e sintaxe dos JS.
- `run-e2e.js`: sobe um servidor local próprio, abre o Chrome headless via CDP e testa os fluxos principais (NFC, roleta, caixa, offline, checklist persistente, passaporte/certificado), além de gerar screenshots e PDFs de impressão em `tests/artifacts/`.
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
- Resultados anunciados com `aria-live`; botões com rótulos claros.
- `prefers-reduced-motion`: animações e giros são reduzidos/instantâneos.
- Tema escuro (padrão) e claro, com preferência salva.
- Sem requisições externas, sem cookies, sem rastreamento.
- Impressão dedicada para lista de materiais, planta e certificado.

---

## Créditos e fontes

- **Projeto ProSUB · Thauan** (conforme o Material novo).
- Roteiro e mecânicas: `Material Sugestão.docx`.
- Lista prioritária: `Material novo.pdf`.
- Dados técnicos: `MANUAL_DO_SISTEMA.md`, `GUIA_DE_PINOS_E_EXPANSAO.md` e `GUIA_37_SENSORES_ESP32.md` (pasta `esp32s3-nfc-acesso`).

Site feito para a feira de exposição da escola. Sinta-se livre para adaptar textos, cores e quantidades em `js/data.js`.
