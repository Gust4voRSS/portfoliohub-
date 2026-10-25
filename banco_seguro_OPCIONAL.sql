-- OPCIONAL — melhoria de segurança para o projeto "Futebol por Região" (Supabase).
-- Problema atual: qualquer visitante pode APAGAR todos os favoritos e inserir textos gigantes.
-- O que este script faz:
--   1) Limita o tamanho do que pode ser salvo (evita lixo/abuso).
--   2) Remove a permissão de EXCLUIR para visitantes anônimos.
-- Efeito colateral: o botão "Excluir" do site deixa de funcionar para visitantes
-- (a exclusão passa a ser feita só pelo painel do Supabase, pelo dono).

alter table public.favoritos
  add constraint nome_item_tamanho  check (char_length(nome_item) between 1 and 60),
  add constraint dados_extra_tamanho check (dados_extra is null or char_length(dados_extra) <= 120);

drop policy if exists "Todos podem excluir" on public.favoritos;
revoke delete on public.favoritos from anon;
