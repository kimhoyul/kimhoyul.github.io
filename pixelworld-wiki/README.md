# PixelWorld Wiki

GitHub Pages entry: index.html. The renderer and baseline 13-page data are preserved byte-for-byte in wiki-shell.html (original blob 2d7a3062c85efcd4769b3105c970d17b53c91915).

engine-transition.js applies the 2026-10-17 Unreal + C++ decision and the tested C++ Foundation state, then the entry renders the existing wiki at the same hash URLs. Current published page count: 14. Existing localStorage drafts are preserved; the first migration saves the previous JSON under pixelworld-wiki-data-v1-before-unreal-20261017.

Maintain index.html, wiki-shell.html and engine-transition.js together. Export HTML from the application for a self-contained offline copy; the network entry itself uses fetch and is served over HTTPS.

Code main commit: 040f1150c6c02d27d7d31cbc3e6c72190b0f8599. C++ tests: 165 assertions per compiler (GCC 14.2 / Clang 17), 10000 malformed-input probes, Clang ASan/UBSan, independent Python protocol comparison of 256 IDs. Unreal/MSVC verification is pending installed engine version.

Offline browser smoke checks used the mounted earlier renderer with in-memory fetch/localStorage adapters: main page, both new/updated routes, self-contained HTML export, local draft preservation, idempotent migration. Live public Pages response was not verified during this update.
