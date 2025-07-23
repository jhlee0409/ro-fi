import { c as createComponent, a as createAstro, b as addAttribute, d as renderHead, e as renderSlot, f as renderScript, r as renderTemplate } from './astro/server_CZqxw96B.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title,
    description = "AI\uAC00 \uB9E4\uC77C \uC0C8\uBCBD 2\uC2DC, \uC644\uBCBD\uD55C \uC2A4\uD1A0\uB9AC \uC5F0\uC18D\uC131\uC73C\uB85C \uC0C8\uB85C\uC6B4 \uB85C\uB9E8\uC2A4 \uD310\uD0C0\uC9C0 \uC138\uACC4\uB97C \uC120\uC0AC\uD569\uB2C8\uB2E4",
    ogImage,
    noIndex = false
  } = Astro2.props;
  return renderTemplate`<html lang="ko" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="description"${addAttribute(description, "content")}>${noIndex && renderTemplate`<meta name="robots" content="noindex, nofollow">`}<meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title><!-- Open Graph --><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:type" content="website"><meta property="og:site_name" content="RO-FAN">${ogImage && renderTemplate`<meta property="og:image"${addAttribute(ogImage, "content")}>`}<!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}>${ogImage && renderTemplate`<meta name="twitter:image"${addAttribute(ogImage, "content")}>`}<!-- Preload fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="font-sans antialiased" data-astro-cid-sckkx6r4> <!-- 네비게이션 헤더 --> <header class="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50" data-astro-cid-sckkx6r4> <nav class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-sckkx6r4> <div class="flex justify-between items-center h-16" data-astro-cid-sckkx6r4> <!-- 로고 --> <div class="flex items-center space-x-4" data-astro-cid-sckkx6r4> <a href="/" class="flex items-center space-x-2" data-astro-cid-sckkx6r4> <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center" data-astro-cid-sckkx6r4> <span class="text-white text-lg font-bold" data-astro-cid-sckkx6r4>🌹</span> </div> <span class="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-astro-cid-sckkx6r4>
RO-FAN
</span> </a> </div> <!-- 네비게이션 메뉴 --> <div class="hidden md:flex items-center space-x-8" data-astro-cid-sckkx6r4> <a href="/" class="text-gray-700 hover:text-purple-600 transition-colors font-medium" data-astro-cid-sckkx6r4>
홈
</a> <a href="/novels" class="text-gray-700 hover:text-purple-600 transition-colors font-medium" data-astro-cid-sckkx6r4>
소설
</a> <a href="#latest" class="text-gray-700 hover:text-purple-600 transition-colors font-medium" data-astro-cid-sckkx6r4>
최신
</a> </div> <!-- 모바일 메뉴 버튼 --> <div class="md:hidden" data-astro-cid-sckkx6r4> <button id="mobile-menu-button" class="text-gray-700 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-2" data-astro-cid-sckkx6r4> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-sckkx6r4> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-astro-cid-sckkx6r4></path> </svg> </button> </div> </div> <!-- 모바일 메뉴 --> <div id="mobile-menu" class="md:hidden hidden" data-astro-cid-sckkx6r4> <div class="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200" data-astro-cid-sckkx6r4> <a href="/" class="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium" data-astro-cid-sckkx6r4>
홈
</a> <a href="/novels" class="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium" data-astro-cid-sckkx6r4>
소설
</a> <a href="#latest" class="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium" data-astro-cid-sckkx6r4>
최신
</a> </div> </div> </nav> </header> <!-- 메인 콘텐츠 --> <main data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} </main> <!-- 푸터 --> <footer class="bg-gray-900 text-white" data-astro-cid-sckkx6r4> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-astro-cid-sckkx6r4> <div class="grid grid-cols-1 md:grid-cols-4 gap-8" data-astro-cid-sckkx6r4> <!-- 브랜드 정보 --> <div class="md:col-span-2" data-astro-cid-sckkx6r4> <div class="flex items-center space-x-2 mb-4" data-astro-cid-sckkx6r4> <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center" data-astro-cid-sckkx6r4> <span class="text-white text-lg font-bold" data-astro-cid-sckkx6r4>🌹</span> </div> <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" data-astro-cid-sckkx6r4>
RO-FAN
</span> </div> <p class="text-gray-400 leading-relaxed max-w-md" data-astro-cid-sckkx6r4>
AI가 창조하는 무한한 로맨스 판타지 세계. 매일 새벽 2시, Claude AI가 완벽한 스토리 연속성으로 새로운 에피소드를 선사합니다.
</p> </div> <!-- 빠른 링크 --> <div data-astro-cid-sckkx6r4> <h3 class="text-lg font-semibold mb-4" data-astro-cid-sckkx6r4>빠른 링크</h3> <ul class="space-y-2" data-astro-cid-sckkx6r4> <li data-astro-cid-sckkx6r4><a href="/" class="text-gray-400 hover:text-white transition-colors" data-astro-cid-sckkx6r4>홈</a></li> <li data-astro-cid-sckkx6r4><a href="/novels" class="text-gray-400 hover:text-white transition-colors" data-astro-cid-sckkx6r4>소설 목록</a></li> <li data-astro-cid-sckkx6r4><a href="#latest" class="text-gray-400 hover:text-white transition-colors" data-astro-cid-sckkx6r4>최신 업데이트</a></li> </ul> </div> <!-- AI 정보 --> <div data-astro-cid-sckkx6r4> <h3 class="text-lg font-semibold mb-4" data-astro-cid-sckkx6r4>AI 기술</h3> <ul class="space-y-2" data-astro-cid-sckkx6r4> <li class="text-gray-400" data-astro-cid-sckkx6r4>Claude Sonnet 4</li> <li class="text-gray-400" data-astro-cid-sckkx6r4>GitHub Actions</li> <li class="text-gray-400" data-astro-cid-sckkx6r4>자동 품질 검증</li> <li class="text-gray-400" data-astro-cid-sckkx6r4>컨텍스트 관리</li> </ul> </div> </div> <!-- 하단 구분선 및 저작권 --> <div class="border-t border-gray-800 mt-8 pt-8 text-center" data-astro-cid-sckkx6r4> <p class="text-gray-400 text-sm" data-astro-cid-sckkx6r4>
© 2024 RO-FAN. AI-powered Romance Fantasy Platform. Made with ❤️ and Claude AI.
</p> </div> </div> </footer> <!-- JavaScript for mobile menu --> ${renderScript($$result, "/Users/jack/client/ro-fan/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")}  </body> </html>`;
}, "/Users/jack/client/ro-fan/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
