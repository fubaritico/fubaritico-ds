---
title: Stencil — Sources de référence (opensrc)
type: reference
permalink: main/stencil/stencil-sources-de-reference-opensrc
tags:
- stencil
- opensrc
- sources
- lit-context
---

# Stencil — Sources de référence (opensrc)

> Sources réelles récupérées localement (via `npx opensrc@0.6 path <pkg>`) dans le repo source
> fubaritico-ds, sous `opensrc/`. À refetcher sur le nouveau repo pour lire l'implémentation interne.

## Sources fetchées (état `opensrc/sources.json`, 2026-06-04)

| Source                    | Version | Chemin local (repo source)                                      |
| ------------------------- | ------- | --------------------------------------------------------------- |
| `github.com/stenciljs/core` | `main` | `opensrc/repos/github.com/stenciljs/core`                       |
| `@lit/context` (npm)      | `1.1.6` | `opensrc/repos/github.com/lit/lit/packages/context`             |

## Pourquoi ces sources

- **`stenciljs/core`** — pour lire l'implémentation réelle du compilateur : la liste fermée des
  décorateurs (`STENCIL_DECORATORS` = 11 marqueurs), leur retrait au build
  (`CLASS_DECORATORS_TO_REMOVE` / `MEMBER_DECORATORS_TO_REMOVE`), et l'interface réelle
  `OutputTargetCustom` (`declarations/stencil-public-compiler.ts`) qui prouve que react/angular output
  targets sont de simples custom output targets. Cf. [[Stencil — Concepts Web Components (avant de coder)]] §5.
- **`@lit/context`** — pour le cœur réel du **Context Protocol** W3C : `context-request-event.ts`
  (`ContextRequestEvent extends Event` avec `bubbles: true, composed: true`). Sert de modèle si on doit
  reproduire un Context dans un compound Stencil. Cf. [[Stencil — Concepts Web Components (avant de coder)]] §4.

## Comment refetcher sur le nouveau repo

```bash
npx opensrc@0.6 path https://github.com/stenciljs/core.git   # ou: npx opensrc@0.6 stenciljs/core
npx opensrc@0.6 path @lit/context                            # amène la source @lit/context dans opensrc/
# 0.6 ramène les repos dans un dossier local opensrc/ et met à jour/crée AGENTS.md + sources.json
```
(La doc en ligne : https://opensrc.sh/)

## Fichiers clés à ouvrir dans la source Stencil

- `declarations/stencil-public-compiler.ts` → interfaces `Config`, `OutputTarget*`, `OutputTargetCustom`.
- Recherche de `STENCIL_DECORATORS`, `CLASS_DECORATORS_TO_REMOVE`, `MEMBER_DECORATORS_TO_REMOVE` → preuve
  que les décorateurs sont des annotations de compilation retirées au build.

## Relations

- Concepts (§4 Context Protocol, §5 extensibilité) : [[Stencil — Concepts Web Components (avant de coder)]]
- Index : [[Stencil — Index de la base de connaissances]]
