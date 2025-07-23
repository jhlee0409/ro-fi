import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_BUNsGnAi.mjs';
import { manifest } from './manifest_Cd_qbZpA.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/generate-story.astro.mjs');
const _page3 = () => import('./pages/novels/_slug_/chapter/_chapternumber_.astro.mjs');
const _page4 = () => import('./pages/novels/_slug_.astro.mjs');
const _page5 = () => import('./pages/novels.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.12.0_@types+node@22.16.5_jiti@1.21.7_rollup@4.45.1_typescript@5.8.3_yaml@2.8.0/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/generate-story.ts", _page2],
    ["src/pages/novels/[slug]/chapter/[chapterNumber].astro", _page3],
    ["src/pages/novels/[slug].astro", _page4],
    ["src/pages/novels.astro", _page5],
    ["src/pages/index.astro", _page6]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "07650890-d225-42cc-bc10-639591ae9c0f",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
