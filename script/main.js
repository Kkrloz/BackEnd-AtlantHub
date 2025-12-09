import { productsAPI } from "../api.js";

// Fallback de exemplo caso a busca no Supabase falhe
const exemploProdutos = [
  {
    id: 1,
    nome: "Empilhadeira Elétrica 2,5t",
    categoria: "Equipamentos-e-tecnologia",
    preco: 7999,
    imagem:
      "https://armac.com.br/wordpress/wp-content/uploads/2022/06/armac-empilhadeira-eletrica-toyota-btreflex-blog.jpg",
    descricao: "Equipamento para movimentação e armazenamento de cargas.",
  },
];

let produtos = [];

const containerProdutos = document.querySelector(".produtos-div");
const inputPesquisa = document.querySelector(".input-pesquisa");
let textoInput = "";
const todosBotoes = document.querySelectorAll(".botao-categorias");
let categoria = "todos";

function normalizeProduct(p) {
  return {
    id: p.id || p.id_product || p.product_id || null,
    nome: p.nome || p.name || p.title || "Produto",
    categoria: p.categoria || p.category || "",
    preco: p.preco || p.price || 0,
    imagem: p.imagem || p.image || p.photo || "",
    descricao: p.descricao || p.description || p.summary || "",
  };
}

function mostrarProdutos() {
  let htmlProdutos = "";

  produtos.forEach((raw) => {
    const prd = normalizeProduct(raw);
    if (!prd.nome.toLowerCase().includes(textoInput)) return;
    if (prd.categoria !== categoria && categoria !== "todos") return;

    htmlProdutos += `
      <div class="cartao-produto">
        <img src="${prd.imagem}" alt="" class="imagem-produto">
        <div class="info-produto">
            <h3 class="nome-produto">${prd.nome}</h3>
            <p class="descricao-produto">${prd.descricao}</p>
            <p class="preco-produto">R$${prd.preco},00</p>
            <button class="botao-produto">Ver Detalhes</button>
        </div>
      </div>
    `;
  });

  containerProdutos.innerHTML = htmlProdutos || "<p>Nenhum produto encontrado.</p>";
}

function pesquisar() {
  textoInput = (inputPesquisa.value || "").toLowerCase();
  mostrarProdutos();
}

if (inputPesquisa) inputPesquisa.addEventListener("input", pesquisar);

todosBotoes.forEach((botao) => {
  botao.addEventListener("click", function () {
    categoria = botao.getAttribute("data-categoria");
    todosBotoes.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    mostrarProdutos();
  });
});

const botaoOptions = document.querySelector(".icon-user");
const navOptions = document.querySelector(".options-div");

if (botaoOptions) {
  botaoOptions.addEventListener("click", () => {
    navOptions.classList.add("ativo");
  });
}

document.addEventListener("click", (e) => {
  if (!navOptions || !navOptions.classList.contains("ativo")) return;
  if (e.target === botaoOptions || navOptions.contains(e.target)) return;
  if (navOptions.classList.contains("saindo")) return;
  navOptions.classList.add("saindo");
  navOptions.addEventListener(
    "animationend",
    () => {
      navOptions.classList.remove("saindo", "ativo");
    },
    { once: true }
  );
});

async function carregarProdutos() {
  showLoading();
  try {
    const { data, error } = await productsAPI.getProducts();
    if (error) {
      console.error("Erro ao buscar produtos no Supabase:", error);
      produtos = exemploProdutos;
    } else if (!data || data.length === 0) {
      produtos = exemploProdutos;
    } else {
      produtos = data;
    }
  } catch (err) {
    console.error("Falha ao conectar com API:", err);
    produtos = exemploProdutos;
  }

  hideLoading();
  mostrarProdutos();
}

carregarProdutos();

// --- Loader control ---
function showLoading() {
  if (!containerProdutos) return;
  containerProdutos.innerHTML = `
    <div class="loader-wrap">
      <div class="loader" aria-hidden="true"></div>
    </div>
    <div class="produtos-grid-skeleton">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
  `;
}

function hideLoading() {
  // limpar loader; mostrarProdutos() irá renderizar o conteúdo
  // mantemos função para possíveis animações futuras
}

// --- Teste de fetch (registra no console) ---
async function testarFetch() {
  try {
    const { data, error } = await productsAPI.getProducts({ limit: 1 });
    console.log("testeFetch -> data:", data, "error:", error);
  } catch (err) {
    console.error("testeFetch -> falha:", err);
  }
}

// Executa teste de fetch (ver console)
testarFetch();
