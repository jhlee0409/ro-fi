import { c as createComponent, a as createAstro, b as addAttribute, d as renderHead, e as renderSlot, r as renderTemplate, m as maybeRenderHead, g as renderComponent, f as renderScript } from '../chunks/astro/server_CZqxw96B.mjs';
import 'kleur/colors';
import 'clsx';
import { N as NovelDataService } from '../chunks/data-services_4wvu5dAX.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro$3 = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "RO-FAN \uAD00\uB9AC \uD398\uC774\uC9C0",
    minimal = false
  } = Astro2.props;
  return renderTemplate`<html lang="ko"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><meta name="robots" content="noindex, nofollow"><link rel="icon" type="image/svg+xml" href="/favicon.svg">${!minimal && renderTemplate`<style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1f2937;
        background-color: #f9fafb;
        min-height: 100vh;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .header {
        background: white;
        border-bottom: 1px solid #e5e7eb;
        padding: 1rem 0;
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo {
        font-size: 1.5rem;
        font-weight: 700;
        color: #7c3aed;
        text-decoration: none;
      }

      .nav-links {
        display: flex;
        gap: 1.5rem;
        list-style: none;
        margin: 0;
      }

      .nav-links a {
        text-decoration: none;
        color: #6b7280;
        font-weight: 500;
        transition: color 0.2s;
      }

      .nav-links a:hover {
        color: #7c3aed;
      }

      .main {
        min-height: calc(100vh - 120px);
        padding: 2rem 0;
      }

      .footer {
        background: #374151;
        color: #d1d5db;
        text-align: center;
        padding: 1.5rem 0;
        margin-top: 2rem;
        font-size: 0.875rem;
      }

      /* 반응형 */
      @media (max-width: 768px) {
        .nav {
          flex-direction: column;
          gap: 1rem;
        }
        
        .nav-links {
          flex-wrap: wrap;
          justify-content: center;
        }
      }
    </style>`}${renderHead()}</head> <body> ${!minimal && renderTemplate`<header class="header"> <nav class="nav container"> <a href="/" class="logo">RO-FAN</a> <ul class="nav-links"> <li><a href="/">홈</a></li> <li><a href="/novels">소설</a></li> <li><a href="/admin">관리</a></li> </ul> </nav> </header>`} <main${addAttribute(minimal ? "" : "main container", "class")}> ${renderSlot($$result, $$slots["default"])} </main> ${!minimal && renderTemplate`<footer class="footer"> <div class="container"> <p>&copy; 2024 RO-FAN. AI 기반 로맨스 판타지 플랫폼</p> </div> </footer>`} </body></html>`;
}, "/Users/jack/client/ro-fan/src/layouts/BaseLayout.astro", void 0);

const $$Astro$2 = createAstro();
const $$AdminDashboard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AdminDashboard;
  const { novels, tropes, platformStats } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100"> <!-- 헤더 --> <header class="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex justify-between items-center h-16"> <!-- 브랜드 --> <div class="flex items-center space-x-4"> <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"> <span class="text-white text-xl">🌹</span> </div> <div> <h1 class="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
