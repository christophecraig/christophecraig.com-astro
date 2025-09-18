import { translations } from './translations';

type Language = 'en' | 'fr';

export function getTranslations(lang: Language) {
  return translations[lang];
}

export function detectLanguageFromPath(pathname: string): Language {
  // Check if the path starts with /en/
  if (pathname.startsWith('/en/')) {
    return 'en';
  }
  // Default to French for all other paths
  return 'fr';
}

export function detectLanguage(request: Request): Language {
  // Check URL path first
  const url = new URL(request.url);
  const langFromPath = detectLanguageFromPath(url.pathname);
  if (langFromPath === 'en' || langFromPath === 'fr') {
    return langFromPath;
  }
  
  // Check URL parameter as fallback
  const langParam = url.searchParams.get('lang');
  if (langParam === 'en' || langParam === 'fr') {
    return langParam;
  }
  
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',');
    for (const lang of languages) {
      const cleanLang = lang.trim().split(';')[0];
      if (cleanLang === 'fr' || cleanLang === 'fr-FR') {
        return 'fr';
      }
      if (cleanLang === 'en' || cleanLang === 'en-US' || cleanLang === 'en-GB') {
        return 'en';
      }
    }
  }
  
  // Check cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('lang=')) {
        const lang = cookie.split('=')[1];
        if (lang === 'en' || lang === 'fr') {
          return lang;
        }
      }
    }
  }
  
  // Default to French
  return 'fr';
}

export function getLocalizedPath(path: string, lang: Language): string {
  // Remove any existing language prefix
  let cleanPath = path;
  if (path.startsWith('/en/')) {
    cleanPath = path.substring(3); // Remove '/en'
  } else if (path.startsWith('/fr/')) {
    cleanPath = path.substring(3); // Remove '/fr'
  } else if (path === '/en') {
    cleanPath = '/';
  } else if (path === '/fr') {
    cleanPath = '/';
  }
  
  // If it's the home page
  if (cleanPath === '/') {
    return lang === 'en' ? '/en/' : '/';
  }
  
  // For other paths, add language prefix for English
  return lang === 'en' ? `/en${cleanPath}` : cleanPath;
}

export function isValidLanguage(lang: string): lang is Language {
  return lang === 'en' || lang === 'fr';
}