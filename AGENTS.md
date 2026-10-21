# Instruções do projeto

## Fluxo de trabalho

1. Crie um **worktree do plugin git-worktree** para cada alteração; não trabalhe no checkout principal.
2. Faça as mudanças e os commits no branch desse worktree.
3. Ao terminar, integre no `main` (fast-forward quando possível), envie ao GitHub e remova o worktree.
   O `.agents/` já está no `.gitignore`.

## Commits

- Cada alteração termina em um **commit comentado**: mensagem objetiva, em português, explicando o que mudou e o motivo.
- Faça commits pequenos e não misture mudanças não relacionadas.

## Antes de encerrar

- Rode os testes aplicáveis: `node tests/run-tests.js` e, se mudar JS, layout ou interação, `node tests/run-e2e.js`.
- Confira `git status` (sem alterações pendentes) e se o `main` está sincronizado com `origin/main`.
