const AUTH_STORAGE_KEY = "cookit-user";
const AUTH_CHANGE_EVENT = "cookit-auth-change";

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
}

function emitAuthChange(user) {
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGE_EVENT, {
      detail: user,
    }),
  );
}

function setStoredUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  emitAuthChange(user);
}

function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  emitAuthChange(null);
}

export { AUTH_CHANGE_EVENT, clearStoredUser, getStoredUser, setStoredUser };