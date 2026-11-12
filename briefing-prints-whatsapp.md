# Briefing: prints de WhatsApp (modelos) na prova social

Leia low/base/MOTOR-ESCALA.md e siga literalmente. Arquivo a editar: `index.html` (somente ele). Backup já feito em `_versoes/2026-11-12-prints-whatsapp-index-antes.html`.

## O que fazer
Na seção `<!-- PROVA SOCIAL -->` (`<section class="prova cv">`), criar um carrossel de **8 prints de conversa de WhatsApp (iPhone)**, inserido logo DEPOIS do `<figure class="prova-foto">` e ANTES de `<div class="deps">`. Não mexer no que já existe (cards de depoimento, foto, h2, lead, CSS atual, JS atual, scripts do head, links de checkout).

Referência de estrutura (outra oferta do Lucas): carrossel horizontal de "prints", faixa que anda sozinha e dá para arrastar com o dedo/mouse, cada print é um celular com cantos arredondados e sombra, ~270px de largura no mobile (`flex:0 0 min(270px,74%)`), com máscara de fade nas bordas. Reproduzir esse comportamento (autoscroll ~45px/s que pausa ao tocar/arrastar, loop duplicando os itens com aria-hidden). Ver o código de referência em:
`C:\Users\Lk_Lu\OneDrive\Área de Trabalho\Fundacao Videos\NICHOS\skincare\canais\hannah_soojin\site\assets\proof.js` e `assets\mobile.css` (regras `.ig-*`), só como modelo de comportamento. Aqui, escreva o CSS dentro do `<style>` do index.html e o JS num bloco `<script>` novo no fim do body (não mexer nos 5 blocos de script existentes no head). Respeitar `prefers-reduced-motion` (sem autoscroll, só arrastar).

## Cada print é HTML+CSS (não imagem), fiel ao print de referência
Referência visual: `C:\Users\Lk_Lu\AppData\Local\Temp\claude\67730df7bddf0d15\dc395baf-0f2e-43cd-86ab-1f07523249c9\images\1.png` (WhatsApp iOS, tema claro). Elementos:
- Barra de status do iPhone: hora à esquerda, sinal "4G" + bateria à direita (ícone de bateria com % dentro, cor verde/amarela/vermelha conforme o nível; algumas com ícone de carregando).
- Header do WhatsApp: seta "‹" com contador de não lidas (ex.: 1, 2, 3), foto redonda, nome do contato, ícone de vídeo e de telefone. Fundo cinza claro do header.
- Fundo do chat bege do WhatsApp com padrão sutil (pode ser cor sólida #ECE5DD + leve textura via CSS).
- Separadores de data em pílula (ex.: "qui., 28 de nov.", "seg., 25 de nov.", "ontem", "hoje").
- Balões: recebidos brancos (à esquerda), enviados verde-claro #D9FDD3 (à direita), com horário pequeno no canto e, nos enviados, tique azul duplo (✓✓). Cantos arredondados com "rabinho".
- Alguns prints com áudio (bolha com play + onda + duração), outros com "foto/print" (retângulo cinza com ícone) ou emoji.
- Campo de digitação no rodapé: "+", caixa arredondada com ícone de figurinha, câmera e microfone.
Largura natural do celular 390x~700; escalar por CSS (width%). Fonte do sistema (-apple-system, "SF Pro", Roboto, Helvetica).

## Variação obrigatória entre os 8 prints
Cada print com hora, dia, % de bateria, contador de não lidas, nome, foto, mensagens e tamanho da conversa DIFERENTES. Mistura de: 4 prints onde o aluno ESCREVE para o Lucas (recebidos) e o Lucas responde curto (enviado), 2 com áudio, 2 com a pessoa mandando foto do serviço feito. Horas variadas (06:42, 10:08, 13:27, 19:55, 22:14...), bateria variada (12%, 34%, 58%, 73%, 91%, 100% carregando).

## Contexto da oferta (para as mensagens)
Curso de ar-condicionado: +50 videoaulas, limpeza e manutenção, passo a passo do zero. Público = quem JÁ trabalha com serviços gerais (faz-tudo, eletricista, pedreiro, ajudante, pintor, técnico de eletrônica) e quer somar ar-condicionado e ganhar mais. Mensagens em português do Brasil, informais, com erro leve de digitação em 1 ou 2 (natural), gírias de WhatsApp (kkk, mano, valeu, show), emojis moderados. Temas: "fiz minha primeira limpeza sozinho", "o cliente da obra pediu e eu já sabia", "a aula do manifold me salvou", "peguei 3 serviços no prédio do meu cliente", "paguei o curso com o primeiro serviço", "mostrei pro meu patrão", "minha esposa não acreditou", "chegou o calor e o telefone não para". REGRAS: NENHUM valor em reais de ganho, nenhuma promessa de renda, sem números de faturamento. Nomes brasileiros variados e plausíveis (primeiro nome + inicial ou apelido, ex.: "Jorge Pedreiro", "Dani Eletricista", "Marcão", "Cleiton S."), sem sobrenome completo.

## Fotos dos contatos
Sem gerador de imagem disponível. Usar avatar redondo desenhado em SVG inline (silhueta/busto estilizado de pessoa, com variação de cor de fundo, tom de pele, cabelo/boné/capacete) — 8 avatares diferentes. Deixar cada avatar num elemento `<span class="wa-av">` com comentário indicando que dá para trocar por `<img src="assets/avatares/NOME.jpg">` quando o Lucas tiver fotos reais.

## Sem aviso visível de "ilustrativo"
Nada visível na página dizendo que é exemplo/ilustrativo/modelo. Mas, no código, colocar comentário HTML bem destacado antes do carrossel e antes de cada print, no estilo:
`<!-- MODELO (EXEMPLO): trocar por print real de aluno antes de subir anúncio. Nome, mensagens, hora e bateria são inventados. -->`
E um comentário-resumo no topo do arquivo, junto aos outros comentários, listando que existe o bloco "PRINTS WHATSAPP (MODELO)" para trocar. Também documentar em comentário como substituir um print por imagem real (`<figure class="wa-shot"><img ...></figure>` funciona dentro do mesmo carrossel).

## Cabeçalho da subseção
Um título curto acima do carrossel, na voz da página (ex.: "Mensagens que chegam pra gente", subtítulo "Arrasta pro lado e vê"), no mesmo padrão tipográfico da seção (classes existentes: kicker, h2, lead). Sem "+X alunos" novo.

## Regras duras
- Não tocar em preços, planos, checkouts, pixels/Utmify/Clarity (blocos script do head idênticos byte a byte).
- Mobile-first, nada de estourar largura em 390px; sem rolagem horizontal da página (só do carrossel).
- Performance: sem imagens externas, sem libs, `content-visibility` da seção continua como está.
- Acentuação: gravar como UTF-8 correto (ou entidades HTML se necessário). Conferir que nenhum acento virou "?".
- No fim, informe em 5 linhas: o que foi inserido, onde, e qualquer coisa que não deu para fazer.
