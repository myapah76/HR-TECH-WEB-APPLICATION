import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkCookiesEnabled() {
  if (typeof window === 'undefined') return true;
  
  try {
    const testVal = 'test_' + Math.random();
    document.cookie = `cookietest=${testVal}; SameSite=Lax`;
    const ret = document.cookie.indexOf(`cookietest=${testVal}`) !== -1;
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:00 GMT; SameSite=Lax';
    return ret;
  } catch (e) {
    return false;
  }
}
