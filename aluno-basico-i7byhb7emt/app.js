/* Área do Aluno: app estático guiado por data/catalogo.json (PWA, sem backend).
   Para adicionar um produto novo: edite data/catalogo.json (veja README.md). */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var CAT = null;
  var K_ACESSO = "aluno_acesso", K_PROG = "aluno_prog", K_NOME = "aluno_nome", K_LAST = "aluno_ultima";

  /* ---------- utilidades ---------- */
  function store(k, v) {
    try {
      if (v === undefined) { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; }
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) { return String(s || "").trim().toUpperCase(); }
  function prod(id) { return (CAT.produtos || []).filter(function (p) { return p.id === id; })[0]; }
  function liberado(p, secao, nivel) { return !!(p.inclui && p.inclui[secao] && p.inclui[secao].indexOf(nivel) > -1); }
  function aulasDe(p) {
    var out = [];
    (p.modulos || []).forEach(function (m) { (m.aulas || []).forEach(function (a) { out.push({ m: m, a: a }); }); });
    return out;
  }
  function temVideo(a) { return a.video && (a.video.url || (a.video.tipo && a.video.id)); }
  function progresso(p) {
    var prog = store(K_PROG) || {}, todas = aulasDe(p).filter(function (x) { return temVideo(x.a); });
    var feitas = todas.filter(function (x) { return prog[x.a.id]; }).length;
    return { feitas: feitas, total: todas.length, pct: todas.length ? Math.round(100 * feitas / todas.length) : 0 };
  }

  /* ---------- acesso ---------- */
  function acessoPorCodigo(cod) {
    cod = norm(cod);
    var a = (CAT.acessos || []).filter(function (x) { return norm(x.codigo) === cod; })[0];
    return a ? { codigo: a.codigo, produto: a.produto, nivel: a.nivel } : null;
  }
  function acessoAtual() {
    var s = store(K_ACESSO), a = s ? acessoPorCodigo(s.codigo) : null; /* revalida contra o catálogo atual */
    if (a) return a;
    var d = CAT.padrao; /* sem código: abre direto no nível padrão (sem tela de login) */
    return d ? { codigo: "", produto: d.produto, nivel: d.nivel } : null;
  }
  function lerChaveDaURL() {
    var m = /[?&]k=([^&#]+)/.exec(location.search);
    if (!m) return null;
    var cod = decodeURIComponent(m[1]);
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    return cod;
  }

  /* ---------- telas ---------- */
  function telaAcesso(erro) {
    app.innerHTML =
      '<div class="gate"><form class="box" id="fAcesso" autocomplete="off">' +
      '<h1>' + esc(CAT.marca.nome) + '</h1>' +
      '<p>Digite o código de acesso que chegou no seu e-mail depois da compra.</p>' +
      (erro ? '<div class="err">' + esc(erro) + "</div>" : "") +
      '<input class="field" name="cod" placeholder="Seu código de acesso" autocapitalize="characters" required>' +
      '<button class="btn block" type="submit">Entrar</button>' +
      (CAT.marca.suporte ? '<div class="help">Não achou o e-mail? Olhe a caixa de spam ou fale com ' + esc(CAT.marca.suporte) + ".</div>" : "") +
      "</form></div>";
    document.getElementById("fAcesso").addEventListener("submit", function (e) {
      e.preventDefault();
      var a = acessoPorCodigo(e.target.cod.value);
      if (!a) { telaAcesso("Código não encontrado. Confira e tente de novo."); return; }
      store(K_ACESSO, { codigo: a.codigo });
      location.hash = "#/";
      rota();
    });
  }

  function topo(acesso, titulo, sub) {
    return '<header class="top"><div class="wrap">' +
      '<div class="row"><div class="brand">' + esc(CAT.marca.nome) + "<small>" + esc(CAT.marca.assinatura) + "</small></div>" +
      '<div><span class="chip ' + (acesso.nivel === "premium" ? "sol" : "") + '">' + (acesso.nivel === "premium" ? "★ Premium" : "Básico") + "</span> " +
      "</div></div>" +
      (titulo ? "<h1>" + titulo + "</h1>" : "") + (sub ? "<p>" + sub + "</p>" : "") +
      "</div></header>";
  }
  function ligarSair() {
    var b = document.getElementById("sair");
    if (b) b.addEventListener("click", function () { store(K_ACESSO, null); location.hash = "#/"; rota(); });
  }

  function telaHome(acesso) {
    var p = prod(acesso.produto);
    if (!p) { telaAcesso("Produto deste código não encontrado."); return; }
    var pr = progresso(p), capa = (p.capa && (p.capa[acesso.nivel] || p.capa.basico)) || "";
    var html = topo(acesso, "Olá, bem-vindo!", "Seus produtos estão aqui. É só continuar de onde parou.") +
      '<main class="wrap"><div class="stack">' +
      '<a class="card pcard" href="#/p/' + esc(p.id) + '/aulas">' +
      '<div class="cap">' + (capa ? '<img src="' + esc(capa) + '" alt="">' : "") + "</div>" +
      '<div class="bd"><h2>' + esc(p.titulo) + "</h2><p>" + esc(p.subtitulo) + "</p>" +
      '<div class="bar"><i style="width:' + pr.pct + '%"></i></div>' +
      '<div class="pct"><span>' + pr.feitas + " de " + pr.total + " aulas</span><span>" + pr.pct + "%</span></div></div></a>";
    var ult = store(K_LAST), todas = aulasDe(p), alvo = null;
    if (ult && ult.produto === p.id) todas.forEach(function (x) { if (x.a.id === ult.aula) alvo = x; });
    if (!alvo) alvo = todas[0];
    if (alvo) {
      html += '<a class="card cont" href="#/p/' + esc(p.id) + "/aulas/" + esc(alvo.a.id) + '"><span class="pl2">▶</span><span><small>' +
        (ult ? "Continuar de onde parou" : "Começar agora") + "</small><b>" + esc(alvo.a.titulo) + "</b></span></a>";
    }
    if (acesso.nivel !== "premium" && CAT.upgrade) {
      html += '<div class="card upsell"><h3>' + esc(CAT.upgrade.texto) + "</h3>" +
        "<p>" + esc(CAT.upgrade.descricao || "Faça o upgrade para o Premium e destrave o certificado e os 10 bônus.") + "</p>" +
        '<a class="btn" href="' + esc(CAT.upgrade.url) + '" target="_blank" rel="noopener">' + esc(CAT.upgrade.botao || "Quero o Premium") + "</a></div>";
    }
    html += "</div></main>" + (CAT.marca.suporte ? '<div class="foot">Suporte: ' + esc(CAT.marca.suporte) + "</div>" : "");
    app.innerHTML = html;
    ligarSair();
  }

  var ABAS = [["aulas", "Aulas"], ["apostilas", "Apostilas"], ["bonus", "Bônus"], ["certificado", "Certificado"]];

  function telaProduto(acesso, id, aba, abrir) {
    var p = prod(id);
    if (!p || p.id !== acesso.produto) { location.hash = "#/"; return; }
    aba = aba || "aulas";
    var capa = (p.capa && (p.capa[acesso.nivel] || p.capa.basico)) || "";
    var tabs = ABAS.map(function (t) {
      return '<a class="tab ' + (t[0] === aba ? "on" : "") + '" href="#/p/' + esc(p.id) + "/" + t[0] + '">' + t[1] + "</a>";
    }).join("");
    var html = '<div class="hero"><a class="back" href="#/">← Início</a><div class="cap">' + (capa ? '<img src="' + esc(capa) + '" alt="">' : "") + "</div></div>" +
      '<div class="wrap ptitle"><h1>' + esc(p.titulo) + "</h1><p>" + esc(p.subtitulo) + "</p></div>" +
      '<nav class="tabs"><div class="wrap">' + tabs + "</div></nav>" +
      '<main class="wrap pane">' + painel(p, acesso, aba) + "</main>";
    app.innerHTML = html;
    window.scrollTo(0, 0);
    if (aba === "certificado") ligarCertificado(p, acesso);
    if (aba === "aulas" && abrir) abrirAulaInline(abrir, true);
  }

  function painel(p, acesso, aba) {
    if (aba === "aulas") return painelAulas(p);
    if (aba === "apostilas") return painelApostilas(p, acesso);
    if (aba === "bonus") return painelBonus(p, acesso);
    return painelCertificado(p, acesso);
  }

  var ICO_PLAY = "M8 5v14l11-7z", ICO_OK = "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z";

  function painelAulas(p) {
    var prog = store(K_PROG) || {};
    return (p.modulos || []).map(function (m, i) {
      var aulas = m.aulas || [], feitas = aulas.filter(function (a) { return prog[a.id]; }).length;
      return '<details class="mod" data-m="' + esc(m.id) + '"' + (i === 0 ? " open" : "") + "><summary>" + esc(m.titulo) +
        '<small class="cnt">' + feitas + " de " + aulas.length + " aulas</small></summary>" +
        aulas.map(function (a) {
          var on = temVideo(a);
          return '<div class="aulawrap" data-a="' + esc(a.id) + '"><button type="button" class="aula ' + (prog[a.id] ? "feita" : "") + (on ? "" : " off") + '" data-toggle="' + esc(a.id) + '" aria-expanded="false">' +
            '<span class="pl"><svg viewBox="0 0 24 24"><path d="' + (prog[a.id] ? ICO_OK : ICO_PLAY) + '"/></svg></span>' +
            "<span><b>" + esc(a.titulo) + "</b><small>" + (on ? esc(a.duracao || "Videoaula") : "Em breve") + '</small></span><span class="chev" aria-hidden="true">▾</span></button>' +
            '<div class="aulabody" hidden></div></div>';
        }).join("") + "</details>";
    }).join("");
  }

  function achaAula(aid) {
    var p = prod((acessoAtual() || {}).produto), r = null;
    if (p) aulasDe(p).forEach(function (x) { if (x.a.id === aid) r = { p: p, m: x.m, a: x.a }; });
    return r;
  }

  function abrirAulaInline(aid, rolar) {
    var wrap = app.querySelector('.aulawrap[data-a="' + aid + '"]');
    var info = achaAula(aid);
    if (!wrap || !info || !temVideo(info.a)) return;
    var det = wrap.closest("details"); if (det) det.open = true;
    var btn = wrap.querySelector(".aula"), body = wrap.querySelector(".aulabody");
    if (!body.hidden) return;
    var prog = store(K_PROG) || {}, v = info.a.video;
    var yt = v && v.tipo === "youtube" ? "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id) : "";
    body.innerHTML = '<div class="player"><button type="button" class="facade" data-play="' + esc(aid) + '" aria-label="Assistir: ' + esc(info.a.titulo) + '"><span class="fplay">▶</span><span class="ftit">' + esc(info.a.titulo) + "</span></button></div>" +
      '<div class="abtns"><button type="button" class="btn small ' + (prog[aid] ? "ghost" : "") + '" data-feita="' + esc(aid) + '">' + (prog[aid] ? "✓ Concluída (desmarcar)" : "Marcar como concluída") + "</button>" +
      "</div>";
    body.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    store(K_LAST, { produto: info.p.id, aula: aid });
    if (rolar) setTimeout(function () { wrap.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
  }

  function fecharAulaInline(aid) {
    var wrap = app.querySelector('.aulawrap[data-a="' + aid + '"]');
    if (!wrap) return;
    var body = wrap.querySelector(".aulabody");
    body.hidden = true; body.innerHTML = ""; /* remove o iframe: para o vídeo e libera memória */
    wrap.querySelector(".aula").setAttribute("aria-expanded", "false");
  }

  function alternarConcluida(aid) {
    var pg = store(K_PROG) || {};
    if (pg[aid]) delete pg[aid]; else pg[aid] = true;
    store(K_PROG, pg);
    var wrap = app.querySelector('.aulawrap[data-a="' + aid + '"]'); if (!wrap) return;
    var on = !!pg[aid], row = wrap.querySelector(".aula"), b = wrap.querySelector("[data-feita]");
    row.classList.toggle("feita", on);
    row.querySelector("path").setAttribute("d", on ? ICO_OK : ICO_PLAY);
    if (b) { b.textContent = on ? "✓ Concluída (desmarcar)" : "Marcar como concluída"; b.classList.toggle("ghost", on); }
    var det = wrap.closest("details"), n = det.querySelectorAll(".aulawrap").length;
    var f = [].filter.call(det.querySelectorAll(".aulawrap"), function (w) { return pg[w.getAttribute("data-a")]; }).length;
    det.querySelector(".cnt").textContent = f + " de " + n + " aulas";
  }

  app.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-toggle],[data-feita],[data-play]");
    if (!t) return;
    if (t.hasAttribute("data-play")) {
      var inf = achaAula(t.getAttribute("data-play"));
      if (inf) t.parentNode.innerHTML = embed(inf.a.video, true);
      return;
    }
    if (t.hasAttribute("data-feita")) { alternarConcluida(t.getAttribute("data-feita")); return; }
    var aid = t.getAttribute("data-toggle");
    if (t.getAttribute("aria-expanded") === "true") fecharAulaInline(aid); else abrirAulaInline(aid, true);
  });

  function painelApostilas(p, acesso) {
    var libera = liberado(p, "apostilas", acesso.nivel);
    var lista = (p.apostilas || []).map(function (a) {
      var tem = !!a.arquivo && libera;
      return '<div class="item">' + (a.capa ? '<img class="th" src="' + esc(a.capa) + '" alt="" loading="lazy">' : '<div class="ico">📄</div>') +
        '<div class="tx"><b>' + esc(a.titulo) + "</b><small>" + esc(a.descricao || (tem ? "PDF para baixar" : "Em breve")) + "</small></div>" +
        (tem ? '<a class="btn small" href="' + esc(a.arquivo) + '" target="_blank" rel="noopener">Abrir</a>' : "") + "</div>";
    }).join("");
    if (libera) return lista;
    return '<div class="card upsell"><h3>Apostila completa do curso</h3><p>A apostila faz parte do Premium. Libere agora com o upgrade.</p>' +
      '<a class="btn" href="' + esc(CAT.upgrade.url) + '" target="_blank" rel="noopener">' + esc(CAT.upgrade.botao || "Quero o Premium") + "</a></div>" + lista;
  }

  function painelBonus(p, acesso) {
    var ok = liberado(p, "bonus", acesso.nivel);
    var grid = '<div class="bgrid">' + (p.bonus || []).map(function (b) {
      var num = ("0" + b.n).slice(-2);
      return '<div class="bk ' + (ok ? "" : "locked") + '"><div class="cv"><span class="nb">BÔNUS ' + num + "</span>" +
        (b.capa ? '<img src="' + esc(b.capa) + '" alt="' + esc(b.titulo) + '" loading="lazy">' : '<div class="nc"><b>' + esc(b.titulo) + "</b></div>") + "</div>" +
        "<p><b>" + esc(b.titulo) + "</b><br>" + esc(b.descricao) + "</p>" +
        (ok && b.arquivo ? '<a class="btn small block" href="' + esc(b.arquivo) + '" target="_blank" rel="noopener">Abrir</a>' : "") +
        (ok && !b.arquivo ? '<small style="color:var(--ink2)">Em breve</small>' : "") + "</div>";
    }).join("") + "</div>";
    if (ok) return grid;
    return '<div class="card upsell"><h3>Bônus exclusivos do Premium</h3><p>Os 10 bônus fazem parte do Premium. Libere agora com o upgrade.</p>' +
      '<a class="btn" href="' + esc(CAT.upgrade.url) + '" target="_blank" rel="noopener">' + esc(CAT.upgrade.botao || "Quero o Premium") + '</a></div><div class="lockbox">' + grid + "</div>";
  }

  function painelCertificado(p, acesso) {
    if (!liberado(p, "certificado", acesso.nivel)) {
      return '<div class="card upsell"><h3>Certificado de conclusão</h3><p>O certificado faz parte do plano Premium.</p>' +
        '<a class="btn" href="' + esc(CAT.upgrade.url) + '" target="_blank" rel="noopener">' + esc(CAT.upgrade.botao || "Quero o Premium") + '</a></div>';
    }
    var pr = progresso(p), pronto = pr.total > 0 && pr.pct === 100;
    return '<div class="certbox"><h3>Seu certificado</h3>' +
      '<p style="color:var(--ink2);margin-top:6px;font-size:14px">Ele é liberado quando você assistir todas as aulas.</p>' +
      '<div class="bar"><i style="width:' + pr.pct + '%"></i></div>' +
      '<div class="pct"><span>' + pr.feitas + " de " + pr.total + " aulas</span><span>" + pr.pct + "%</span></div>" +
      '<input class="field" id="nomeCert" placeholder="Seu nome completo" value="' + esc(store(K_NOME) || "") + '" style="margin-top:14px"' + (pronto ? "" : " disabled") + ">" +
      '<button class="btn block" id="gerarCert"' + (pronto ? "" : " disabled") + ">Gerar certificado</button></div>";
  }

  function ligarCertificado(p, acesso) {
    var b = document.getElementById("gerarCert");
    if (!b || b.disabled) return;
    b.addEventListener("click", function () {
      var nome = document.getElementById("nomeCert").value.trim();
      if (!nome) { document.getElementById("nomeCert").focus(); return; }
      store(K_NOME, nome);
      var data = new Date().toLocaleDateString("pt-BR");
      var doc = '<div class="certdoc"><div class="k">CERTIFICADO DE CONCLUSÃO</div><h2>' + esc(p.titulo) + "</h2>" +
        "<p>Certificamos que</p><div class=\"nm\">" + esc(nome) + "</div>" +
        "<p>concluiu todas as videoaulas desta formação.</p><div class=\"ft\">" + esc(CAT.marca.nome) + " · " + data + "</div></div>";
      document.getElementById("cert-print").innerHTML = doc;
      var ov = document.createElement("div");
      ov.className = "certview";
      ov.innerHTML = '<div><div class="sheet">' + doc + '</div><div class="row"><button class="btn" id="cImp">Imprimir / salvar PDF</button><button class="btn ghost" id="cFechar">Fechar</button></div></div>';
      document.body.appendChild(ov);
      document.getElementById("cImp").addEventListener("click", function () { window.print(); });
      document.getElementById("cFechar").addEventListener("click", function () { ov.remove(); });
    });
  }

  function embed(v, auto) {
    if (!v) return "";
    if (v.url) return '<iframe src="' + esc(v.url) + '" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    if (v.tipo === "youtube") return '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.id) + '?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&color=white&cc_load_policy=0' + (auto ? '&autoplay=1' : '') + '" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    if (v.tipo === "vimeo") return '<iframe src="https://player.vimeo.com/video/' + esc(v.id) + '" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    if (v.tipo === "mp4") return '<video controls playsinline preload="metadata" src="' + esc(v.id) + '"></video>';
    return "";
  }

  function telaAula(acesso, pid, aid) {
    var p = prod(pid);
    if (!p || p.id !== acesso.produto) { location.hash = "#/"; return; }
    var lista = aulasDe(p), idx = -1;
    lista.forEach(function (x, i) { if (x.a.id === aid) idx = i; });
    if (idx < 0) { location.hash = "#/p/" + pid + "/aulas"; return; }
    var cur = lista[idx], a = cur.a, prog = store(K_PROG) || {};
    var prev = lista[idx - 1], next = lista[idx + 1];
    store(K_LAST, { produto: pid, aula: aid });
    var yt = a.video && a.video.tipo === "youtube" ? "https://www.youtube.com/watch?v=" + encodeURIComponent(a.video.id) : "";
    app.innerHTML =
      '<div class="hero"><a class="back" href="#/p/' + esc(pid) + '/aulas">← Aulas</a></div>' +
      '<div class="player" style="margin-top:0">' + (temVideo(a) ? embed(a.video) : '<div class="soon"><div><b>Vídeo em breve</b><br><small>Esta aula será liberada em instantes.</small></div></div>') + "</div>" +
      '<main class="wrap lesson"><small style="color:var(--ink2);font-weight:700">' + esc(cur.m.titulo) + " · aula " + (idx + 1) + " de " + lista.length + "</small>" +
      "<h1>" + esc(a.titulo) + "</h1>" + (a.descricao ? "<p>" + esc(a.descricao) + "</p>" : "") +
      (yt ? '<p class="ytlink">O vídeo não abriu? <a href="' + esc(yt) + '" target="_blank" rel="noopener">Assistir no YouTube</a></p>' : "") +
      '<div class="actions"><button class="btn block ' + (prog[a.id] ? "ghost" : "") + '" id="feita">' + (prog[a.id] ? "✓ Aula concluída (desmarcar)" : "Marcar como concluída") + "</button>" +
      '<div class="nav2">' +
      (prev ? '<a class="btn ghost" href="#/aula/' + esc(pid) + "/" + esc(prev.a.id) + '">← Anterior</a>' : "") +
      (next ? '<a class="btn" href="#/aula/' + esc(pid) + "/" + esc(next.a.id) + '">Próxima →</a>' : "") +
      "</div></div></main>";
    window.scrollTo(0, 0);
    document.getElementById("feita").addEventListener("click", function () {
      var pg = store(K_PROG) || {};
      if (pg[a.id]) delete pg[a.id]; else pg[a.id] = true;
      store(K_PROG, pg);
      if (pg[a.id] && next) location.hash = "#/aula/" + pid + "/" + next.a.id; else telaAula(acesso, pid, aid);
    });
  }

  /* ---------- rota ---------- */
  function rota() {
    var acesso = acessoAtual();
    if (!acesso) { telaAcesso(); return; }
    var h = (location.hash || "#/").replace(/^#\/?/, "").split("/");
    if (h[0] === "p" && h[1]) telaProduto(acesso, h[1], h[2], h[3]);
    else if (h[0] === "aula" && h[1] && h[2]) location.replace("#/p/" + h[1] + "/aulas/" + h[2]);
    else telaHome(acesso);
  }

  /* ---------- início ---------- */
  /* o catálogo vem de data/catalogo.js (window.CATALOGO), que funciona até abrindo o index.html direto do computador */
  if (!window.CATALOGO) {
    app.innerHTML = '<div class="loading">Não foi possível carregar o conteúdo. Tente de novo em instantes.</div>';
  } else {
    CAT = window.CATALOGO;
    document.title = CAT.marca.nome;
    var k = lerChaveDaURL();
    if (k) { var a = acessoPorCodigo(k); if (a) store(K_ACESSO, { codigo: a.codigo }); }
    window.addEventListener("hashchange", rota);
    rota();
  }

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
