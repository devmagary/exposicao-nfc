# Instruções do projeto

## Commits

- Toda alteração feita neste projeto deve terminar em um **commit comentado**.
- Use uma mensagem objetiva, em português, explicando o que mudou e o motivo.
- Faça commits pequenos e não misture mudanças não relacionadas.
- Antes de encerrar uma tarefa, rode os testes aplicáveis, confira `git status` e garanta que não sobrou alteração sem commit.

## Worktrees

- Toda alteração deve ser feita em um **worktree do plugin git-worktree**, nunca direto no checkout principal.
- Commite no branch do worktree, integre no `main` (fast-forward quando possível), envie ao GitHub e remova o worktree ao final.
- O caminho `.agents/worktrees/` já é ignorado pelo Git.

