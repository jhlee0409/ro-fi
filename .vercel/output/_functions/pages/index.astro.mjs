import { c as createComponent, a as createAstro, m as maybeRenderHead, b as addAttribute, r as renderTemplate, g as renderComponent } from '../chunks/astro/server_CZqxw96B.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_7x9yZQlL.mjs';
import 'clsx';
/* empty css                                 */
import { $ as $$AutomationInfoSection } from '../chunks/AutomationInfoSection_eWvhS8_n.mjs';
import { N as NovelDataService } from '../chunks/data-services_4wvu5dAX.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro$3 = createAstro();
const $$HeroSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$HeroSection;
  const { totalNovels, totalChapters } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="relative min-h-screen flex items-center justify-center overflow-hidden"> <!-- 배경 그라디언트 --> <div class="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900"></div> <!-- 배경 파티클 효과 --> <div class="absolute inset-0 overflow-hidden"> ${[...Array(50)].map((_, i) => renderTemplate`<div class="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"${addAttribute({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 3}s`
  }, "style")}></div>`)} </div> <!-- 중앙 컨텐츠 --> <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"> <div class="space-y-8"> <!-- 메인 제목 --> <div class="space-y-4"> <h1 class="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"> <span class="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
AI가 창조하는
</span> <span class="block">로맨스 판타지</span> </h1> <p class="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
클로드 AI가 매일 새벽 2시, 완벽한 스토리 연속성으로 새로운 로맨스 판타지 세계를 선사합니다
</p> </div> <!-- 통계 카드 --> <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"> <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"> <div class="text-3xl sm:text-4xl font-bold text-white mb-2">${totalNovels}</div> <div class="text-purple-200">연재 소설</div> </div> <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"> <div class="text-3xl sm:text-4xl font-bold text-white mb-2">${totalChapters}</div> <div class="text-purple-200">총 챕터</div> </div> <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"> <div class="text-3xl sm:text-4xl font-bold text-white mb-2">100%</div> <div class="text-purple-200">AI 자동 생성</div> </div> </div> <!-- CTA 버튼 --> <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"> <a href="/novels" class="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"> <span class="relative z-10">소설 읽어보기</span> <div class="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div> </a> <a href="#latest" class="px-8 py-4 border-2 border-white/30 rounded-full text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300">
최신 업데이트 보기
</a> </div> <!-- 자동 생성 안내 --> <div class="mt-8 flex items-center justify-center space-x-3 text-purple-200"> <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> <span class="text-sm">매일 새벽 2시 새로운 에피소드 자동 업데이트</span> </div> </div> </div> <!-- 스크롤 다운 표시 --> <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"> <div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"> <div class="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div> </div> </div> </section>`;
}, "/Users/jack/client/ro-fan/src/components/sections/HeroSection.astro", void 0);

const $$Astro$2 = createAstro();
const $$NovelGrid = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$NovelGrid;
  const { novels } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="py-20 bg-gradient-to-b from-gray-50 to-white" data-astro-cid-p4pxzg2c> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-p4pxzg2c> <!-- 섹션 헤더 --> <div class="text-center mb-16" data-astro-cid-p4pxzg2c> <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" data-astro-cid-p4pxzg2c>
