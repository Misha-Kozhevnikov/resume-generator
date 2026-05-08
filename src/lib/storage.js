const DRAFT_KEY = 'resume-generator-draft';
const HISTORY_KEY = 'resume-generator-history';

export const storage = {
  saveDraft(data) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  },

  loadDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  },

  saveHistory(entry) {
    const list = this.getHistory();
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 10)));
  },

  getHistory() {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }
};