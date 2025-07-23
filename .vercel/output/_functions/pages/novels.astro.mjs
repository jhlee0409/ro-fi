import { c as createComponent, a as createAstro, m as maybeRenderHead, b as addAttribute, r as renderTemplate, g as renderComponent, f as renderScript } from '../chunks/astro/server_CZqxw96B.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_7x9yZQlL.mjs';
import 'clsx';
/* empty css                                  */
import { $ as $$AutomationInfoSection } from '../chunks/AutomationInfoSection_eWvhS8_n.mjs';
import { N as NovelDataService } from '../chunks/data-services_4wvu5dAX.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro();
const $$LibraryHeroSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$LibraryHeroSection;
  const { totalNovels, activeNovels, totalChapters } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="relative min-h-[60vh] flex items-center justify-center overflow-hidden"> <!-- 배경 그라디언트 --> <div class="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900"></div> <!-- 배경 파티클 효과 --> <div class="absolute inset-0 overflow-hidden"> ${[...Array(30)].map(() => renderTemplate`<div class="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"${addAttribute({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 3}s`
  }, "style")}></div>`)} </div> <!-- 중앙 컨텐츠 --> <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"> <div class="space-y-8"> <!-- 메인 제목 --> <div class="space-y-4"> <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"> <span class="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
연재 소설 라이브러리
</span> <span class="block text-3xl sm:text-4xl lg:text-5xl mt-2">📚 RO-FAN</span> </h1> <p class="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
AI가 창조하는 무한한 로맨스 판타지 세계를 탐험하세요
</p> </div> <!-- 통계 카드 --> <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-12"> <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"> <div class="text-3xl sm:text-4xl font-bold text-white mb-2">${totalNovels}</div> <div class="text-purple-200">총 소설</div> </div> <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"> <div class="text-3xl sm:text-4xl font-bold text-white mb-2">${activeNovels}</div> <div class="text-purple-200">연재 중</div> </div> <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"> <div class="text-3xl sm:text-4xl font-bold text-white mb-2">${totalChapters}</div> <div class="text-purple-200">총 챕터</div> </div> <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"> <div class="text-3xl sm:text-4xl font-bold text-white mb-2">100%</div> <div class="text-purple-200">AI 자동</div> </div> </div> </div> </div> </section>`;
}, "/Users/jack/client/ro-fan/src/components/sections/LibraryHeroSection.astro", void 0);

const $$FilterSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="py-12 bg-white border-b border-gray-100"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"> <!-- 검색 --> <div class="flex-1 max-w-md"> <div class="relative"> <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <input type="text" placeholder="소설 제목으로 검색..." id="searchInput" class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"> </div> </div> <!-- 필터 버튼들 --> <div class="flex items-center space-x-3"> <button data-filter="all" class="filter-btn active px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 bg-purple-600 text-white">
전체
</button> <button data-filter="연재 중" class="filter-btn px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700">
연재 중
</button> <button data-filter="완결" class="filter-btn px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700">
완결
</button> <button data-filter="latest" class="filter-btn px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700">
최신순
</button> </div> </div> </div> </section>`;
}, "/Users/jack/client/ro-fan/src/components/sections/FilterSection.astro", void 0);

const $$Astro = createAstro();
const $$NovelListSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$NovelListSection;
  const { novels } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="py-20 bg-gradient-to-b from-gray-50 to-white" id="novels-section" data-astro-cid-bfderiq5> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-bfderiq5> ${novels.length === 0 ? renderTemplate`<!-- 빈 상태 -->
      <div class="text-center py-16" data-astro-cid-bfderiq5> <div class="text-6xl mb-6" data-astro-cid-bfderiq5>📚</div> <h3 class="text-2xl font-semibold text-gray-900 mb-4" data-astro-cid-bfderiq5>아직 연재 중인 소설이 없습니다</h3> <p class="text-gray-600 mb-8" data-astro-cid-bfderiq5>곧 멋진 로맨스 판타지 소설들이 시작됩니다!</p> <a href="/" class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200" data-astro-cid-bfderiq5>
