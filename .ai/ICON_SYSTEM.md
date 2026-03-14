# ICON SYSTEM

STRICT RULE:
This project uses **Heroicons ONLY**.

Library:

@heroicons/react

Allowed icon styles:

* /24/outline → default UI icons
* /24/solid → emphasis icons (active state, important actions)

DO NOT USE:

* Font Awesome
* Lucide
* Material Icons
* Inline `<svg>` elements
* Any other icon library

Always import icons from **@heroicons/react**.

Example (Outline icon):

```tsx
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

<ShoppingCartIcon className="w-5 h-5 text-slate-600" />
```

Example (Solid icon):

```tsx
import { HeartIcon } from '@heroicons/react/24/solid'

<HeartIcon className="w-5 h-5 text-red-500" />
```

Rules:

* Always use Heroicons React components.
* Do NOT paste raw SVG code.
* Icons must follow the same Tailwind sizing convention:

  * `w-4 h-4` → small
  * `w-5 h-5` → default
  * `w-6 h-6` → large
