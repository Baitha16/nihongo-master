const API_BASE = 'https://autohotkey-eight.vercel.app';

function getHWID() {
  const STORAGE_KEY = 'nihongo-master-hwid';
  let hwid = localStorage.getItem(STORAGE_KEY);
  if (hwid) return hwid;

  const ua = navigator.userAgent;
  const lang = navigator.language || '';
  const screenRes = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const cores = navigator.hardwareConcurrency || 0;
  const memory = navigator.deviceMemory || 0;
  const platform = navigator.platform || '';

  const raw = `${ua}|${lang}|${screenRes}|${timezone}|${cores}|${memory}|${platform}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  hwid = 'HWID-' + Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
  localStorage.setItem(STORAGE_KEY, hwid);
  return hwid;
}

const UserStorage = {
  _prefix: '',
  setPrefix(licenseCode) {
    this._prefix = licenseCode ? `nm-${licenseCode}-` : '';
  },
  get(key) {
    return localStorage.getItem(this._prefix + key);
  },
  set(key, value) {
    localStorage.setItem(this._prefix + key, value);
  },
  remove(key) {
    localStorage.removeItem(this._prefix + key);
  }
};

const App = {
  currentScreen: 'home',
  currentCategory: null,
  currentLevel: null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  score: 0,
  answers: [],
  isAnswered: false,
  streak: 0,
  bestScore: 0,
  masteredWords: {},
  studiedWords: {},
  isShuffled: false,
  isReversed: false,

  init() {
    const savedLicense = localStorage.getItem('nihongo-master-license');
    if (savedLicense) {
      this._setLoggedIn(savedLicense);
    }
    this.bindEvents();
    this.initTheme();
  },

  _setLoggedIn(licenseCode) {
    this.licenseCode = licenseCode;
    UserStorage.setPrefix(licenseCode);
    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('screen-login').style.display = 'none';
    document.getElementById('app-main').style.display = '';
    this.loadProgress();
    this.updateStats();
    this.updateProgressRings();
    this.updateMarkedWordsSection();
    this.showUserProfile();
    this.startLicenseCheck();
  },

  showUserProfile() {
    try {
      const info = JSON.parse(localStorage.getItem('nihongo-master-license-info') || '{}');
      const owner = info.owner || 'User';
      const type = info.membership_type || '';
      const expiresAt = info.expires_at;
      const isLifetime = type.toLowerCase() === 'lifetime';

      document.getElementById('user-name').textContent = owner;
      document.getElementById('dropdown-owner').textContent = owner;
      document.getElementById('dropdown-type').textContent = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A';

      const countdownEl = document.getElementById('dropdown-countdown');
      if (isLifetime) {
        countdownEl.textContent = '∞ Lifetime';
        countdownEl.className = 'dropdown-countdown lifetime';
        if (this._countdownInterval) clearInterval(this._countdownInterval);
      } else if (expiresAt) {
        this._updateCountdown(expiresAt);
        this._countdownInterval = setInterval(() => this._updateCountdown(expiresAt), 1000);
      } else {
        countdownEl.textContent = '';
        countdownEl.className = 'dropdown-countdown';
      }
    } catch (e) {}
  },

  _updateCountdown(expiresAt) {
    const el = document.getElementById('dropdown-countdown');
    if (!el) return;
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      el.textContent = '⏱ Expired';
      el.className = 'dropdown-countdown expired';
      this.logout();
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (days > 0) {
      el.textContent = `⏱ ${days}h ${hours}j ${minutes}m`;
    } else if (hours > 0) {
      el.textContent = `⏱ ${hours}j ${minutes}m ${seconds}s`;
    } else {
      el.textContent = `⏱ ${minutes}m ${seconds}s`;
    }
    el.className = 'dropdown-countdown';
  },

  _licenseCheckInterval: null,
  startLicenseCheck() {
    if (this._licenseCheckInterval) clearInterval(this._licenseCheckInterval);
    this._licenseCheckInterval = setInterval(() => this.checkLicenseValid(), 60000);
  },

  async checkLicenseValid() {
    if (!this.licenseCode) return;
    try {
      const hwid = getHWID();
      const res = await fetch(`${API_BASE}/api/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_code: this.licenseCode,
          hwid: hwid,
          program_type: 'Nihongo Master'
        })
      });
      const data = await res.json();
      if (!data.success) {
        alert('Lisensi tidak valid: ' + (data.error || 'Unknown'));
        this.logout();
      } else {
        localStorage.setItem('nihongo-master-license-info', JSON.stringify({
          owner: data.owner || '',
          membership_type: data.membership_type || '',
          expires_at: data.expires_at || ''
        }));
        this.showUserProfile();
      }
    } catch (e) {
      console.log('License check failed (offline?)');
    }
  },

  async login(licenseCode) {
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('btn-activate');
    const input = document.getElementById('license-input');

    errorEl.textContent = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="login-loading"></span>';

    try {
      const hwid = getHWID();
      const res = await fetch(`${API_BASE}/api/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_code: licenseCode,
          hwid: hwid,
          program_type: 'Nihongo Master'
        })
      });

      const data = await res.json();

      if (!data.success) {
        errorEl.textContent = data.error || 'Gagal memverifikasi lisensi';
        btn.disabled = false;
        btn.textContent = 'Aktivasi';
        return;
      }

      localStorage.setItem('nihongo-master-license', licenseCode);
      localStorage.setItem('nihongo-master-license-info', JSON.stringify({
        owner: data.owner || '',
        membership_type: data.membership_type || '',
        expires_at: data.expires_at || ''
      }));
      this._setLoggedIn(licenseCode);
    } catch (err) {
      errorEl.textContent = 'Gagal terhubung ke server. Coba lagi.';
      btn.disabled = false;
      btn.textContent = 'Aktivasi';
    }
  },

  logout() {
    localStorage.removeItem('nihongo-master-license');
    localStorage.removeItem('nihongo-master-license-info');
    this.licenseCode = null;
    if (this._countdownInterval) clearInterval(this._countdownInterval);
    if (this._licenseCheckInterval) clearInterval(this._licenseCheckInterval);
    UserStorage.setPrefix('');
    document.getElementById('app-main').style.display = 'none';
    const loginScreen = document.getElementById('screen-login');
    loginScreen.style.display = '';
    loginScreen.classList.add('active');
    document.getElementById('license-input').value = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('btn-activate').disabled = false;
    document.getElementById('btn-activate').textContent = 'Aktivasi';
    document.getElementById('user-dropdown').classList.remove('active');
  },

  loadProgress() {
    try {
      const saved = UserStorage.get('progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.masteredWords = data.masteredWords || {};
        this.studiedWords = data.studiedWords || {};
        this.streak = data.streak || 0;
        this.bestScore = Math.min(100, data.bestScore || 0);
      }
    } catch (e) {
      console.log('No saved progress found');
    }
    this.syncProgressFromAPI();
  },

  saveProgress() {
    const data = {
      masteredWords: this.masteredWords,
      studiedWords: this.studiedWords,
      streak: this.streak,
      bestScore: this.bestScore
    };
    try {
      UserStorage.set('progress', JSON.stringify(data));
    } catch (e) {
      console.log('Could not save progress locally');
    }
    this.debouncedSyncToAPI();
  },

  _syncTimeout: null,
  debouncedSyncToAPI() {
    if (this._syncTimeout) clearTimeout(this._syncTimeout);
    this._syncTimeout = setTimeout(() => this.syncProgressToAPI(), 2000);
  },

  async syncProgressToAPI() {
    if (!this.licenseCode) return;
    try {
      const allMarked = this.loadAllMarkedWords();
      const completedLevels = {};
      const categories = ['hiragana','katakana','nouns','verbs','adjectives','kanji','kotoba-n5','kanji-n5','bunpou-n5'];
      categories.forEach(cat => {
        const total = this.getCategoryTotalLevels(cat);
        for (let i = 1; i <= total; i++) {
          const key = `${cat}-level-${i}`;
          const completed = UserStorage.get(`completed-${key}`) === 'true';
          const score = parseInt(UserStorage.get(`score-${key}`) || '0');
          if (completed || score > 0) {
            completedLevels[key] = { completed, score };
          }
        }
      });
      const bunpouUnderstand = {};
      for (let b = 1; b <= 25; b++) {
        const val = UserStorage.get('bunpou-understand-bab' + b);
        if (val) bunpouUnderstand['bab' + b] = JSON.parse(val);
      }

      await fetch(`${API_BASE}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_code: this.licenseCode,
          progress: { masteredWords: this.masteredWords, studiedWords: this.studiedWords, streak: this.streak, bestScore: this.bestScore },
          marked_words: allMarked,
          bunpou_understand: bunpouUnderstand,
          completed_levels: completedLevels
        })
      });
    } catch (e) {
      console.log('Could not sync progress to API');
    }
  },

  async syncProgressFromAPI() {
    if (!this.licenseCode) return;
    try {
      const res = await fetch(`${API_BASE}/api/progress?license_code=${encodeURIComponent(this.licenseCode)}`);
      const data = await res.json();
      if (!data.success) return;

      const serverProgress = data.progress || {};
      if (serverProgress.masteredWords && Object.keys(serverProgress.masteredWords).length > 0) {
        this.masteredWords = { ...serverProgress.masteredWords, ...this.masteredWords };
        this.studiedWords = { ...serverProgress.studiedWords, ...this.studiedWords };
        this.streak = serverProgress.streak || this.streak;
        this.bestScore = Math.min(100, Math.max(serverProgress.bestScore || 0, this.bestScore));
        this.saveProgress();
      }

      const serverMarked = data.marked_words || {};
      if (Object.keys(serverMarked).length > 0) {
        const localMarked = this.loadAllMarkedWords();
        const merged = { ...serverMarked };
        Object.entries(localMarked).forEach(([key, words]) => {
          if (merged[key]) {
            const ids = new Set(merged[key].map(w => w.id));
            words.forEach(w => { if (!ids.has(w.id)) merged[key].push(w); });
          } else {
            merged[key] = words;
          }
        });
        UserStorage.set('marked-words', JSON.stringify(merged));
      }

      const serverCompleted = data.completed_levels || {};
      Object.entries(serverCompleted).forEach(([key, val]) => {
        if (val.completed) UserStorage.set(`completed-${key}`, 'true');
        if (val.score > 0) UserStorage.set(`score-${key}`, val.score);
      });

      const serverBunpou = data.bunpou_understand || {};
      Object.entries(serverBunpou).forEach(([bab, state]) => {
        const storageKey = 'bunpou-understand-' + bab;
        if (!UserStorage.get(storageKey)) {
          UserStorage.set(storageKey, JSON.stringify(state));
        }
      });

      this.updateStats();
      this.updateProgressRings();
      this.updateMarkedWordsSection();
    } catch (e) {
      console.log('Could not sync progress from API');
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('nihongo-master-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  bindEvents() {
    document.getElementById('btn-activate').addEventListener('click', () => {
      const code = document.getElementById('license-input').value.trim().toUpperCase();
      if (!code) {
        document.getElementById('login-error').textContent = 'Masukkan kode lisensi';
        return;
      }
      this.login(code);
    });
    document.getElementById('license-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-activate').click();
    });
    document.getElementById('btn-logout').addEventListener('click', () => this.logout());
    document.getElementById('user-profile').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('user-dropdown').classList.toggle('active');
    });
    document.addEventListener('click', () => {
      document.getElementById('user-dropdown').classList.remove('active');
    });
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('btn-back-home').addEventListener('click', () => {
      this.saveMarkedWords();
      this.showScreen('home');
    });
    document.getElementById('btn-back-levels').addEventListener('click', () => {
      this.saveMarkedWords();
      this.showScreen('levels');
    });
    document.getElementById('btn-back-result').addEventListener('click', () => this.showScreen('result'));
    document.getElementById('btn-review').addEventListener('click', () => this.showReview());
    document.getElementById('btn-retry').addEventListener('click', () => this.startQuiz(this.currentCategory, this.currentLevel));
    document.getElementById('btn-home').addEventListener('click', () => this.showScreen('home'));
    document.getElementById('btn-reverse').addEventListener('click', () => this.toggleReverse());
    document.getElementById('btn-skip').addEventListener('click', () => this.skipQuestion());
    document.getElementById('btn-mark').addEventListener('click', () => this.toggleMark());

    const navToggle = document.getElementById('question-nav-toggle');
    if (navToggle) navToggle.addEventListener('click', () => this.toggleQuestionNav());
    const navOverlay = document.getElementById('question-nav-overlay');
    if (navOverlay) navOverlay.addEventListener('click', () => this.closeQuestionNav());

    document.getElementById('btn-show-mastered').addEventListener('click', () => this.showStatsModal('mastered'));
    document.getElementById('btn-show-studied').addEventListener('click', () => this.showStatsModal('studied'));
    document.getElementById('btn-show-score').addEventListener('click', () => this.showStatsModal('score'));

    document.getElementById('btn-back-repeat').addEventListener('click', () => this.showScreen('home'));
    document.getElementById('btn-repeat-show').addEventListener('click', () => this.showRepeatAnswer());
    document.getElementById('btn-repeat-mastered').addEventListener('click', () => this.markRepeatMastered());
    document.getElementById('btn-repeat-again').addEventListener('click', () => this.repeatAgain());

    document.querySelectorAll('.category-card:not(.disabled)').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        this.selectCategory(category);
      });
    });
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nihongo-master-theme', next);
  },

  toggleReverse() {
    const isHK = DataLoader.isHiraganaKatakana(this.currentCategory);
    if (isHK) return;
    
    this.isReversed = !this.isReversed;
    const btn = document.getElementById('btn-reverse');
    btn.classList.toggle('active', this.isReversed);
    btn.querySelector('.reverse-text').textContent = this.isReversed ? 'Soal Jepang' : 'Soal Indonesia';
    this.renderQuestion();
  },

  saveMarkedWords() {
    if (!this.markedQuestions || Object.keys(this.markedQuestions).length === 0) return;
    
    const key = `${this.currentCategory}-level-${this.currentLevel}`;
    const marked = Object.values(this.markedQuestions);
    
    const allMarked = this.loadAllMarkedWords();
    allMarked[key] = marked;
    
    UserStorage.set('marked-words', JSON.stringify(allMarked));
    this.debouncedSyncToAPI();
  },

  loadAllMarkedWords() {
    const saved = UserStorage.get('marked-words');
    return saved ? JSON.parse(saved) : {};
  },

  loadMarkedWordsByLevel(category, level) {
    const key = `${category}-level-${level}`;
    const allMarked = this.loadAllMarkedWords();
    return allMarked[key] || [];
  },

  loadMarkedWordsForReview() {
    const allMarked = this.loadAllMarkedWords();
    const result = [];
    Object.entries(allMarked).forEach(([key, words]) => {
      words.forEach(w => {
        if (!result.find(r => r.id === w.id)) {
          result.push(w);
        }
      });
    });
    return result;
  },

  clearMarkedWordsForLevel(category, level) {
    const key = `${category}-level-${level}`;
    const allMarked = this.loadAllMarkedWords();
    delete allMarked[key];
    UserStorage.set('marked-words', JSON.stringify(allMarked));
  },

  clearAllMarkedWords() {
    UserStorage.remove('marked-words');
    this.markedQuestions = {};
  },

  skipQuestion() {
    if (this.isAnswered) return;
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      this.checkPracticeMode();
    } else {
      this.renderQuestion();
    }
  },

  toggleMark() {
    const btn = document.getElementById('btn-mark');
    const question = this.currentQuestions[this.currentQuestionIndex];
    if (!question) return;

    if (!this.markedQuestions) this.markedQuestions = {};

    if (this.markedQuestions[question.id]) {
      delete this.markedQuestions[question.id];
      btn.classList.remove('active');
      btn.textContent = '☐ Kosakata Belum Hafal';
    } else {
      this.markedQuestions[question.id] = question;
      btn.classList.add('active');
      btn.textContent = '☑ Kosakata Belum Hafal';
    }
  },

  checkPracticeMode() {
    const marked = Object.values(this.markedQuestions || {});
    this.saveMarkedWords();
    
    if (this.isPracticeMode) {
      // In practice mode, collect wrong answers for more practice
      const wrongAnswers = this.answers
        .filter(a => a && !a.isCorrect)
        .map(a => a.question);
      
      if (wrongAnswers.length > 0 && this.practiceRound < this.practiceMaxRounds) {
        this.practiceRound++;
        this.currentQuestions = this.shuffleArray([...wrongAnswers]);
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.score = 0;
        
        document.getElementById('quiz-level-badge').textContent = `Latihan ${this.practiceRound}/${this.practiceMaxRounds}`;
        
        this.renderQuestionNav();
        this.renderQuestion();
      } else {
        this.clearMarkedWordsForLevel(this.currentCategory, this.currentLevel);
        this.showResult();
      }
    } else if (marked.length > 0) {
      // Main quiz done, start practice mode for marked words
      this.startPracticeMode(marked);
    } else {
      this.showResult();
    }
  },

  startPracticeMode(markedWords) {
    this.isPracticeMode = true;
    this.practiceWords = markedWords;
    this.practiceIndex = 0;
    this.practiceRound = 1;
    this.practiceMaxRounds = Math.min(markedWords.length * 2, 10);
    this.practiceScore = 0;
    this.practiceTotal = 0;

    this.currentQuestions = this.shuffleArray([...markedWords]);
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.score = 0;

    document.getElementById('quiz-category-badge').textContent = 'Latihan Ulang';
    document.getElementById('quiz-level-badge').textContent = `${markedWords.length} kata`;

    this.showScreen('quiz');
    this.renderQuestionNav();
    this.renderQuestion();
  },

  startMarkedReviewByLevel(category, level) {
    const markedWords = this.loadMarkedWordsByLevel(category, level);
    if (markedWords.length === 0) {
      alert('Tidak ada kata yang ditandai!');
      return;
    }

    this.currentCategory = category;
    this.currentLevel = level;
    this.markedQuestions = {};
    markedWords.forEach(q => {
      this.markedQuestions[q.id] = q;
    });

    this.isPracticeMode = true;
    this.practiceWords = markedWords;
    this.practiceRound = 1;
    this.practiceMaxRounds = Math.min(markedWords.length * 2, 10);
    this.practiceScore = 0;
    this.practiceTotal = 0;

    this.currentQuestions = this.shuffleArray([...markedWords]);
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.score = 0;
    this.isReversed = false;

    const categoryNames = {
      nouns: 'Kata Benda',
      verbs: 'Kata Kerja',
      adjectives: 'Kata Sifat',
      kanji: 'Kanji',
      'kotoba-n5': 'Kosakata N5',
      'kanji-n5': 'Kanji N5',
      'bunpou-n5': 'Tata Bahasa N5'
    };
    const catName = categoryNames[category] || category;

    document.getElementById('quiz-category-badge').textContent = `📝 ${catName}`;
    document.getElementById('quiz-level-badge').textContent = `Level ${level} • ${markedWords.length} kata`;

    this.showScreen('quiz');
    this.renderQuestionNav();
    this.renderQuestion();
  },

  showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screen}`).classList.add('active');
    this.currentScreen = screen;

    if (screen === 'home') {
      this.updateStats();
      this.updateProgressRings();
      this.updateMarkedWordsSection();
    }
  },

  updateMarkedWordsSection() {
    const allMarked = this.loadAllMarkedWords();
    const section = document.getElementById('marked-words-section');
    const listEl = document.getElementById('marked-words-list');
    
    const keys = Object.keys(allMarked).filter(k => allMarked[k].length > 0);
    
    if (keys.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    listEl.innerHTML = '';
    
    const categoryNames = {
      nouns: 'Kata Benda',
      verbs: 'Kata Kerja',
      adjectives: 'Kata Sifat',
      kanji: 'Kanji',
      'kotoba-n5': 'Kosakata N5',
      'kanji-n5': 'Kanji N5',
      'bunpou-n5': 'Tata Bahasa N5'
    };
    
    keys.sort().forEach(key => {
      const [category, levelStr] = key.split('-level-');
      const level = parseInt(levelStr);
      const words = allMarked[key];
      const catName = categoryNames[category] || category;
      
      const card = document.createElement('div');
      card.className = 'marked-words-card';
      card.innerHTML = `
        <div class="marked-words-icon">📝</div>
        <div class="marked-words-info">
          <h3>${catName}</h3>
          <span class="marked-words-count">Level ${level} • ${words.length} kata</span>
        </div>
        <div class="marked-words-actions">
          <button class="marked-words-btn repeat-btn" data-category="${category}" data-level="${level}">Repeat</button>
          <button class="marked-words-btn practice-btn" data-category="${category}" data-level="${level}">Latihan →</button>
        </div>
      `;
      
      card.querySelector('.practice-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.startMarkedReviewByLevel(category, level);
      });
      
      card.querySelector('.repeat-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.startRepeatMode(category, level);
      });
      
      listEl.appendChild(card);
    });
  },

  startRepeatMode(category, level) {
    const markedWords = this.loadMarkedWordsByLevel(category, level);
    if (markedWords.length === 0) {
      alert('Tidak ada kosakata yang ditandai!');
      return;
    }

    this.currentCategory = category;
    this.currentLevel = level;
    this.repeatWords = this.shuffleArray([...markedWords]);
    this.repeatIndex = 0;
    this.markedQuestions = {};
    markedWords.forEach(q => {
      this.markedQuestions[q.id] = q;
    });

    const categoryNames = {
      nouns: 'Kata Benda',
      verbs: 'Kata Kerja',
      adjectives: 'Kata Sifat',
      kanji: 'Kanji',
      'kotoba-n5': 'Kosakata N5',
      'kanji-n5': 'Kanji N5',
      'bunpou-n5': 'Tata Bahasa N5'
    };
    const catName = categoryNames[category] || category;

    document.getElementById('repeat-category-badge').textContent = `📝 ${catName}`;
    document.getElementById('repeat-level-badge').textContent = `Level ${level} • ${markedWords.length} kata`;

    this.showScreen('repeat');
    this.renderRepeatQuestion();
  },

  renderRepeatQuestion() {
    if (this.repeatIndex >= this.repeatWords.length) {
      this.saveMarkedWords();
      this.showScreen('home');
      return;
    }

    const question = this.repeatWords[this.repeatIndex];
    const isHK = DataLoader.isHiraganaKatakana(this.currentCategory);

    document.getElementById('repeat-question-text').textContent = 'Apa artinya?';
    document.getElementById('repeat-kanji').textContent = question.kanji;
    document.getElementById('repeat-reading').textContent = question.reading || '';
    document.getElementById('repeat-romaji').textContent = question.romaji || '';
    document.getElementById('repeat-kanji').classList.remove('large-character', 'reversed-text');

    document.getElementById('repeat-answer').style.display = 'none';
    document.getElementById('btn-repeat-show').style.display = 'block';
    document.getElementById('repeat-btn-group').style.display = 'none';
  },

  showRepeatAnswer() {
    const question = this.repeatWords[this.repeatIndex];
    document.getElementById('repeat-answer-text').textContent = question.meaning;
    document.getElementById('repeat-answer').style.display = 'block';
    document.getElementById('btn-repeat-show').style.display = 'none';
    document.getElementById('repeat-btn-group').style.display = 'flex';
  },

  markRepeatMastered() {
    const question = this.repeatWords[this.repeatIndex];
    delete this.markedQuestions[question.id];
    this.repeatWords.splice(this.repeatIndex, 1);
    
    if (this.repeatWords.length === 0) {
      this.clearMarkedWordsForLevel(this.currentCategory, this.currentLevel);
      this.showScreen('home');
    } else {
      if (this.repeatIndex >= this.repeatWords.length) {
        this.repeatIndex = 0;
      }
      this.renderRepeatQuestion();
    }
  },

  repeatAgain() {
    this.repeatIndex++;
    if (this.repeatIndex >= this.repeatWords.length) {
      this.repeatIndex = 0;
      this.shuffleArray(this.repeatWords);
    }
    this.renderRepeatQuestion();
  },

  async selectCategory(category) {
    this.currentCategory = category;
    const catInfo = DataLoader.getCategoryInfo(category);
    document.getElementById('level-screen-title').textContent = `Pilih Level - ${catInfo.name}`;

    const levels = await DataLoader.getLevels(category);
    this.renderLevels(levels);
    this.showScreen('levels');
  },

  renderLevels(levels) {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';

    levels.forEach((level, index) => {
      const card = document.createElement('button');
      card.className = 'level-card';

      const isCompleted = this.isLevelCompleted(this.currentCategory, level.level);
      if (isCompleted) {
        card.classList.add('completed');
      }

      const isBunpou = this.currentCategory === 'bunpou-n5';
      const stars = isBunpou ? 0 : this.getLevelStars(this.currentCategory, level.level);

      // For bunpou, show understanding dots and color the card
      let bunpouDots = '';
      if (isBunpou) {
        const storageKey = 'bunpou-understand-bab' + level.level;
        try {
          const state = JSON.parse(UserStorage.get(storageKey) || '{}');
          const total = level.questionCount || 0;
          let understood = 0, notUnderstood = 0, noAnswer = 0;
          Object.values(state).forEach(v => {
            if (v === 'understood') understood++;
            else if (v === 'not-understood') notUnderstood++;
            else noAnswer++;
          });
          // Color the card based on understanding status
          if (total > 0) {
            if (noAnswer === 0 && notUnderstood === 0) {
              card.classList.add('bunpou-all-understood'); // All green
            } else if (notUnderstood > 0) {
              card.classList.add('bunpou-has-not-understood'); // Has red
            }
          }
          if (total > 0) {
            bunpouDots = `<span class="bunpou-progress">${Array(total).fill(0).map((_, i) => {
              const s = state[i + 1] || '';
              const cls = s === 'understood' ? 'understood' : (s === 'not-understood' ? 'not-understood' : '');
              return `<span class="bunpou-dot ${cls}"></span>`;
            }).join('')}</span>`;
          }
        } catch(e) {}
      }

      card.innerHTML = `
        <span class="level-number">${level.level}</span>
        <span class="level-label">${isBunpou ? 'BAB' : level.questionCount + ' Soal'}</span>
        ${isBunpou ? bunpouDots : `<span class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>`}
      `;

      card.addEventListener('click', () => {
        if (this.currentCategory === 'bunpou-n5') {
          this.showBunpouReading(level.level);
        } else {
          this.showQuizOptions(level.level);
        }
      });

      card.style.animationDelay = `${index * 0.05}s`;
      grid.appendChild(card);
    });
  },

  showQuizOptions(level) {
    const isHK = DataLoader.isHiraganaKatakana(this.currentCategory);
    
    const modal = document.createElement('div');
    modal.className = 'quiz-options-modal';
    modal.innerHTML = `
      <div class="quiz-options-content">
        <h3>Pilih Mode</h3>
        <div class="quiz-mode-buttons">
          <button class="shuffle-btn active" data-mode="shuffle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
            Acak
          </button>
          <button class="shuffle-btn" data-mode="sequential">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Urut
          </button>
        </div>
        ${!isHK ? `
        <div class="quiz-mode-label">Mode Soal</div>
        <div class="quiz-mode-buttons">
          <button class="reverse-btn${!this.isReversed ? ' active' : ''}" data-reverse="false">
            🇯🇵 Soal Jepang
          </button>
          <button class="reverse-btn${this.isReversed ? ' active' : ''}" data-reverse="true">
            🇮🇩 Soal Indonesia
          </button>
        </div>
        ` : ''}
        <div class="quiz-modal-actions">
          <button class="btn-primary" id="btn-start-quiz">Mulai</button>
          <button class="btn-outline" id="btn-cancel-quiz">Batal</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    let selectedMode = 'shuffle';
    let selectedReverse = this.isReversed;

    modal.querySelectorAll('.shuffle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.shuffle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMode = btn.dataset.mode;
      });
    });

    modal.querySelectorAll('.reverse-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.reverse-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedReverse = btn.dataset.reverse === 'true';
      });
    });

    document.getElementById('btn-start-quiz').addEventListener('click', () => {
      this.isShuffled = selectedMode === 'shuffle';
      this.isReversed = selectedReverse;
      modal.remove();
      this.startQuiz(this.currentCategory, level);
    });

    document.getElementById('btn-cancel-quiz').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  async showBunpouReading(bab) {
    const data = await DataLoader.getCategoryData('bunpou-n5');
    if (!data || !data.babs) {
      alert('Data bacaan tidak tersedia.');
      return;
    }
    const babData = data.babs.find(b => b.bab === bab);
    if (!babData) {
      alert('Bab tidak ditemukan.');
      return;
    }

    const points = babData.points || [];
    if (points.length === 0) {
      this.showBunpouLegacy(babData, bab);
      return;
    }

    // Load understanding state from localStorage
    const storageKey = 'bunpou-understand-bab' + bab;
    let understandState = {};
    try { understandState = JSON.parse(UserStorage.get(storageKey) || '{}'); } catch(e) {}

    const modal = document.createElement('div');
    modal.className = 'reading-modal';
    modal.innerHTML = `
      <div class="reading-content">
        <div class="reading-header">
          <h2>Bab ${babData.bab}: ${babData.title}</h2>
          <button class="close-reading" id="close-reading">&times;</button>
        </div>
        <div class="reading-body" id="reading-body"></div>
        <div class="slider-dots" id="slider-dots"></div>
        <div class="point-nav">
          <button class="point-nav-btn" id="point-prev" disabled>← Prev</button>
          <span class="point-counter" id="point-counter">1 / ${points.length}</span>
          <button class="point-nav-btn" id="point-next">Next →</button>
        </div>
        <div class="reading-nav">
          ${bab > 1 ? `<button class="btn-outline" id="prev-bab">← Bab Sebelumnya</button>` : '<span></span>'}
          <button class="btn-primary" id="back-to-levels">Kembali</button>
          ${bab < 25 ? `<button class="btn-outline" id="next-bab">Bab Berikutnya →</button>` : '<span></span>'}
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const body = document.getElementById('reading-body');
    let currentPoint = 0;
    const self = this;

    function renderPoints() {
      let html = '';
      points.forEach((p, i) => {
        const isActive = i === currentPoint;
        const state = understandState[p.num] || '';
        html += `<div class="point-slide ${isActive ? 'active' : ''}" data-idx="${i}">`;
        html += `<div class="point-slide-title">${p.num}. ${p.title}</div>`;
        
        // Pattern box
        if (p.pattern) {
          html += `<div class="pattern-box">${p.pattern}</div>`;
        }
        
        // Body text with notes
        if (p.body) {
          const bodyHtml = p.body.split('\n').map(line => {
            const t = line.trim();
            if (!t) return '';
            if (t.startsWith('📌')) {
              return `<div class="note-box">${t}</div>`;
            }
            return `<p>${t}</p>`;
          }).join('');
          html += `<div class="point-slide-body">${bodyHtml}</div>`;
        }

        // Examples
        if (p.examples && p.examples.length > 0) {
          p.examples.forEach(ex => {
            html += `<div class="example-card">`;
            html += `<div class="example-jp">${ex.jp}</div>`;
            if (ex.translation) {
              html += `<div class="example-trans">${ex.translation}</div>`;
            }
            html += `</div>`;
          });
        }

        // Understanding toggle
        html += `<div class="understand-toggle">`;
        html += `<button class="understand-btn ${state === 'understood' ? 'understood' : ''}" data-point="${p.num}" data-state="understood">✓ Paham</button>`;
        html += `<button class="understand-btn ${state === 'not-understood' ? 'not-understood' : ''}" data-point="${p.num}" data-state="not-understood">✗ Belum Paham</button>`;
        html += `</div>`;
        
        html += `</div>`;
      });
      body.innerHTML = html;

      // Add understand button listeners
      body.querySelectorAll('.understand-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const pointNum = this.dataset.point;
          const state = this.dataset.state;
          understandState[pointNum] = state;
          UserStorage.set(storageKey, JSON.stringify(understandState));
          App.debouncedSyncToAPI();
          // Update button styles
          const card = this.closest('.point-slide');
          card.querySelectorAll('.understand-btn').forEach(b => {
            b.classList.remove('understood', 'not-understood');
          });
          this.classList.add(state);
          // Update dots
          renderDots();
          // Update level card dots
          App.updateBunpouLevelCard(bab);
        });
      });
    }

    function renderDots() {
      const dots = document.getElementById('slider-dots');
      dots.innerHTML = points.map((p, i) => {
        const state = understandState[p.num] || '';
        const cls = state === 'understood' ? 'understood' : (state === 'not-understood' ? 'not-understood' : '');
        return `<button class="slider-dot ${i === currentPoint ? 'active' : ''} ${cls}" data-idx="${i}"></button>`;
      }).join('');
    }

    function updateSlider() {
      document.querySelectorAll('.point-slide').forEach((el, i) => {
        el.classList.toggle('active', i === currentPoint);
      });
      document.querySelectorAll('.slider-dot').forEach((el, i) => {
        el.classList.toggle('active', i === currentPoint);
      });
      document.getElementById('point-counter').textContent = `${currentPoint + 1} / ${points.length}`;
      document.getElementById('point-prev').disabled = currentPoint === 0;
      document.getElementById('point-next').disabled = currentPoint === points.length - 1;
    }

    renderPoints();
    renderDots();

    // Point navigation
    document.getElementById('point-prev').addEventListener('click', () => {
      if (currentPoint > 0) { currentPoint--; updateSlider(); }
    });
    document.getElementById('point-next').addEventListener('click', () => {
      if (currentPoint < points.length - 1) { currentPoint++; updateSlider(); }
    });

    // Dot click
    document.getElementById('slider-dots').addEventListener('click', (e) => {
      const dot = e.target.closest('.slider-dot');
      if (dot) {
        currentPoint = parseInt(dot.dataset.idx);
        updateSlider();
      }
    });

    // Keyboard nav
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && currentPoint > 0) { currentPoint--; updateSlider(); }
      if (e.key === 'ArrowRight' && currentPoint < points.length - 1) { currentPoint++; updateSlider(); }
    });
    modal.setAttribute('tabindex', '-1');
    modal.focus();

    // Bottom nav
    document.getElementById('close-reading').addEventListener('click', () => {
      modal.remove();
      this.showLevelSelection(this.currentCategory);
    });
    document.getElementById('back-to-levels').addEventListener('click', () => {
      modal.remove();
      this.showLevelSelection(this.currentCategory);
    });
    
    const prevBtn = document.getElementById('prev-bab');
    const nextBtn = document.getElementById('next-bab');
    if (prevBtn) prevBtn.addEventListener('click', () => { modal.remove(); this.showBunpouReading(bab - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { modal.remove(); this.showBunpouReading(bab + 1); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  showBunpouLegacy(babData, bab) {
    const modal = document.createElement('div');
    modal.className = 'reading-modal';
    modal.innerHTML = `
      <div class="reading-content">
        <div class="reading-header">
          <h2>Bab ${babData.bab}: ${babData.title}</h2>
          <button class="close-reading" id="close-reading">&times;</button>
        </div>
        <div class="reading-body" style="padding: 24px; overflow-y: auto;">
          <div class="point-slide-body">${babData.content.split('\n').map(l => {
            const t = l.trim();
            if (!t) return '';
            if (t.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/) && t.length < 100) {
              return `<div class="example-jp">${t}</div>`;
            }
            return `<p>${t}</p>`;
          }).join('')}</div>
        </div>
        <div class="reading-nav">
          ${bab > 1 ? `<button class="btn-outline" id="prev-bab">← Bab Sebelumnya</button>` : '<span></span>'}
          <button class="btn-primary" id="back-to-levels">Kembali</button>
          ${bab < 25 ? `<button class="btn-outline" id="next-bab">Bab Berikutnya →</button>` : '<span></span>'}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-reading').addEventListener('click', () => modal.remove());
    document.getElementById('back-to-levels').addEventListener('click', () => {
      modal.remove();
      this.showLevelSelection(this.currentCategory);
    });
    const prevBtn = document.getElementById('prev-bab');
    const nextBtn = document.getElementById('next-bab');
    if (prevBtn) prevBtn.addEventListener('click', () => { modal.remove(); this.showBunpouLegacy(data.babs.find(b => b.bab === bab - 1), bab - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { modal.remove(); this.showBunpouLegacy(data.babs.find(b => b.bab === bab + 1), bab + 1); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  isLevelCompleted(category, level) {
    const key = `${category}-level-${level}`;
    return UserStorage.get(`completed-${key}`) === 'true';
  },

  getLevelStars(category, level) {
    const key = `${category}-level-${level}`;
    const score = parseInt(UserStorage.get(`score-${key}`) || '0');
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  },

  shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  async startQuiz(category, level) {
    this.currentCategory = category;
    this.currentLevel = level;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.answers = [];
    this.isAnswered = false;
    this.isPracticeMode = false;

    const savedMarked = this.loadMarkedWordsByLevel(category, level);
    this.markedQuestions = {};
    savedMarked.forEach(q => {
      this.markedQuestions[q.id] = q;
    });

    let questions = await DataLoader.getQuestions(category, level);
    if (questions.length === 0) {
      alert('Tidak ada soal untuk level ini. Silakan tambahkan data soal.');
      return;
    }

    if (this.isShuffled) {
      questions = this.shuffleArray(questions);
    }

    const isHK = DataLoader.isHiraganaKatakana(category);

    questions = questions.map(q => {
      if (isHK) {
        const originalOptions = [...q.options];
        const originalCorrectIndex = q.correctIndex;
        const shuffledOptions = this.shuffleArray(q.options);
        const newCorrectIndex = shuffledOptions.indexOf(originalOptions[originalCorrectIndex]);
        return {
          ...q,
          originalOptions: originalOptions,
          originalCorrectIndex: originalCorrectIndex,
          options: shuffledOptions,
          correctIndex: newCorrectIndex
        };
      }
      return { ...q };
    });

    this.currentQuestions = questions;

    const catInfo = DataLoader.getCategoryInfo(category);
    document.getElementById('quiz-category-badge').textContent = catInfo.name;
    document.getElementById('quiz-level-badge').textContent = `Level ${level}`;

    this.showScreen('quiz');
    this.renderQuestionNav();
    this.renderQuestion();
  },

  generateTrapOptions(question, allQuestions, mode) {
    let correctAnswer, pool;

    if (mode === 'meaning') {
      correctAnswer = question.meaning;
      pool = allQuestions.map(q => ({ value: q.meaning, reading: q.reading, kanji: q.kanji }));
    } else {
      correctAnswer = question.reading;
      pool = allQuestions.map(q => ({ value: q.reading, meaning: q.meaning, kanji: q.kanji }));
    }

    const wrongs = pool
      .filter(p => p.value !== correctAnswer && p.value)
      .sort(() => 0.5 - Math.random());

    const selected = wrongs.slice(0, 3).map(w => w.value);
    const options = this.shuffleArray([...selected, correctAnswer]);
    const correctIndex = options.indexOf(correctAnswer);

    return { options, correctIndex };
  },

  renderQuestionNav() {
    const nav = document.getElementById('question-nav');
    nav.innerHTML = '';

    const total = this.currentQuestions.length;

    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.className = 'question-nav-btn';
      btn.dataset.index = i;
      btn.textContent = i + 1;

      btn.addEventListener('click', () => {
        this.goToQuestion(i);
        this.closeQuestionNav();
      });

      nav.appendChild(btn);
    }

    this.updateQuestionNav();
  },

  closeQuestionNav() {
    const nav = document.getElementById('question-nav');
    const overlay = document.getElementById('question-nav-overlay');
    if (nav) nav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  },

  toggleQuestionNav() {
    const nav = document.getElementById('question-nav');
    const overlay = document.getElementById('question-nav-overlay');
    const isActive = nav.classList.contains('active');
    if (isActive) {
      this.closeQuestionNav();
    } else {
      nav.classList.add('active');
      overlay.classList.add('active');
    }
  },

  updateBunpouLevelCard(bab) {
    const grid = document.getElementById('level-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.level-card');
    cards.forEach(card => {
      const numEl = card.querySelector('.level-number');
      if (!numEl || parseInt(numEl.textContent) !== bab) return;

      card.classList.remove('bunpou-all-understood', 'bunpou-has-not-understood');
      const storageKey = 'bunpou-understand-bab' + bab;
      try {
        const state = JSON.parse(UserStorage.get(storageKey) || '{}');
        const dots = card.querySelector('.bunpou-progress');
        let total = 0;
        if (dots) {
          const dotEls = dots.querySelectorAll('.bunpou-dot');
          total = dotEls.length;
          dotEls.forEach((dot, i) => {
            const s = state[i + 1] || '';
            dot.className = 'bunpou-dot' + (s === 'understood' ? ' understood' : (s === 'not-understood' ? ' not-understood' : ''));
          });
        }
        let understood = 0, notUnderstood = 0;
        Object.values(state).forEach(v => {
          if (v === 'understood') understood++;
          else if (v === 'not-understood') notUnderstood++;
        });
        if (total > 0) {
          if (notUnderstood === 0 && understood === total) {
            card.classList.add('bunpou-all-understood');
          } else if (notUnderstood > 0) {
            card.classList.add('bunpou-has-not-understood');
          }
        }
      } catch(e) {}
    });
  },

  updateQuestionNav() {
    const btns = document.querySelectorAll('.question-nav-btn');
    btns.forEach((btn, i) => {
      btn.classList.remove('active', 'answered', 'wrong', 'skipped');

      if (i === this.currentQuestionIndex) {
        btn.classList.add('active');
      } else if (this.answers[i]) {
        btn.classList.add(this.answers[i].isCorrect ? 'answered' : 'wrong');
      } else if (i < this.currentQuestionIndex) {
        btn.classList.add('skipped');
      }
    });

    const toggleText = document.getElementById('nav-toggle-text');
    if (toggleText) {
      toggleText.textContent = `${this.currentQuestionIndex + 1}/${this.currentQuestions.length}`;
    }
  },

  goToQuestion(index) {
    if (index < 0 || index >= this.currentQuestions.length) return;
    this.currentQuestionIndex = index;
    this.renderQuestion();
  },

  renderQuestion() {
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      this.showResult();
      return;
    }

    const question = this.currentQuestions[this.currentQuestionIndex];
    this.isAnswered = false;

    const kanjiEl = document.getElementById('question-kanji');
    const readingEl = document.getElementById('question-reading');
    const romajiEl = document.getElementById('question-romaji');
    const questionTextEl = document.querySelector('.question-text');
    const questionCard = document.getElementById('question-card');

    const isHiraganaKatakana = DataLoader.isHiraganaKatakana(this.currentCategory);

    if (this.isReversed && !isHiraganaKatakana) {
      questionCard.classList.add('reversed');
      kanjiEl.textContent = question.meaning;
      kanjiEl.classList.add('reversed-text');
      kanjiEl.classList.remove('large-character');
      readingEl.textContent = 'Pilih jawaban dalam kosakata Jepang';
      romajiEl.textContent = '';
      questionTextEl.textContent = 'Apa kosakata Jepangnya?';
    } else {
      questionCard.classList.remove('reversed');
      kanjiEl.classList.remove('reversed-text');
      kanjiEl.textContent = question.kanji;

      if (isHiraganaKatakana) {
        readingEl.textContent = '';
        romajiEl.textContent = '';
        questionTextEl.textContent = 'Bunyi karakter ini?';
        kanjiEl.classList.add('large-character');
      } else {
        readingEl.textContent = question.reading || '';
        romajiEl.textContent = question.romaji || '';
        questionTextEl.textContent = 'Apa artinya?';
        kanjiEl.classList.remove('large-character');
      }
    }

    const progress = ((this.currentQuestionIndex + 1) / this.currentQuestions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progress}%`;
    document.getElementById('quiz-counter').textContent =
      `${this.currentQuestionIndex + 1} / ${this.currentQuestions.length}`;

    let displayOptions, correctIdx;

    if (isHiraganaKatakana) {
      displayOptions = question.options;
      correctIdx = question.correctIndex;
    } else if (this.isReversed) {
      const trap = this.generateTrapOptions(question, this.currentQuestions, 'reading');
      displayOptions = trap.options;
      correctIdx = trap.correctIndex;
    } else {
      const trap = this.generateTrapOptions(question, this.currentQuestions, 'meaning');
      displayOptions = trap.options;
      correctIdx = trap.correctIndex;
    }

    question._currentCorrectIndex = correctIdx;
    question._displayOptions = displayOptions;

    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';

    const labels = ['A', 'B', 'C', 'D'];

    displayOptions.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.index = index;
      btn.innerHTML = `
        <span class="option-label">${labels[index]}</span>
        <span class="option-text">${option}</span>
      `;
      btn.addEventListener('click', () => this.selectAnswer(index));
      optionsGrid.appendChild(btn);
    });

    questionCard.style.animation = 'none';
    questionCard.offsetHeight;
    questionCard.style.animation = 'bounceIn 0.5s ease';

    const markBtn = document.getElementById('btn-mark');
    if (this.markedQuestions && this.markedQuestions[question.id]) {
      markBtn.classList.add('active');
      markBtn.textContent = '☑ Kosakata Belum Hafal';
    } else {
      markBtn.classList.remove('active');
      markBtn.textContent = '☐ Kosakata Belum Hafal';
    }

    this.updateQuestionNav();
  },

  selectAnswer(selectedIndex) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const question = this.currentQuestions[this.currentQuestionIndex];
    const correctIndex = question._currentCorrectIndex;
    const isCorrect = selectedIndex === correctIndex;

    this.answers[this.currentQuestionIndex] = {
      question: question,
      selectedIndex: selectedIndex,
      isCorrect: isCorrect
    };

    if (isCorrect) {
      this.score++;
    }

    const options = document.querySelectorAll('.option-btn');
    options.forEach((btn, index) => {
      btn.classList.add('disabled');
      if (index === correctIndex) {
        btn.classList.add('correct');
      } else if (index === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    if (isCorrect) {
      this.streak++;
    } else {
      this.streak = 0;
    }
    document.getElementById('streak-count').textContent = this.streak;

    this.updateQuestionNav();

    setTimeout(() => {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex >= this.currentQuestions.length) {
        if (this.isPracticeMode) {
          this.checkPracticeMode();
        } else {
          this.checkPracticeMode();
        }
      } else {
        this.renderQuestion();
      }
    }, 1200);
  },

  showResult() {
    const totalQuestions = this.currentQuestions.length;
    const answeredCount = this.answers.filter(a => a).length;
    const skippedCount = totalQuestions - answeredCount;
    const percentage = answeredCount > 0 ? Math.round((this.score / answeredCount) * 100) : 0;

    if (this.isPracticeMode) {
      document.getElementById('result-icon').textContent = percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪';
      document.getElementById('result-title').textContent = `Latihan Selesai - Ronde ${this.practiceRound}`;
      document.getElementById('result-detail').textContent =
        `${this.score} dari ${answeredCount} benar`;
    } else {
      document.getElementById('result-detail').textContent =
        `${this.score} dari ${answeredCount} benar${skippedCount > 0 ? ` (${skippedCount} dilewati)` : ''}`;
    }

    document.getElementById('result-score-number').textContent = percentage;
    document.getElementById('result-correct').textContent = this.score;
    document.getElementById('result-wrong').textContent = answeredCount - this.score;

    const scoreCircle = document.getElementById('result-score-circle');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    setTimeout(() => {
      scoreCircle.style.strokeDasharray = `${offset}, ${circumference}`;
    }, 300);

    if (percentage >= 80) {
      document.getElementById('result-icon').textContent = '🎉';
      document.getElementById('result-title').textContent = 'Hebat Sekali!';
      scoreCircle.style.stroke = 'var(--success)';
    } else if (percentage >= 50) {
      document.getElementById('result-icon').textContent = '👍';
      document.getElementById('result-title').textContent = 'Bagus!';
      scoreCircle.style.stroke = 'var(--warning)';
    } else {
      document.getElementById('result-icon').textContent = '💪';
      document.getElementById('result-title').textContent = 'Terus Semangat!';
      scoreCircle.style.stroke = 'var(--danger)';
    }

    const key = `${this.currentCategory}-level-${this.currentLevel}`;
    UserStorage.set(`completed-${key}`, 'true');
    UserStorage.set(`score-${key}`, percentage);
    this.debouncedSyncToAPI();

    if (percentage > this.bestScore) {
      this.bestScore = Math.min(100, percentage);
    }

    this.currentQuestions.forEach((q, i) => {
      const wordKey = `${this.currentCategory}-${q.id}`;
      this.studiedWords[wordKey] = true;
      if (this.answers[i] && this.answers[i].isCorrect) {
        if (!this.masteredWords[wordKey]) {
          this.masteredWords[wordKey] = 0;
        }
        this.masteredWords[wordKey]++;
      }
    });

    this.saveProgress();

    this.showScreen('result');

    scoreCircle.style.strokeDasharray = '0, 283';

    if (percentage >= 80) {
      this.launchConfetti();
    }
  },

  showReview() {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';

    this.answers.forEach((answer, index) => {
      const item = document.createElement('div');
      item.className = `review-item ${answer.isCorrect ? 'review-correct' : 'review-wrong'}`;
      item.style.animationDelay = `${index * 0.1}s`;

      const labels = ['A', 'B', 'C', 'D'];
      const displayOptions = answer.question._displayOptions || answer.question.options;
      const correctIdx = answer.question._currentCorrectIndex !== undefined
        ? answer.question._currentCorrectIndex
        : answer.question.correctIndex;

      item.innerHTML = `
        <div class="review-status">${answer.isCorrect ? '✓' : '✗'}</div>
        <div class="review-content">
          <div class="review-kanji">${answer.question.kanji}</div>
          ${answer.question.reading ? `<div class="review-reading">${answer.question.reading}</div>` : ''}
          ${answer.question.romaji ? `<div class="review-romaji">${answer.question.romaji}</div>` : ''}
          <div class="review-answers">
            <div class="review-your-answer">Jawaban Anda: ${labels[answer.selectedIndex]}. ${displayOptions[answer.selectedIndex]}</div>
            ${!answer.isCorrect ? `<div class="review-correct-answer">Jawaban Benar: ${labels[correctIdx]}. ${displayOptions[correctIdx]}</div>` : ''}
          </div>
        </div>
      `;

      reviewList.appendChild(item);
    });

    this.showScreen('review');
  },

  updateStats() {
    const totalMastered = Object.keys(this.masteredWords).length;
    const totalStudied = Object.keys(this.studiedWords).length;

    document.getElementById('total-mastered').textContent = totalMastered;
    document.getElementById('total-studied').textContent = totalStudied;
    document.getElementById('best-score').textContent = `${this.bestScore}%`;
  },

  getCategoryLevelsCompleted(category) {
    const total = this.getCategoryTotalLevels(category);
    let completed = 0;
    for (let i = 1; i <= total; i++) {
      const key = `${category}-level-${i}`;
      if (UserStorage.get(`completed-${key}`) === 'true') {
        completed++;
      }
    }
    return completed;
  },

  getCategoryTotalLevels(category) {
    const maxLevels = {
      hiragana: 5,
      katakana: 5,
      nouns: 21,
      verbs: 12,
      adjectives: 4,
      kanji: 3,
      'kotoba-n5': 48,
      'kanji-n5': 11,
      'bunpou-n5': 25
    };
    return maxLevels[category] || 10;
  },

  showStatsModal(type) {
    const categories = [
      { id: 'hiragana', name: 'Hiragana', icon: 'あ', color: '#3498db' },
      { id: 'katakana', name: 'Katakana', icon: 'ア', color: '#9b59b6' },
      { id: 'nouns', name: 'Kata Benda', icon: '名', color: '#e74c3c' },
      { id: 'verbs', name: 'Kata Kerja', icon: '動', color: '#27ae60' },
      { id: 'adjectives', name: 'Kata Sifat', icon: '形', color: '#f39c12' },
      { id: 'kanji', name: 'Kanji', icon: '漢', color: '#8e44ad' },
      { id: 'kotoba-n5', name: 'Kosakata N5', icon: '語', color: '#f39c12' },
      { id: 'kanji-n5', name: 'Kanji N5', icon: '漢', color: '#8e44ad' },
      { id: 'bunpou-n5', name: 'Tata Bahasa N5', icon: '文', color: '#16a085' }
    ];

    let title = '';
    let items = '';

    categories.forEach(cat => {
      const completed = this.getCategoryLevelsCompleted(cat.id);
      const total = this.getCategoryTotalLevels(cat.id);
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      let detail = '';
      if (type === 'mastered') {
        detail = `${completed} level selesai`;
      } else if (type === 'studied') {
        detail = `${completed} level dipelajari`;
      } else {
        detail = `${percentage}% rata-rata`;
      }

      items += `
        <div class="stats-cat-item">
          <div class="stats-cat-icon" style="background: linear-gradient(135deg, ${cat.color} 0%, ${cat.color}dd 100%)">${cat.icon}</div>
          <div class="stats-cat-info">
            <span class="stats-cat-name">${cat.name}</span>
            <div class="stats-cat-bar">
              <div class="stats-cat-fill" style="width: ${percentage}%; background: ${cat.color}"></div>
            </div>
          </div>
          <span class="stats-cat-percent" style="color: ${cat.color}">${percentage}%</span>
        </div>
      `;
    });

    if (type === 'mastered') {
      title = '📊 Level Dikuasai';
    } else if (type === 'studied') {
      title = '📚 Level Dipelajari';
    } else {
      title = '🏆 Skor Per Kategori';
    }

    const modal = document.createElement('div');
    modal.className = 'stats-modal';
    modal.innerHTML = `
      <div class="stats-modal-content">
        <div class="stats-modal-header">
          <h3>${title}</h3>
          <button class="stats-modal-close" id="close-stats-modal">✕</button>
        </div>
        ${items}
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-stats-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  updateProgressRings() {
    const categories = ['hiragana', 'katakana', 'nouns', 'verbs', 'adjectives', 'kanji', 'kotoba-n5', 'kanji-n5', 'bunpou-n5'];
    categories.forEach(cat => {
      const total = this.getCategoryTotalLevels(cat);
      let completed = 0;

      for (let i = 1; i <= total; i++) {
        const key = `${cat}-level-${i}`;
        if (UserStorage.get(`completed-${key}`) === 'true') {
          completed++;
        }
      }

      const percentage = total > 0 ? (completed / total) * 100 : 0;
      const progressFill = document.querySelector(`.${cat}-progress`);
      if (progressFill) {
        progressFill.style.strokeDasharray = `${percentage}, 100`;
      }

      const card = document.querySelector(`[data-category="${cat}"]`);
      if (card) {
        const progressText = card.querySelector('.progress-text');
        if (progressText) {
          progressText.textContent = `${completed}/${total} level`;
        }
      }
    });
  },

  launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#e74c3c', '#f39c12', '#27ae60', '#3498db', '#9b59b6', '#ff6b6b', '#ffb7c5'];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    let frame = 0;
    const maxFrames = 150;

    const animate = () => {
      if (frame >= maxFrames) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - frame / maxFrames;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotationSpeed;
      });

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
