# Final anime artwork

All 72 shipped images are produced from 47 individually prompted illustrations
made with the built-in `image_gen` tool. The prompts, subjects, reference roles,
and output groups live in [catalog.mjs](catalog.mjs). The exact submitted prompt
set and built-in tool settings are recorded in [generation.json](generation.json).
The visual direction is
the Demon Slayer / Kimetsu no Yaiba anime, with original scenario characters.

High-resolution selected masters are kept in `generated/`. They are source
files, excluded from the installable module archive. The built-in generator
needs no API key. Its selected outputs were copied into this repository; no
runtime image generation or network access is needed.

```powershell
npm run art                   # reproduce all 72 final WebP assets offline
node tools/art.mjs portraits   # reproduce portraits and matching tokens
node tools/art.mjs maps        # reproduce maps, thumbnails and GM plan
node tools/art/import.mjs portraits/akane 'C:\path\to\generated.png'
```

`npm run art` only resizes the selected illustrations and derives transparent
circular tokens, map thumbnails, the labeled GM plan, and matching clue icons.
French handout text is typeset verbatim from `src/journals.mjs` over generated
paper illustrations, so clue dates and times stay exact. Location marker
letters are typeset over generated transparent medallions for legibility at
128 pixels. The drawing retains the essential clue: Kōta has no breath cloud.

Maps use the previous maps as edit targets and spatial references: their
orthographic view, room bounds, doors and hearth positions must match
`src/layout.mjs`. Portraits and tokens share one illustration for identity.
Every consuming path and final image dimension is preserved.

The old procedural draft helpers remain in `people.mjs`, `paper.mjs` and
`maps.mjs` for reference. The final-art command does not invoke them.
