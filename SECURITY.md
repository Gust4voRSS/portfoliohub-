# Política de Segurança

## Como relatar um problema
Encontrou uma falha? **Não abra uma issue pública.** Use a aba
**Security → Report a vulnerability** deste repositório (relato privado).
Resposta em até 7 dias.

## Versões com suporte
Apenas a versão publicada na branch `main` recebe correções.

## Medidas adotadas
| Risco | O que foi feito |
|---|---|
| Senha da conta roubada | Autenticação em dois fatores (2FA) obrigatória para o dono e colaboradores |
| Chave ou senha esquecida no código | *Secret scanning* + *push protection* ligados; nenhum token no frontend |
| Alguém alterar o site sem revisão | Regra (ruleset) na `main`: só entra por Pull Request aprovado, sem *force push* e sem apagar a branch |
| Bibliotecas vulneráveis | Dependabot alerts e atualizações automáticas das GitHub Actions |
| Injeção de código na página (XSS) | Todo texto vindo da API é "escapado"; links só `http/https`; Content Security Policy restritiva |
| Acesso excessivo de colaboradores | Princípio do menor privilégio: cada pessoa recebe só o papel de que precisa |
| Automação com permissão demais | Workflows com `permissions` mínimas (somente leitura por padrão) |

## Regras para quem contribui
1. Nunca coloque senhas, tokens ou chaves privadas no código.
2. Se uma chave vazar, revogue-a **imediatamente** no serviço de origem e avise o mantenedor.
3. Commits devem ser feitos com conta que tenha 2FA ativo.