현재 연재 중인 소설
</h2> <p class="text-xl text-gray-600 max-w-2xl mx-auto" data-astro-cid-p4pxzg2c>
AI가 완벽한 연속성으로 창작하는 로맨스 판타지 세계를 만나보세요
</p> </div> ${novels.length === 0 ? renderTemplate`<!-- 빈 상태 -->
      <div class="text-center py-16" data-astro-cid-p4pxzg2c> <div class="text-6xl mb-6" data-astro-cid-p4pxzg2c>📖</div> <h3 class="text-2xl font-semibold text-gray-900 mb-4" data-astro-cid-p4pxzg2c>곧 새로운 소설이 시작됩니다</h3> <p class="text-gray-600" data-astro-cid-p4pxzg2c>AI가 새로운 로맨스 판타지 세계를 준비 중입니다</p> </div>` : renderTemplate`<!-- 소설 그리드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-astro-cid-p4pxzg2c> ${novels.map((novel) => renderTemplate`<div class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2" data-astro-cid-p4pxzg2c> <!-- 소설 커버 --> <div class="relative h-64 bg-gradient-to-br from-purple-400 via-pink-500 to-red-400 overflow-hidden" data-astro-cid-p4pxzg2c> ${novel.data.coverImage ? renderTemplate`<img${addAttribute(novel.data.coverImage, "src")}${addAttribute(novel.data.title, "alt")} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-astro-cid-p4pxzg2c>` : renderTemplate`<div class="w-full h-full flex items-center justify-center text-white text-6xl font-bold group-hover:scale-110 transition-transform duration-500" data-astro-cid-p4pxzg2c> ${novel.data.title[0]} </div>`} <!-- 오버레이 --> <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" data-astro-cid-p4pxzg2c></div> <!-- 상태 뱃지 --> <div class="absolute top-4 left-4" data-astro-cid-p4pxzg2c> <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" data-astro-cid-p4pxzg2c> ${novel.data.status} </span> </div> <!-- 챕터 수 --> <div class="absolute top-4 right-4" data-astro-cid-p4pxzg2c> <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800" data-astro-cid-p4pxzg2c> ${novel.chaptersCount}화
</span> </div> </div> <!-- 소설 정보 --> <div class="p-6 space-y-4" data-astro-cid-p4pxzg2c> <div data-astro-cid-p4pxzg2c> <h3 class="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2" data-astro-cid-p4pxzg2c> <a${addAttribute(`/novels/${novel.slug}`, "href")} class="block" data-astro-cid-p4pxzg2c> ${novel.data.title} </a> </h3> <p class="text-sm text-gray-500 mb-3" data-astro-cid-p4pxzg2c>by ${novel.data.author}</p> <p class="text-gray-600 text-sm leading-relaxed line-clamp-3" data-astro-cid-p4pxzg2c> ${novel.data.summary} </p> </div> <!-- 트렌드 태그 --> <div class="flex flex-wrap gap-2" data-astro-cid-p4pxzg2c> ${novel.data.tropes?.slice(0, 3).map((trope) => renderTemplate`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800" data-astro-cid-p4pxzg2c>
#${trope} </span>`)} </div> <!-- 액션 버튼 --> <div class="pt-4" data-astro-cid-p4pxzg2c> <a${addAttribute(`/novels/${novel.slug}`, "href")} class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105" data-astro-cid-p4pxzg2c>
읽기 시작하기
</a> </div> </div> </div>`)} </div>`} <!-- 더보기 버튼 --> <div class="text-center mt-12" data-astro-cid-p4pxzg2c> <a href="/novels" class="inline-flex items-center px-6 py-3 border border-purple-600 rounded-lg text-purple-600 font-medium hover:bg-purple-600 hover:text-white transition-all duration-200" data-astro-cid-p4pxzg2c>
모든 소설 보기
<svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-p4pxzg2c> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-p4pxzg2c></path> </svg> </a> </div> </div> </section> `;
}, "/Users/jack/client/ro-fan/src/components/sections/NovelGrid.astro", void 0);

const $$Astro$1 = createAstro();
const $$LatestUpdates = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$LatestUpdates;
  const { latestChapters } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section id="latest" class="py-20 bg-gray-50" data-astro-cid-l6xlz2jy> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-l6xlz2jy> <!-- 섹션 헤더 --> <div class="text-center mb-16" data-astro-cid-l6xlz2jy> <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" data-astro-cid-l6xlz2jy>
최신 업데이트
</h2> <p class="text-xl text-gray-600 max-w-2xl mx-auto" data-astro-cid-l6xlz2jy>
방금 전 AI가 창작한 따끈따끈한 새 에피소드들
</p> </div> ${latestChapters.length === 0 ? renderTemplate`<!-- 빈 상태 -->
      <div class="text-center py-16" data-astro-cid-l6xlz2jy> <div class="text-6xl mb-6" data-astro-cid-l6xlz2jy>⏰</div> <h3 class="text-2xl font-semibold text-gray-900 mb-4" data-astro-cid-l6xlz2jy>새로운 업데이트를 준비 중입니다</h3> <p class="text-gray-600" data-astro-cid-l6xlz2jy>매일 새벽 2시에 새로운 에피소드가 업데이트됩니다</p> </div>` : renderTemplate`<!-- 최신 챕터 리스트 -->
      <div class="space-y-6" data-astro-cid-l6xlz2jy> ${latestChapters.map((item, index) => renderTemplate`<div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden" data-astro-cid-l6xlz2jy> <div class="p-6 sm:p-8" data-astro-cid-l6xlz2jy> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between" data-astro-cid-l6xlz2jy> <div class="flex-1" data-astro-cid-l6xlz2jy> <div class="flex items-center space-x-3 mb-3" data-astro-cid-l6xlz2jy> <div class="flex-shrink-0" data-astro-cid-l6xlz2jy> <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold" data-astro-cid-l6xlz2jy> ${index + 1} </div> </div> <div class="flex items-center space-x-2 text-sm text-gray-500" data-astro-cid-l6xlz2jy> <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium" data-astro-cid-l6xlz2jy> ${item.novel.data.title} </span> <span data-astro-cid-l6xlz2jy>•</span> <span data-astro-cid-l6xlz2jy>${item.chapter.data.chapterNumber}화</span> <span data-astro-cid-l6xlz2jy>•</span> <span data-astro-cid-l6xlz2jy>${item.chapter.data.publicationDate.toLocaleDateString("ko-KR")}</span> </div> </div> <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors" data-astro-cid-l6xlz2jy> <a${addAttribute(`/novels/${item.novel.slug}/chapter/${item.chapter.data.chapterNumber}`, "href")} data-astro-cid-l6xlz2jy> ${item.chapter.data.title} </a> </h3> ${item.chapter.data.summary && renderTemplate`<p class="text-gray-600 leading-relaxed line-clamp-2" data-astro-cid-l6xlz2jy> ${item.chapter.data.summary} </p>`} </div> <div class="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0" data-astro-cid-l6xlz2jy> <a${addAttribute(`/novels/${item.novel.slug}/chapter/${item.chapter.data.chapterNumber}`, "href")} class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105" data-astro-cid-l6xlz2jy>
지금 읽기
</a> </div> </div> </div> </div>`)} </div>`} </div> </section> `;
}, "/Users/jack/client/ro-fan/src/components/sections/LatestUpdates.astro", void 0);