홈으로 돌아가기
</a> </div>` : renderTemplate`<!-- 소설 그리드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="novels-grid" data-astro-cid-bfderiq5> ${novels.map((novel) => renderTemplate`<div class="novel-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"${addAttribute(novel.data.status, "data-status")}${addAttribute(novel.data.title?.toLowerCase(), "data-title")} data-astro-cid-bfderiq5> <!-- 소설 커버 --> <div class="relative h-64 bg-gradient-to-br from-purple-400 via-pink-500 to-red-400 overflow-hidden" data-astro-cid-bfderiq5> ${novel.data.coverImage ? renderTemplate`<img${addAttribute(novel.data.coverImage, "src")}${addAttribute(novel.data.title, "alt")} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-astro-cid-bfderiq5>` : renderTemplate`<div class="w-full h-full flex items-center justify-center text-white text-6xl font-bold group-hover:scale-110 transition-transform duration-500" data-astro-cid-bfderiq5> ${novel.data.title?.[0] || "\u{1F4D6}"} </div>`} <!-- 오버레이 --> <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" data-astro-cid-bfderiq5></div> <!-- 상태 뱃지 --> <div class="absolute top-4 left-4" data-astro-cid-bfderiq5> <span${addAttribute(`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${novel.data.status === "\uC5F0\uC7AC \uC911" ? "bg-green-100 text-green-800" : novel.data.status === "\uC644\uACB0" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`, "class")} data-astro-cid-bfderiq5> ${novel.data.status} </span> </div> <!-- 챕터 수 --> <div class="absolute top-4 right-4" data-astro-cid-bfderiq5> <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800" data-astro-cid-bfderiq5> ${novel.chaptersCount}화
</span> </div> <!-- 품질 점수 --> ${novel.data.rating !== void 0 && novel.data.rating > 0 && renderTemplate`<div class="absolute bottom-4 left-4" data-astro-cid-bfderiq5> <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" data-astro-cid-bfderiq5>
⭐ ${novel.data.rating} </span> </div>`} </div> <!-- 소설 정보 --> <div class="p-6 space-y-4" data-astro-cid-bfderiq5> <div data-astro-cid-bfderiq5> <h3 class="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2" data-astro-cid-bfderiq5> <a${addAttribute(`/novels/${novel.slug}`, "href")} class="block" data-astro-cid-bfderiq5> ${novel.data.title} </a> </h3> <p class="text-sm text-gray-500 mb-3" data-astro-cid-bfderiq5>by ${novel.data.author}</p> <p class="text-gray-600 text-sm leading-relaxed line-clamp-3" data-astro-cid-bfderiq5> ${novel.data.summary} </p> </div> <!-- 트렌드 태그 --> <div class="flex flex-wrap gap-2" data-astro-cid-bfderiq5> ${novel.data.tropes?.slice(0, 3).map((trope) => renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800" data-astro-cid-bfderiq5>
#${trope} </span>`)} </div> <!-- 통계 --> <div class="flex items-center justify-between text-xs text-gray-500" data-astro-cid-bfderiq5> <div class="flex items-center space-x-3" data-astro-cid-bfderiq5> <span data-astro-cid-bfderiq5>📖 ${novel.chaptersCount}화</span> <span data-astro-cid-bfderiq5>📅 ${novel.lastUpdate?.toLocaleDateString("ko-KR")}</span> </div> ${novel.latestChapter > 0 && renderTemplate`<span class="font-medium text-purple-600" data-astro-cid-bfderiq5>최신 ${novel.latestChapter}화</span>`} </div> <!-- 액션 버튼 --> <div class="pt-4" data-astro-cid-bfderiq5> <a${addAttribute(`/novels/${novel.slug}`, "href")} class="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105" data-astro-cid-bfderiq5> <span class="mr-2" data-astro-cid-bfderiq5>📖</span>
읽기 시작하기
</a> </div> </div> </div>`)} </div>`} </div> </section> `;
}, "/Users/jack/client/ro-fan/src/components/sections/NovelListSection.astro", void 0);

const $$Novels = createComponent(async ($$result, $$props, $$slots) => {
  const [novels, platformStats] = await Promise.all([
    NovelDataService.getAllNovels(),
    NovelDataService.getPlatformStats()
  ]);
  const novelStats = await NovelDataService.getNovelStats(novels);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\uB85C\uB9E8\uC2A4 \uD310\uD0C0\uC9C0 \uC5F0\uC7AC \uC18C\uC124 | RO-FAN", "description": "AI\uAC00 \uCC3D\uC870\uD558\uB294 \uBB34\uD55C\uD55C \uB85C\uB9E8\uC2A4 \uD310\uD0C0\uC9C0 \uC138\uACC4\uB97C \uD0D0\uD5D8\uD558\uC138\uC694. \uB9E4\uC77C \uC0C8\uB85C\uC6B4 \uC774\uC57C\uAE30\uB97C \uB9CC\uB098\uBCF4\uC138\uC694.", "data-astro-cid-uwndbj7d": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "LibraryHeroSection", $$LibraryHeroSection, { "totalNovels": platformStats.totalNovels, "activeNovels": platformStats.activeNovels, "totalChapters": platformStats.totalChapters, "data-astro-cid-uwndbj7d": true })} ${renderComponent($$result2, "FilterSection", $$FilterSection, { "data-astro-cid-uwndbj7d": true })} ${renderComponent($$result2, "NovelListSection", $$NovelListSection, { "novels": novelStats, "data-astro-cid-uwndbj7d": true })} ${renderComponent($$result2, "AutomationInfoSection", $$AutomationInfoSection, { "data-astro-cid-uwndbj7d": true })}  ${renderScript($$result2, "/Users/jack/client/ro-fan/src/pages/novels.astro?astro&type=script&index=0&lang.ts")} ` })} `;
}, "/Users/jack/client/ro-fan/src/pages/novels.astro", void 0);

const $$file = "/Users/jack/client/ro-fan/src/pages/novels.astro";
const $$url = "/novels";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Novels,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
