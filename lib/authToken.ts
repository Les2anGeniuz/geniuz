const KEY = "access_token";

export const getAuthToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(KEY);

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
};