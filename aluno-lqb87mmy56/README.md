# Área do Aluno (app estático)

PWA sem backend: HTML + CSS + JS puros, guiado por `data/catalogo.js` (começa com `window.CATALOGO = {`). Abre no celular e no PC, dá pra "instalar" na tela inicial.

## Como testar local
```
cd aluno-lqb87mmy56
python -m http.server 8791   (ou abra o index.html direto, também funciona)
```
Abra http://127.0.0.1:8791/?k=TROCAR-PREMIUM (ou `TROCAR-BASICO`).

## Estrutura
- `data/catalogo.js` (começa com `window.CATALOGO = {`): marca, códigos de acesso, produtos, módulos, aulas, apostilas e bônus.
- `conteudo/apostilas/` e `conteudo/bonus/`: os PDFs.
- `assets/`: capas e ícone.

## Acesso
Cada compra recebe um código (campo `acessos`). O link do e-mail da Cakto pode já levar o código: `https://SEU-SITE/?k=CODIGO`.
Limite honesto: como o app é estático, os códigos ficam visíveis no `catalogo.js`; quem tiver o código entra, e um código é compartilhável. Para código individual por comprador é preciso um backend (função + webhook da Cakto).

## Adicionar um produto novo
1. Copie um item de `produtos` e troque `id`, `titulo`, `capa`, `modulos`, `apostilas`, `bonus`.
2. Em `acessos`, crie os códigos: `{ "codigo": "XXXX", "produto": "id-do-produto", "nivel": "basico|premium" }`.
3. `inclui` define o que cada nível libera (`aulas`, `apostilas`, `bonus`, `certificado`).

## Aulas
`video: { "tipo": "youtube", "id": "ID_DE_11_CARACTERES" }` (também aceita `vimeo`, `mp4` e `url` de iframe). A marcação de aulas concluídas e o "continuar de onde parou" ficam salvos no aparelho do aluno.
