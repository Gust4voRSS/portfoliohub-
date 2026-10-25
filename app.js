// PortfolioHUB — lê os projetos do GitHub e mostra na página.
// Não usa nenhuma senha ou token: só a API PÚBLICA do GitHub.
"use strict";

const API = "https://api.github.com";
const CACHE_MINUTOS = 10; // evita estourar o limite de 60 consultas/hora da API pública

// Estado da página
let config = null;
let repositorios = [];

// ---------- Utilidades ----------

// Transforma texto em texto "inofensivo" antes de pôr na página (evita XSS)
function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Só aceita links http/https (bloqueia "javascript:" e afins)
function linkSeguro(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
  } catch {
    return "";
  }
}

function dataBR(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// Guarda respostas da API por alguns minutos no navegador
function lerCache(chave) {
  try {
    const bruto = sessionStorage.getItem(chave);
    if (!bruto) return null;
    const { quando, dados } = JSON.parse(bruto);
    return Date.now() - quando < CACHE_MINUTOS * 60000 ? dados : null;
  } catch {
    return null;
  }
}

function gravarCache(chave, dados) {
  try {
    sessionStorage.setItem(chave, JSON.stringify({ quando: Date.now(), dados }));
  } catch {
    /* navegador sem armazenamento: segue sem cache */
  }
}

async function buscarJSON(url, usarCache = true) {
  if (usarCache) {
    const salvo = lerCache(url);
    if (salvo) return salvo;
  }
  const resposta = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (resposta.status === 403 || resposta.status === 429) {
    throw new Error("limite");
  }
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  const dados = await resposta.json();
  if (usarCache) gravarCache(url, dados);
  return dados;
}

// ---------- Perfil ----------

async function carregarPerfil() {
  try {
    const perfil = await buscarJSON(`${API}/users/${config.usuario_github}`);
    const avatar = document.getElementById("avatar");
    const src = linkSeguro(perfil.avatar_url);
    if (src) {
      avatar.src = src;
      avatar.hidden = false;
    }
    if (perfil.bio) document.getElementById("bio").textContent = perfil.bio;
  } catch {
    /* sem perfil: a página continua com o texto padrão */
  }
}

// ---------- Destaque ----------

function mostrarDestaque() {
  const d = config.destaque;
  const area = document.getElementById("destaque");
  const links = [
    ["Abrir o site", d.links.site],
    ["Ver o código", d.links.codigo],
    ["Imagem Docker", d.links.docker],
  ]
    .filter(([, url]) => linkSeguro(url))
    .map(([rotulo, url], i) =>
      `<a class="botao${i === 0 ? " principal" : ""}" href="${escapar(linkSeguro(url))}" target="_blank" rel="noopener noreferrer">${escapar(rotulo)}</a>`)
    .join("");

  area.innerHTML = `
    <div class="destaque-texto">
      <h3>${escapar(d.nome)}</h3>
      <p>${escapar(d.descricao)}</p>
      <ul class="etiquetas">${d.tecnologias.map((t) => `<li>${escapar(t)}</li>`).join("")}</ul>
    </div>
    <div class="destaque-acoes">${links}</div>`;
}

// ---------- Lista de projetos ----------

async function carregarProjetos() {
  const origem = document.getElementById("origem-dados");
  try {
    const dados = await buscarJSON(`${API}/users/${config.usuario_github}/repos?per_page=100&sort=updated`);
    repositorios = dados.filter((r) => !r.fork && !config.ocultar.includes(r.name));
    origem.textContent = "Dados ao vivo do GitHub";
    preencherLinguagens();
    desenharLista();
  } catch (erro) {
    const msg = erro.message === "limite"
      ? "O GitHub limitou as consultas por alguns minutos. Recarregue a página daqui a pouco."
      : "Não foi possível falar com o GitHub agora. Verifique sua conexão e tente de novo.";
    document.getElementById("lista").innerHTML = `
      <p class="erro">${escapar(msg)}</p>
      <p><a class="botao" href="https://github.com/${escapar(config.usuario_github)}?tab=repositories" target="_blank" rel="noopener noreferrer">Ver os projetos direto no GitHub</a></p>`;
    origem.textContent = "";
  }
}

function preencherLinguagens() {
  const select = document.getElementById("linguagem");
  const linguagens = [...new Set(repositorios.map((r) => r.language).filter(Boolean))].sort();
  select.innerHTML = `<option value="">Todas</option>` +
    linguagens.map((l) => `<option value="${escapar(l)}">${escapar(l)}</option>`).join("");
}

function desenharLista() {
  const termo = document.getElementById("busca").value.trim().toLowerCase();
  const linguagem = document.getElementById("linguagem").value;
  const ordem = document.getElementById("ordem").value;

  let lista = repositorios.filter((r) => {
    const texto = `${r.name} ${r.description ?? ""} ${(r.topics ?? []).join(" ")}`.toLowerCase();
    return (!termo || texto.includes(termo)) && (!linguagem || r.language === linguagem);
  });

  if (ordem === "nome") lista.sort((a, b) => a.name.localeCompare(b.name));
  else if (ordem === "estrelas") lista.sort((a, b) => b.stargazers_count - a.stargazers_count);
  else lista.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  document.getElementById("total").textContent = lista.length;
  const area = document.getElementById("lista");

  if (!lista.length) {
    area.innerHTML = `<p class="vazio">Nenhum projeto encontrado com esses filtros.</p>`;
    return;
  }

  area.innerHTML = lista.map((r) => {
    const site = linkSeguro(r.homepage) ||
      (r.has_pages ? `https://${config.usuario_github}.github.io/${r.name}/` : "");
    return `
      <article class="cartao">
        <h3>${escapar(r.name)}</h3>
        <p class="descricao">${escapar(r.description || "Sem descrição.")}</p>
        <ul class="meta">
          ${r.language ? `<li class="lang">${escapar(r.language)}</li>` : ""}
          <li title="Estrelas">★ ${Number(r.stargazers_count) || 0}</li>
          <li>Atualizado em ${escapar(dataBR(r.pushed_at))}</li>
        </ul>
        <div class="acoes">
          <a href="${escapar(linkSeguro(r.html_url))}" target="_blank" rel="noopener noreferrer">Código</a>
          ${site ? `<a href="${escapar(site)}" target="_blank" rel="noopener noreferrer">Site</a>` : ""}
        </div>
      </article>`;
  }).join("");
}

// ---------- Última versão publicada do próprio HUB ----------

async function carregarVersao() {
  const alvo = document.getElementById("versao");
  try {
    const commits = await buscarJSON(
      `${API}/repos/${config.usuario_github}/${config.repositorio_hub}/commits?per_page=1`);
    const c = commits[0];
    const codigo = c.sha.slice(0, 7);
    alvo.innerHTML = `Versão no ar: <a href="${escapar(linkSeguro(c.html_url))}" target="_blank" rel="noopener noreferrer"><code>${escapar(codigo)}</code></a> — “${escapar(c.commit.message.split("\n")[0])}” em ${escapar(dataBR(c.commit.author.date))}`;
  } catch {
    alvo.textContent = "Histórico de versões disponível no repositório do GitHub.";
  }
}

// ---------- Início ----------

async function iniciar() {
  try {
    const resposta = await fetch("projetos.json", { cache: "no-cache" });
    config = await resposta.json();
  } catch {
    document.getElementById("destaque").innerHTML =
      `<p class="erro">Não consegui ler a configuração do portfólio (projetos.json).</p>`;
    return;
  }

  const repoHub = `https://github.com/${config.usuario_github}/${config.repositorio_hub}`;
  document.getElementById("link-repo").href = repoHub;
  document.getElementById("link-repo").textContent = repoHub.replace("https://", "");
  document.getElementById("link-github").href = `https://github.com/${config.usuario_github}`;

  mostrarDestaque();
  ["busca", "linguagem", "ordem"].forEach((id) =>
    document.getElementById(id).addEventListener("input", desenharLista));

  await Promise.all([carregarPerfil(), carregarProjetos(), carregarVersao()]);
}

iniciar();
