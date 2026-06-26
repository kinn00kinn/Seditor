const WORD_WRAP_KEY = "seditor:wordWrap";
const LEGACY_LINE_WRAP_KEY = "seditor:lineWrap";
const LEGACY_OVERFLOW_FOLD_KEY = "seditor:overflowFold";

const WELCOME_DISMISSED_KEY = "seditor:welcomeDismissed";
const LEGACY_WELCOME_KEY = "seditor:welcomeSeen";
const LEGACY_WELCOME_PREFIX = "seditor:welcomeSeen:";

const DEFAULT_WORD_WRAP = true;

export function readWordWrapPreference() {
  const storedWordWrap = localStorage.getItem(WORD_WRAP_KEY);

  if (storedWordWrap !== null) {
    return storedWordWrap === "true";
  }

  setWordWrapPreference(DEFAULT_WORD_WRAP);
  return DEFAULT_WORD_WRAP;
}

export function setWordWrapPreference(enabled: boolean) {
  const value = String(enabled);
  localStorage.setItem(WORD_WRAP_KEY, value);
  localStorage.setItem(LEGACY_LINE_WRAP_KEY, value);
  localStorage.setItem(LEGACY_OVERFLOW_FOLD_KEY, value);
}

export function resetWordWrapPreference() {
  setWordWrapPreference(DEFAULT_WORD_WRAP);
  return DEFAULT_WORD_WRAP;
}

export function hasDismissedWelcome() {
  if (localStorage.getItem(WELCOME_DISMISSED_KEY) === "true") {
    return true;
  }

  if (localStorage.getItem(LEGACY_WELCOME_KEY) === "true") {
    dismissWelcome();
    return true;
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(LEGACY_WELCOME_PREFIX)) {
      dismissWelcome();
      return true;
    }
  }

  return false;
}

export function dismissWelcome() {
  localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
  localStorage.setItem(LEGACY_WELCOME_KEY, "true");
}
