const DataLoader = {
  cache: {},

  async load(category) {
    if (this.cache[category]) {
      return this.cache[category];
    }

    const fileMap = {
      hiragana: 'data/hiragana.json',
      katakana: 'data/katakana.json',
      nouns: 'data/nouns.json',
      verbs: 'data/verbs.json',
      adjectives: 'data/adjectives.json',
      kanji: 'data/kanji.json',
      'kotoba-n5': 'data/database/kotoba-n5.json',
      'kanji-n5': 'data/database/kanji-n5.json',
      'bunpou-n5': 'data/database/bunpou-n5.json',
      'kaiwa-n5': 'data/database/kaiwa-n5.json'
    };

    const filePath = fileMap[category];
    if (!filePath) {
      throw new Error(`Unknown category: ${category}`);
    }

    try {
      const cacheBust = '?v=' + Date.now();
      const response = await fetch(filePath + cacheBust);
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}`);
      }
      const data = await response.json();
      this.cache[category] = data;
      return data;
    } catch (error) {
      console.error(`Error loading ${category}:`, error);
      return null;
    }
  },

  async getCategories() {
    const categories = ['hiragana', 'katakana', 'nouns', 'verbs', 'adjectives', 'kanji', 'kotoba-n5', 'kanji-n5', 'bunpou-n5', 'kaiwa-n5'];
    const results = {};

    for (const cat of categories) {
      results[cat] = await this.load(cat);
    }

    return results;
  },

  async getLevels(category) {
    const data = await this.load(category);
    if (!data) return [];
    if (data.babs) {
      return data.babs.map(b => ({
        level: b.bab,
        questionCount: b.points ? b.points.length : 0
      }));
    }
    if (!data.levels) return [];
    return data.levels.map(l => ({
      level: l.level,
      questionCount: l.questions.length
    }));
  },

  async getQuestions(category, level) {
    const data = await this.load(category);
    if (!data || !data.levels) return [];

    const levelData = data.levels.find(l => l.level === level);
    if (!levelData) return [];

    return levelData.questions;
  },

  async getCategoryData(category) {
    return await this.load(category);
  },

  getCategoryInfo(category) {
    const info = {
      hiragana: { name: 'Hiragana', jp: 'ひらがな', romaji: 'Hiragana' },
      katakana: { name: 'Katakana', jp: 'カタカナ', romaji: 'Katakana' },
      nouns: { name: 'Kata Benda', jp: '名詞', romaji: 'Meishi' },
      verbs: { name: 'Kata Kerja', jp: '動詞', romaji: 'Doushi' },
      adjectives: { name: 'Kata Sifat', jp: '形容詞', romaji: 'Keiyoushi' },
      kanji: { name: 'Kuis Khusus Kanji', jp: '漢字', romaji: 'Kanji' },
      'kotoba-n5': { name: 'Kosakata N5', jp: '語彙 N5', romaji: 'Kotoba N5' },
      'kanji-n5': { name: 'Kanji N5', jp: '漢字 N5', romaji: 'Kanji N5' },
      'bunpou-n5': { name: 'Tata Bahasa N5', jp: '文法 N5', romaji: 'Bunpou N5' },
      'kaiwa-n5': { name: 'Kaiwa N5', jp: '会話 N5', romaji: 'Kaiwa N5' }
    };
    return info[category] || { name: category, jp: '', romaji: '' };
  },

  isHiraganaKatakana(category) {
    return category === 'hiragana' || category === 'katakana';
  }
};
