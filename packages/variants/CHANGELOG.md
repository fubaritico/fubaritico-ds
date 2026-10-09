# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.3.0](https://github.com/fubaritico/fubaritico-ds/compare/v0.2.1...v0.3.0) (2026-10-09)

### Bug Fixes

- **reference:** apply the ColorPicker review — behaviour back in the service, browser-tested ([d79c753](https://github.com/fubaritico/fubaritico-ds/commit/d79c753793e24f92abb764f1769cdfa70b9ebc43))

### Features

- **reference:** add the ColorPicker panel on ColorPickerService ([6cb5c5d](https://github.com/fubaritico/fubaritico-ds/commit/6cb5c5d2f0d2637530a665b03b2e746d895bbf58))

# 0.2.0 (2026-10-09)

### Bug Fixes

- **reference:** a11y pass on DataTable cells ([0038c77](https://github.com/fubaritico/fubaritico-ds/commit/0038c775d0c4b8faf7ff97d13e1625f4a24a5c80))
- **reference:** give the dialog skins a font, breathing room and a footer axis ([30e7d59](https://github.com/fubaritico/fubaritico-ds/commit/30e7d59057a9a532d11bf4a6f7430f269d6db0a5))
- **reference:** polish DataTable skin + add DateCell truncation ([ae91759](https://github.com/fubaritico/fubaritico-ds/commit/ae9175970470ec26bd35ed658a5cdfbc6198f11d))

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
- **reference:** migrate Modal onto the native skin ([bf20c89](https://github.com/fubaritico/fubaritico-ds/commit/bf20c8974e1ba28b26b08926dc1eac227071eae4))
- **reference:** migrate Rating onto the native skin (grayscale, display-only) ([f3c572b](https://github.com/fubaritico/fubaritico-ds/commit/f3c572b234973f4367f0819436ea8caa719d6b3b))
- **reference:** migrate Skeleton onto the native BEM skin ([07cf01e](https://github.com/fubaritico/fubaritico-ds/commit/07cf01e7a8400edd1a58af26178f730b36465fff))
- **reference:** migrate Spinner to native skin with sm/md/lg sizes ([77262f5](https://github.com/fubaritico/fubaritico-ds/commit/77262f58d9ffba0d7d4b748d6967a5edc95fe022))
- **reference:** migrate Tabs onto the native skin ([3589b24](https://github.com/fubaritico/fubaritico-ds/commit/3589b244119c09f2313675ae48a22fad9d56b271))
- **reference:** migrate Typeahead onto the native skin ([1cd06e1](https://github.com/fubaritico/fubaritico-ds/commit/1cd06e19777526532e893af10e7b51573fb6af70))
- **reference:** migrate Typography to native skin (BEM + CVA + tokens) ([e1b3ba8](https://github.com/fubaritico/fubaritico-ds/commit/e1b3ba8a1e5dba3ae9b615dec9aea3ca3ea2d173))
- **reference:** split Typography body into body1 and body2 ([ffb6a0b](https://github.com/fubaritico/fubaritico-ds/commit/ffb6a0b92f35a28f359b7d97300aadb97156cf33))
- **repo:** make the design system installable, Tailwind-free, in a sibling project ([01be734](https://github.com/fubaritico/fubaritico-ds/commit/01be734c5c7ae73e61ed357b8a5b18f7f0925b4a))
- **variants:** add @fubaritico-ds/variants and migrate Badge onto it ([b487b4c](https://github.com/fubaritico/fubaritico-ds/commit/b487b4c5b3352ddd0b0ee0f988fdabc7c0cfddb7))