RO-FAN Admin
</h1> <p class="text-xs text-gray-500">AI Story Management</p> </div> </div> <!-- 상태 표시 --> <div class="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full"> <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> <span class="text-sm text-green-700">Claude AI 연결됨</span> </div> <!-- 로그아웃 --> <form method="POST" class="inline"> <input type="hidden" name="logout" value="true"> <button type="submit" class="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"> <span>🚪</span> <span>로그아웃</span> </button> </form> </div> </div> </header> <!-- 메인 컨텐츠 --> <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <!-- 통계 대시보드 --> <section class="mb-8"> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> <!-- 연재 소설 --> <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"> <div class="flex items-center justify-between"> <div> <p class="text-sm font-medium text-gray-600">연재 소설</p> <p class="text-3xl font-bold text-gray-900">${platformStats.totalNovels}</p> <p class="text-xs text-green-600 mt-1">+2 이번 주</p> </div> <div class="text-3xl">📚</div> </div> </div> <!-- 총 챕터 --> <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"> <div class="flex items-center justify-between"> <div> <p class="text-sm font-medium text-gray-600">총 챕터</p> <p class="text-3xl font-bold text-gray-900">${platformStats.totalChapters}</p> <p class="text-xs text-green-600 mt-1">+15 이번 주</p> </div> <div class="text-3xl">📝</div> </div> </div> <!-- 평균 품질 --> <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"> <div class="flex items-center justify-between"> <div> <p class="text-sm font-medium text-gray-600">평균 품질</p> <p class="text-3xl font-bold text-gray-900">8.6/10</p> <p class="text-xs text-green-600 mt-1">+0.2 이번 주</p> </div> <div class="text-3xl">⭐</div> </div> </div> <!-- AI 생성률 --> <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"> <div class="flex items-center justify-between"> <div> <p class="text-sm font-medium text-gray-600">AI 생성률</p> <p class="text-3xl font-bold text-gray-900">100%</p> <p class="text-xs text-gray-600 mt-1">안정적</p> </div> <div class="text-3xl">🤖</div> </div> </div> </div> </section> <!-- AI 창작 도구 섹션 --> <section> <div class="text-center mb-8"> <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
🎭 AI 창작 도구
</h2> <p class="text-gray-600 max-w-2xl mx-auto">
Claude AI를 활용한 고품질 로맨스 판타지 콘텐츠 생성
</p> </div> <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"> <!-- 플롯 생성 도구 --> <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"> <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center"> <div class="text-4xl mb-3">📖</div> <h3 class="text-xl font-semibold text-gray-900 mb-2">새 소설 플롯 생성</h3> <p class="text-sm text-gray-600">AI가 완벽한 스토리 구조를 설계합니다</p> </div> <div class="p-6"> <form class="space-y-4" id="plotForm"> <div> <label class="block text-sm font-medium text-gray-700 mb-2">소설 제목</label> <input type="text" name="title" placeholder="예: 붉은 운명의 마법사" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">트렌드 선택 (최대 3개)</label> <div class="space-y-2 max-h-32 overflow-y-auto"> ${tropes.map((trope) => renderTemplate`<label class="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"> <input type="checkbox" name="tropes"${addAttribute(trope.id, "value")} class="mr-3"> <div class="flex-1"> <span class="text-sm font-medium">${trope.data.name}</span> <p class="text-xs text-gray-500">${trope.data.description.slice(0, 60)}...</p> </div> </label>`)} </div> </div> <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center space-x-2"> <span>🔮</span> <span>플롯 생성하기</span> </button> </form> <div id="plotResult" class="mt-4"></div> </div> </div> <!-- 챕터 생성 도구 --> <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"> <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center"> <div class="text-4xl mb-3">📝</div> <h3 class="text-xl font-semibold text-gray-900 mb-2">새 챕터 생성</h3> <p class="text-sm text-gray-600">기존 스토리의 완벽한 연속성을 유지하며 새 챕터를 작성합니다</p> </div> <div class="p-6"> <form class="space-y-4" id="chapterForm"> <div> <label class="block text-sm font-medium text-gray-700 mb-2">연재 소설 선택</label> <select name="novel" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"> <option value="">소설을 선택하세요</option> ${novels.map((novel) => renderTemplate`<option${addAttribute(novel.data.slug || novel.id, "value")}> ${novel.data.title} (현재 ${novel.data.totalChapters}화)
</option>`)} </select> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">챕터 번호</label> <input type="number" name="chapterNumber" min="1" value="1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">이전 챕터 요약 (선택사항)</label> <textarea name="previousContext" rows="3" placeholder="이전 챕터에서 일어난 주요 사건들을 요약해주세요..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea> </div> <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center space-x-2"> <span>✍️</span> <span>챕터 생성하기</span> </button> </form> <div id="chapterResult" class="mt-4"></div> </div> </div> <!-- 챕터 개선 도구 --> <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"> <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center"> <div class="text-4xl mb-3">🔧</div> <h3 class="text-xl font-semibold text-gray-900 mb-2">챕터 품질 개선</h3> <p class="text-sm text-gray-600">AI가 기존 챕터를 분석하고 더 나은 버전으로 개선합니다</p> </div> <div class="p-6"> <form class="space-y-4" id="improveForm"> <div> <label class="block text-sm font-medium text-gray-700 mb-2">개선할 챕터 내용</label> <textarea name="originalChapter" rows="6" placeholder="개선하고 싶은 챕터의 전체 내용을 붙여넣으세요..." required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">개선 기준 선택</label> <div class="space-y-2"> <label class="flex items-center"> <input type="checkbox" name="criteria" value="대화가 캐릭터의 성격에 부합하는가" checked class="mr-2"> <span class="text-sm">캐릭터 일관성</span> </label> <label class="flex items-center"> <input type="checkbox" name="criteria" value="전개 속도가 효과적인가" checked class="mr-2"> <span class="text-sm">스토리 전개</span> </label> <label class="flex items-center"> <input type="checkbox" name="criteria" value="로맨틱한 긴장감이 충분한가" checked class="mr-2"> <span class="text-sm">로맨틱 긴장감</span> </label> <label class="flex items-center"> <input type="checkbox" name="criteria" value="장면 묘사가 생생한가" checked class="mr-2"> <span class="text-sm">장면 묘사</span> </label> </div> </div> <button type="submit" class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center space-x-2"> <span>🚀</span> <span>챕터 개선하기</span> </button> </form> <div id="improveResult" class="mt-4"></div> </div> </div> </div> </section> </main> </div>`;
}, "/Users/jack/client/ro-fan/src/components/AdminDashboard.astro", void 0);