const $$Astro = createAstro();
const $$TrendSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TrendSection;
  const { tropes } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="py-20 bg-white"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- 섹션 헤더 --> <div class="text-center mb-16"> <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
인기 로맨스 트렌드
</h2> <p class="text-xl text-gray-600 max-w-2xl mx-auto">
지금 가장 사랑받는 로맨스 판타지 트렌드들
</p> </div> <!-- 트렌드 그리드 --> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> ${tropes.map((trope) => renderTemplate`<div class="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"> <div class="text-2xl mb-3">💝</div> <h3 class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors"> ${trope.data.name} </h3> <p class="text-gray-600 text-sm leading-relaxed"> ${trope.data.description} </p> </div>`)} </div> </div> </section>`;
}, "/Users/jack/client/ro-fan/src/components/sections/TrendSection.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const [novels, latestChapters, tropes, platformStats] = await Promise.all([
    NovelDataService.getAllNovels(),
    NovelDataService.getLatestChapters(3),
    NovelDataService.getPopularTropes(6),
    NovelDataService.getPlatformStats()
  ]);
  const novelStats = await NovelDataService.getNovelStats(novels);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "RO-FAN - AI \uB85C\uB9E8\uC2A4 \uD310\uD0C0\uC9C0 \uD50C\uB7AB\uD3FC", "description": "\uD074\uB85C\uB4DC AI\uAC00 \uB9E4\uC77C \uC0C8\uBCBD 2\uC2DC, \uC644\uBCBD\uD55C \uC2A4\uD1A0\uB9AC \uC5F0\uC18D\uC131\uC73C\uB85C \uC0C8\uB85C\uC6B4 \uB85C\uB9E8\uC2A4 \uD310\uD0C0\uC9C0 \uC138\uACC4\uB97C \uC120\uC0AC\uD569\uB2C8\uB2E4" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "HeroSection", $$HeroSection, { "totalNovels": platformStats.totalNovels, "totalChapters": platformStats.totalChapters })} ${renderComponent($$result2, "NovelGrid", $$NovelGrid, { "novels": novelStats })} ${renderComponent($$result2, "LatestUpdates", $$LatestUpdates, { "latestChapters": latestChapters })} ${renderComponent($$result2, "TrendSection", $$TrendSection, { "tropes": tropes })} ${renderComponent($$result2, "AutomationInfoSection", $$AutomationInfoSection, {})} ` })}`;
}, "/Users/jack/client/ro-fan/src/pages/index.astro", void 0);

const $$file = "/Users/jack/client/ro-fan/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
