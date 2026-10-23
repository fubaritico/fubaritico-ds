# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/fubaritico/fubaritico-ds/compare/v0.7.0...v0.8.0) (2026-10-23)

### Bug Fixes

- **styles:** outline the light tooltip arrow and keep it a triangle under forced colours ([76bde29](https://github.com/fubaritico/fubaritico-ds/commit/76bde29a93d0c0e4b02d5465571023858c44b07e))

### Features

- **styles:** add the toast skin ([2d3dfee](https://github.com/fubaritico/fubaritico-ds/commit/2d3dfee52f67ce91f4f9fef1b3429f8580f7dd4d))
- **styles:** an even toast stack, one-line toasts centred ([1d0d634](https://github.com/fubaritico/fubaritico-ds/commit/1d0d63473d4dd7b112ead486a313b3386d7a50fa))
- **styles:** toast close target, reflow and focus ring ([36347c0](https://github.com/fubaritico/fubaritico-ds/commit/36347c0653df90d4ac105224c82f4ee57926d59b))

# [0.7.0](https://github.com/fubaritico/fubaritico-ds/compare/v0.6.0...v0.7.0) (2026-10-21)

- feat(tokens)!: rename the colour tokens to roles named after what they paint ([c88df0f](https://github.com/fubaritico/fubaritico-ds/commit/c88df0f2d19cd35c5901b9f8c53cc30a12ea789b))

### BREAKING CHANGES

- foreground, muted, background, secondary, accent, card, popover, input, ring,
  primary-foreground and their variants are removed, with no alias. Overrides of the old names are
  silently ignored: rename them (mapping in the tokens README).

Claude-Session: https://claude.ai/code/session_01QJfJybYnBeCFAZi3gKjBaL

# [0.6.0](https://github.com/fubaritico/fubaritico-ds/compare/v0.5.0...v0.6.0) (2026-10-12)

### API removals (adapt your code)

- `--ui-dropdown-z`, `--ui-typeahead-menu-z-index`, `--ui-bottom-sheet-z-index` removed: those surfaces render in the top layer.
- `.ui-bottom-sheet__overlay` removed (the backdrop is the native `::backdrop`).

### Bug Fixes

- **reference:** open the dropdown menu in the top layer so it works inside a modal ([49faf4b](https://github.com/fubaritico/fubaritico-ds/commit/49faf4b73aed042e4da38ff518304aba99435c4d))
- **reference:** open the typeahead list in the top layer so it works inside a modal ([3218422](https://github.com/fubaritico/fubaritico-ds/commit/3218422e307d202be423a38901da49b3429e2169))
- **reference:** rebuild the bottom sheet on a native dialog in the top layer ([3f55d36](https://github.com/fubaritico/fubaritico-ds/commit/3f55d3611bab88905755bcb9c486b9d76566ab33))
- **reference:** render the tooltip in the top layer so it shows inside a modal ([4041311](https://github.com/fubaritico/fubaritico-ds/commit/40413112218dcff7ef980e74f7d442a20aebb4ad))
- **styles:** guard the closed state of modal, drawer and popover against consumer display ([1b52c09](https://github.com/fubaritico/fubaritico-ds/commit/1b52c09122f90c36b71a689f6b29157aad80bf07))

### Features

- **behaviors:** drive tooltips with a TooltipService and the useTooltip hook ([6b6cce3](https://github.com/fubaritico/fubaritico-ds/commit/6b6cce305f400a76ea5ec875eeff244443cfb8c5))
- **reference:** reveal a cut text in a tooltip with TruncatedText ([c5dd012](https://github.com/fubaritico/fubaritico-ds/commit/c5dd012a4c34b665b134193384cdb674baafd3c8))
- **reference:** reveal cut-off table text and cell hints in a tooltip ([a410ce2](https://github.com/fubaritico/fubaritico-ds/commit/a410ce23c2317243a2838c770937495fb9d1183f))
- **styles:** round one corner or two through a per-corner radius API ([7fb6342](https://github.com/fubaritico/fubaritico-ds/commit/7fb6342a716c09a1bd63bbf24df8a8018942898b))

# [0.5.0](https://github.com/fubaritico/fubaritico-ds/compare/v0.4.1...v0.5.0) (2026-10-11)

### Bug Fixes

- **styles:** keep a 24px slider hit area whatever the thumb size ([8af6e64](https://github.com/fubaritico/fubaritico-ds/commit/8af6e64366ffc127c56861ff6263fc5a2f0d6928))

### Features

- **behaviors:** preview a typed hex live and make the compact color picker shorter ([81ee5c2](https://github.com/fubaritico/fubaritico-ds/commit/81ee5c24e3221436256d5af7b4f660be840fa46d))

# [0.4.0](https://github.com/fubaritico/fubaritico-ds/compare/v0.3.0...v0.4.0) (2026-10-09)

### Features

- **reference:** add a compact density to the color picker and color field ([1afd42b](https://github.com/fubaritico/fubaritico-ds/commit/1afd42bfc76882d3fcdcfdcbe16781d701940652))
- **reference:** add popover and color field, usable inside a modal dialog ([38f99ae](https://github.com/fubaritico/fubaritico-ds/commit/38f99ae3b15b9d5422aa316072f39a0b3762f49b))

# [0.3.0](https://github.com/fubaritico/fubaritico-ds/compare/v0.2.1...v0.3.0) (2026-10-09)

### Bug Fixes

- **reference:** apply the ColorPicker review — behaviour back in the service, browser-tested ([d79c753](https://github.com/fubaritico/fubaritico-ds/commit/d79c753793e24f92abb764f1769cdfa70b9ebc43))

### Features

- **reference:** add the ColorPicker panel on ColorPickerService ([6cb5c5d](https://github.com/fubaritico/fubaritico-ds/commit/6cb5c5d2f0d2637530a665b03b2e746d895bbf58))

# 0.2.0 (2026-10-09)

### Bug Fixes

- **reference:** a11y pass on DataTable cells ([0038c77](https://github.com/fubaritico/fubaritico-ds/commit/0038c775d0c4b8faf7ff97d13e1625f4a24a5c80))
- **reference:** give the dialog skins a font, breathing room and a footer axis ([30e7d59](https://github.com/fubaritico/fubaritico-ds/commit/30e7d59057a9a532d11bf4a6f7430f269d6db0a5))
- **reference:** let the Modal shell centre its own panel ([7d74755](https://github.com/fubaritico/fubaritico-ds/commit/7d74755552821f08332effb47d56a79463dab975))
- **reference:** polish DataTable skin + add DateCell truncation ([ae91759](https://github.com/fubaritico/fubaritico-ds/commit/ae9175970470ec26bd35ed658a5cdfbc6198f11d))
- **reference:** scroll the paginated DataTable body, reserve <tfoot> for summaries ([e533e11](https://github.com/fubaritico/fubaritico-ds/commit/e533e1104757799906c264f87808f114e86a39f4))
- **reference:** stop a consumer ref from silently disabling Modal and Drawer ([30d557d](https://github.com/fubaritico/fubaritico-ds/commit/30d557d6ea5c59e2667e8b6faf4152d914dcddf1))
- **reference:** stop the drawer rendering while closed and closing on itself ([77122a4](https://github.com/fubaritico/fubaritico-ds/commit/77122a40801157eda4ff2d892a6c1fd037ea48bc))
- **repo:** stop Storybook pulling Tailwind preflight; Badge padding renders ([4688b93](https://github.com/fubaritico/fubaritico-ds/commit/4688b93172c12002f3fbc540277a3f15097cff26))
- **styles:** badge applies --font-inter via --ui-badge-font-family ([fdfad78](https://github.com/fubaritico/fubaritico-ds/commit/fdfad788f34c2d4f3c27d3699de6a76081ea65c1))
- **styles:** raise focus-ring contrast and honour reduced motion on the button skin ([bacc280](https://github.com/fubaritico/fubaritico-ds/commit/bacc28029250b40894cf5448cfc1b6ee43afa818)), closes [#6b6b6](https://github.com/fubaritico/fubaritico-ds/issues/6b6b6)
- **styles:** scale Spinner ring thickness with its size ([d6c7c45](https://github.com/fubaritico/fubaritico-ds/commit/d6c7c45d3c36aa3bfc1ff99ab1b058753a7fc6b5))
- **tokens:** darken DataTable column-header text to clear WCAG AA ([2df4c3b](https://github.com/fubaritico/fubaritico-ds/commit/2df4c3b2268d2c04f9868fa4cc3edeb3532db6f0))

### Features

- **reference:** add a real edge-anchored Drawer on the native dialog ([eb36157](https://github.com/fubaritico/fubaritico-ds/commit/eb36157d9303e2d5bc9170252a79aed013b9ad22))
- **reference:** add Badge canTruncate + AA outline border ([d80302c](https://github.com/fubaritico/fubaritico-ds/commit/d80302c6524c9b0f521b7b2a5a5007b88e4dc557))
- **reference:** add the Alert message component ([3c376d0](https://github.com/fubaritico/fubaritico-ds/commit/3c376d03ab29c063ba6411f60628952ead770af1))
- **reference:** add the ProgressBar determinate progress component ([1d37a2e](https://github.com/fubaritico/fubaritico-ds/commit/1d37a2eee1f5f3ce7e43603d9974a8bc51d0a8d7))
- **reference:** add the Slider primitive, built for re-skinning ([dfe58e5](https://github.com/fubaritico/fubaritico-ds/commit/dfe58e57b4e90d12bf64466b331fc9e27f974239))
- **reference:** migrate Avatar onto the native BEM skin ([facecc5](https://github.com/fubaritico/fubaritico-ds/commit/facecc5e81b983061a60d6e9ab26ebe087a400fc))
- **reference:** migrate Button to native skin; split Button/LinkButton/NextLinkButton ([532cb3c](https://github.com/fubaritico/fubaritico-ds/commit/532cb3c95ce706931dc0e93eb61238f27bca38f7))
- **reference:** migrate Card onto the native skin as a slotted compound ([2d30644](https://github.com/fubaritico/fubaritico-ds/commit/2d30644068d6430b273dba0489c8bb5b03c0c3b4))
- **reference:** migrate checkbox, tooltip, dropdown, pagination onto the native skin ([e1db9f5](https://github.com/fubaritico/fubaritico-ds/commit/e1db9f588f0fd366da7ca20568f00780484d674a))
- **reference:** migrate Drawer onto the native skin ([95721b9](https://github.com/fubaritico/fubaritico-ds/commit/95721b9e612cc2a55d8ee3d1713d1e21c297886a))
- **reference:** migrate IconButton as an Open/Closed extension of Button ([10de488](https://github.com/fubaritico/fubaritico-ds/commit/10de488a3256f39857bddcdb2f17f46b9ef30cb8))
- **reference:** migrate Image onto the native skin ([063dd93](https://github.com/fubaritico/fubaritico-ds/commit/063dd9333766193321fc9dc9de386c909d2f50aa))
- **reference:** migrate Input onto the native skin ([587712b](https://github.com/fubaritico/fubaritico-ds/commit/587712b82037d16bc39938351e71daa5a795b4f6)), closes [#949494](https://github.com/fubaritico/fubaritico-ds/issues/949494)
- **reference:** migrate Listbox onto the BEM skin ([4302490](https://github.com/fubaritico/fubaritico-ds/commit/4302490c02bc5be16841034dc389877b1cbe3779))
- **reference:** migrate Menu onto the native skin ([5aa4fab](https://github.com/fubaritico/fubaritico-ds/commit/5aa4fab093fa53110d4026b8b00ec4f08f41f638))
- **reference:** migrate Modal onto the native skin ([bf20c89](https://github.com/fubaritico/fubaritico-ds/commit/bf20c8974e1ba28b26b08926dc1eac227071eae4))
- **reference:** migrate Rating onto the native skin (grayscale, display-only) ([f3c572b](https://github.com/fubaritico/fubaritico-ds/commit/f3c572b234973f4367f0819436ea8caa719d6b3b))
- **reference:** migrate Skeleton onto the native BEM skin ([07cf01e](https://github.com/fubaritico/fubaritico-ds/commit/07cf01e7a8400edd1a58af26178f730b36465fff))
- **reference:** migrate Spinner to native skin with sm/md/lg sizes ([77262f5](https://github.com/fubaritico/fubaritico-ds/commit/77262f58d9ffba0d7d4b748d6967a5edc95fe022))
- **reference:** migrate Tabs onto the native skin ([3589b24](https://github.com/fubaritico/fubaritico-ds/commit/3589b244119c09f2313675ae48a22fad9d56b271))
- **reference:** migrate Typeahead onto the native skin ([1cd06e1](https://github.com/fubaritico/fubaritico-ds/commit/1cd06e19777526532e893af10e7b51573fb6af70))
- **reference:** migrate Typography to native skin (BEM + CVA + tokens) ([e1b3ba8](https://github.com/fubaritico/fubaritico-ds/commit/e1b3ba8a1e5dba3ae9b615dec9aea3ca3ea2d173))
- **reference:** rewrite Avatar as a React 19 compound ([4136a10](https://github.com/fubaritico/fubaritico-ds/commit/4136a10c1214591a0b1a0fd5629fd916722216ba))
- **reference:** split Typography body into body1 and body2 ([ffb6a0b](https://github.com/fubaritico/fubaritico-ds/commit/ffb6a0b92f35a28f359b7d97300aadb97156cf33))
- **repo:** make the design system installable, Tailwind-free, in a sibling project ([01be734](https://github.com/fubaritico/fubaritico-ds/commit/01be734c5c7ae73e61ed357b8a5b18f7f0925b4a))
- **styles:** white-label native BEM skin + Badge spike ([fc30ab7](https://github.com/fubaritico/fubaritico-ds/commit/fc30ab7fa818b6d9073d9d08956a497fe3ac0efe)), closes [#1976d2](https://github.com/fubaritico/fubaritico-ds/issues/1976d2)
- **tokens:** 20-step neutral grey scale + dash-ify dotted CSS var names ([fecac53](https://github.com/fubaritico/fubaritico-ds/commit/fecac539c9998c0b77e868fc0b76f59cb075d345))