const $$Astro$1 = createAstro();
const $$AdminLogin = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$AdminLogin;
  const { onLogin } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center"> <div class="max-w-md w-full mx-4"> <!-- 로그인 카드 --> <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"> <!-- 브랜드 --> <div class="text-center mb-8"> <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"> <span class="text-3xl text-white">🌹</span> </div> <h1 class="text-2xl font-bold text-white mb-2">RO-FAN Admin</h1> <p class="text-purple-200">AI 스토리 관리 시스템</p> </div> <!-- 로그인 폼 --> <form method="POST" class="space-y-6"> <div> <label for="password" class="block text-sm font-medium text-purple-200 mb-2">
관리자 패스워드
</label> <input type="password" id="password" name="password" required class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-300" placeholder="패스워드를 입력하세요"> </div> <button type="submit" class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
로그인
</button> </form> <!-- 보안 안내 --> <div class="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg"> <div class="flex items-center"> <span class="text-yellow-300 mr-2">⚠️</span> <p class="text-sm text-yellow-200">
인증된 관리자만 접근할 수 있습니다
</p> </div> </div> </div> <!-- AI 상태 --> <div class="mt-6 text-center"> <div class="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full"> <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> <span class="text-sm text-green-200">Claude AI 시스템 정상 운영 중</span> </div> </div> </div> </div>`;
}, "/Users/jack/client/ro-fan/src/components/AdminLogin.astro", void 0);

const $$Astro = createAstro();
const $$Admin = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Admin;
  const ADMIN_PASSWORD = "zxc123";
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const password = formData.get("password")?.toString()?.trim();
    const logout = formData.get("logout");
    if (logout) {
      Astro2.cookies.delete("admin_auth", {
        path: "/",
        domain: Astro2.url.hostname
      });
      return Astro2.redirect("/", 302);
    }
    if (password) {
      if (password === ADMIN_PASSWORD) {
        Astro2.cookies.set("admin_auth", "authenticated", {
          maxAge: 60 * 60 * 4,
          // 4시간
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/"
        });
        return Astro2.redirect("/admin", 302);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        return Astro2.redirect("/", 302);
      }
    }
  }
  const authCookie = Astro2.cookies.get("admin_auth");
  const isAuthenticated = authCookie?.value === "authenticated";
  let novels = [];
  let tropes = [];
  let platformStats = { totalNovels: 0, totalChapters: 0, activeNovels: 0 };
  if (isAuthenticated) {
    try {
      [novels, tropes, platformStats] = await Promise.all([
        NovelDataService.getAllNovels(),
        NovelDataService.getAllTropes(),
        NovelDataService.getPlatformStats()
      ]);
    } catch (error) {
      console.error("Failed to load collections:", error);
    }
  }
  const handleLogin = `
async function handleLogin(password) {
  const formData = new FormData();
  formData.append('password', password);

  const response = await fetch('/admin', {
    method: 'POST',
    body: formData
  });

  if (response.redirected) {
    window.location.href = response.url;
  }
}`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "관리자 페이지 - AI 스토리 생성", "description": "RO-FAN AI 스토리 생성 관리자 대시보드" }, { "default": async ($$result2) => renderTemplate`${!isAuthenticated ? renderTemplate`${renderComponent($$result2, "AdminLogin", $$AdminLogin, { "onLogin": handleLogin })}` : renderTemplate`${renderComponent($$result2, "AdminDashboard", $$AdminDashboard, { "novels": novels, "tropes": tropes, "platformStats": platformStats })}`}` })} ${renderScript($$result, "/Users/jack/client/ro-fan/src/pages/admin.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/jack/client/ro-fan/src/pages/admin.astro", void 0);
const $$file = "/Users/jack/client/ro-fan/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
