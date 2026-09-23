# Sentir Arquitetura — site

Site estático de página única para a **Sentir Arquitetura**, estúdio de
arquitetura de interiores biofílica em Niterói (RJ). O foco da marca é o
bem-estar humano: como luz, textura, cor, natureza e circulação afetam corpo,
percepção, comportamento e sistema nervoso.

## Stack e estrutura

- `index.html` — o site inteiro (HTML + CSS + JavaScript, tudo inline). Sem
  framework, sem etapa de build, sem bundler.
- `images/` — todas as imagens (logo, retrato da arquiteta, portfólio, capa do
  livro). Referenciar SEMPRE por caminho relativo: `images/nome.jpeg`.
- Sem dependências externas, exceto Google Fonts (Fraunces + Manrope).

## Regras do projeto

- **Nunca** embutir imagens em base64 dentro do HTML. Isso deixa o arquivo
  enorme e quebra a renderização no iPhone/Safari (no Android funcionava, no
  iOS não). Manter as imagens como arquivos em `images/`.
- Manter o site autossuficiente, leve e rápido no mobile.
- O menu do topo NÃO é fixo: rola junto com a página.
- A logo aparece ampliada e sobreposta à barra do menu, sem alterar a altura da barra.
- Botão redondo "topo" (canto inferior direito) aparece ao rolar e volta ao topo.
- Botão redondo "mapa" (canto inferior esquerdo) abre o mapa sensorial de navegação.
- A "paisagem sonora" começa SEMPRE desligada: nenhum indicador de som deve
  aparecer no carregamento; o player só surge quando o usuário ativa alguma camada.
- Seção "Loja" divulga o livro *Entre o Concreto e o Verde* com botão de compra na Amazon.

## Idioma

- Todo o conteúdo visível, textos e comentários do site em **português (Brasil)**.

## Deploy

- Publicado via **GitHub Pages**.
- Site estático: preferir "Deploy from a branch" (raiz), sem necessidade de
  GitHub Actions. `index.html` deve estar na raiz da branch publicada, com a
  pasta `images/` ao lado.
- Testar localmente com um servidor (`python -m http.server`), nunca abrindo o
  `index.html` direto por `file://` (as imagens e o formulário não funcionam assim).

## Ao trabalhar neste projeto

- Antes de editar, entender que tudo vive em um único `index.html`; mudanças de
  CSS/JS são feitas nos blocos `<style>` e `<script>` inline.
- Preservar a identidade visual: paleta quente/terrosa com verde-sage, tipografia
  serifada (Fraunces) para títulos e sans (Manrope) para texto.
- Ao adicionar imagens novas, colocá-las em `images/` e referenciar por caminho relativo.