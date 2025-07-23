import { g as getCollection } from './_astro_content_DAgQ3AmO.mjs';

class NovelDataService {
  /**
   * 모든 소설 데이터 가져오기
   */
  static async getAllNovels() {
    return await getCollection("novels");
  }
  /**
   * 모든 챕터 데이터 가져오기
   */
  static async getAllChapters() {
    return await getCollection("chapters");
  }
  /**
   * 모든 트렌드 데이터 가져오기
   */
  static async getAllTropes() {
    return await getCollection("tropes");
  }
  /**
   * 연재 중인 소설들만 필터링
   */
  static async getActiveNovels() {
    const novels = await this.getAllNovels();
    return novels.filter((novel) => novel.data.status === "연재 중");
  }
  /**
   * 완결된 소설들만 필터링
   */
  static async getCompletedNovels() {
    const novels = await this.getAllNovels();
    return novels.filter((novel) => novel.data.status === "완결");
  }
  /**
   * 특정 소설의 챕터들 가져오기 (정렬됨)
   */
  static async getNovelChapters(novelSlug) {
    const chapters = await this.getAllChapters();
    return chapters.filter((chapter) => chapter.data.novel === novelSlug).sort((a, b) => a.data.chapterNumber - b.data.chapterNumber);
  }
  /**
   * 소설별 상세 통계 계산
   */
  static async getNovelStats(novels) {
    const allNovels = novels || await this.getAllNovels();
    const allChapters = await this.getAllChapters();
    return allNovels.map((novel) => {
      const novelChapters = allChapters.filter((chapter) => chapter.data.novel === novel.slug);
      const latestChapter = novelChapters.length > 0 ? Math.max(...novelChapters.map((ch) => ch.data.chapterNumber)) : 0;
      const totalWords = novelChapters.reduce((sum, chapter) => sum + (chapter.data.wordCount || 1e3), 0);
      const avgRating = novelChapters.length > 0 ? Number((novelChapters.reduce((sum, chapter) => sum + (chapter.data.rating || 0), 0) / novelChapters.length).toFixed(1)) : Number((novel.data.rating || 0).toFixed(1));
      const lastUpdate = novelChapters.length > 0 ? new Date(Math.max(...novelChapters.map((ch) => new Date(ch.data.publicationDate).getTime()))) : novel.data.publishedDate || /* @__PURE__ */ new Date();
      const progressPercentage = novel.data.totalChapters > 0 ? Math.round(novelChapters.length / novel.data.totalChapters * 100) : 0;
      return {
        slug: novel.slug,
        data: novel.data,
        chaptersCount: novelChapters.length,
        latestChapter,
        lastUpdate,
        progressPercentage,
        avgRating,
        totalWords
      };
    }).sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime());
  }
  /**
   * 최신 챕터들 가져오기 (소설 정보 포함)
   */
  static async getLatestChapters(limit = 3) {
    const chapters = await this.getAllChapters();
    const novels = await this.getAllNovels();
    const latestChapters = chapters.sort((a, b) => b.data.publicationDate.getTime() - a.data.publicationDate.getTime()).slice(0, limit);
    return latestChapters.map((chapter) => {
      const novel = novels.find((n) => n.slug === chapter.data.novel);
      if (!novel) {
        throw new Error(`Novel not found for chapter: ${chapter.data.novel}`);
      }
      return { chapter, novel };
    });
  }
  /**
   * 인기 트렌드 가져오기
   */
  static async getPopularTropes(limit = 6) {
    const tropes = await this.getAllTropes();
    return tropes.slice(0, limit);
  }
  /**
   * 특정 소설 찾기
   */
  static async getNovelBySlug(slug) {
    const novels = await this.getAllNovels();
    return novels.find((novel) => novel.slug === slug) || null;
  }
  /**
   * 특정 챕터 찾기
   */
  static async getChapterBySlugAndNumber(novelSlug, chapterNumber) {
    const chapters = await this.getNovelChapters(novelSlug);
    return chapters.find((chapter) => chapter.data.chapterNumber === chapterNumber) || null;
  }
  /**
   * 전체 플랫폼 통계
   */
  static async getPlatformStats() {
    const novels = await this.getAllNovels();
    const chapters = await this.getAllChapters();
    const activeNovels = novels.filter((n) => n.data.status === "연재 중").length;
    const completedNovels = novels.filter((n) => n.data.status === "완결").length;
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.data.wordCount || 1e3), 0);
    const avgQuality = chapters.length > 0 ? Number((chapters.reduce((sum, ch) => sum + (ch.data.rating || 0), 0) / chapters.length).toFixed(1)) : 0;
    return {
      totalNovels: novels.length,
      activeNovels,
      completedNovels,
      totalChapters: chapters.length,
      totalWords,
      avgQuality
    };
  }
}

export { NovelDataService as N };
