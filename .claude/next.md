# Next — the resume point

> Loaded at session start (CLAUDE.md `### Next` → `@next.md`). **Since 2026-10-22 the list of tasks is the
> Trello board** — https://trello.com/b/eEZaJpsL/fubaritico-ds, through the `/trello` skill. This file holds
> only where we stopped, what is mid-flight, and context that is not a task. Its former content is in
> `next-archive.md`, verbatim. Long threads (north-star, locked decisions): `next-threads.md`.

## ▶ ON REPREND ICI (2026-10-22)

Deux tickets t'attendent dans **À valider par le développeur** :

- **REPO-143** — le tableau Trello du DS (historique rattrapé, travail ouvert, skill `/trello`), commité.
- **REPO-150** — le contexte chargé par chemin (~100 Ko → ~35 Ko au lancement), le hook des règles, les
  méthodes d'Atlas portées. Vérification : une nouvelle session, dont le début doit bien se passer.

Restent à trancher (`files/plans/context-engineering-sync.md`) : la règle de gestion d'erreur d'Atlas à
adapter à une bibliothèque ; la langue des fichiers (anglais chez Atlas) ; fusionner puis supprimer le journal
égaré `.claude/skills/files/session-log.jsonl` (ton feu vert : c'est une suppression).

## Le tableau

| où                  | ticket                                                                                                                                                 | état                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **Chantiers**       | DESIGN-120 thèmes · DESIGN-121 DataTable · DESIGN-122 Stencil · DESIGN-123 agent-ready                                                                 | paliers en checklist, liés aux tickets      |
| **À valider**          | REPO-143 tableau · REPO-150 contexte                                                                                                                       | à vérifier par toi
| **À faire**         | —                                                                                                                                                      | vide : l'ordre est le tien                  |
| **Backlog**         | thèmes 2→5 (TOKENS-124…127), menu de commandes Atlas (REACT-128), `role="grid"` (REACT-129), Stencil vert (STENCIL-130), doc comme donnée (DESIGN-131) |                                             |
| **Fait**, à publier | STYLES-119 flèche de la Tooltip claire                                                                                                                 | partira en 0.7.1 ou avec la prochaine minor |

Avant le 22/10, l'option du jour était : thèmes étape 2 (TOKENS-124) ou le menu d'Atlas (REACT-128,
basse priorité ; ma reco : composant frère `ActionMenu` plutôt qu'une prop `kind` — à débattre).

## À savoir

- Le jeton Trello atteint **tous** les tableaux du compte, celui d'Atlas compris : le script n'écrit que
  sur le nôtre (`board.json`). Le skill d'Atlas dit l'inverse (« its token reaches this board only ») :
  c'est devenu faux, à lui signaler.
- Release : `/release` (tapé par le dev), feu vert du dev à chaque publication ; ensuite
  `trello published X.Y.Z`.
