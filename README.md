# PortfolioHUB

Portfólio de projetos de **Gustavo Rodrigues Sousa Spindola** (RA 22654035), integrado ao GitHub.

- **Site no ar:** https://gust4vorss.github.io/portfoliohub/
- **Repositório:** https://github.com/gust4vorss/portfoliohub

## O que ele faz
- Lista automaticamente todos os meus repositórios públicos do GitHub (busca, filtro por linguagem e ordenação).
- Mostra um projeto em destaque, configurado no arquivo `projetos.json`.
- Exibe a versão (commit) que está publicada no momento.

## Como funciona a integração com o GitHub
| Parte | De onde vem |
|---|---|
| Lista de projetos | API pública `GET /users/gust4vorss/repos` |
| Foto e bio | API pública `GET /users/gust4vorss` |
| Versão no ar | API pública `GET /repos/gust4vorss/portfoliohub/commits` |
| Projeto em destaque | Arquivo `projetos.json` versionado neste repositório |
| Hospedagem | GitHub Pages (branch `main`, pasta raiz) |

Nenhum token ou senha é usado: só dados públicos.

## Rodar no próprio computador
1. `git clone https://github.com/gust4vorss/portfoliohub`
2. Abra a pasta no VS Code e use a extensão **Live Server** (o `projetos.json` precisa ser servido por um servidor, não por duplo clique).

## Estrutura
```
index.html       página
style.css        aparência
app.js           lógica (busca na API do GitHub)
projetos.json    configuração do destaque
.github/         regras de colaboração, segurança e automações
SECURITY.md      política de segurança
CONTRIBUTING.md  como colaborar
```

## Colaboração
Leia o [CONTRIBUTING.md](CONTRIBUTING.md). Resumo: nada vai direto para a `main`; toda mudança entra por Pull Request revisado.

## Segurança
Veja o [SECURITY.md](SECURITY.md).

## Licença
MIT — veja [LICENSE](LICENSE).
## Status
Versão 1.0 publicada em 25/10/2026. 
