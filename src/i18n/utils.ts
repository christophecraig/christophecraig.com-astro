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
  
  // Default to French
  return 'fr';
}

export function getLocalizedPath(path: string, lang: Language): string {
  // If it's the home page
  if (path === '/') {
    return lang === 'en' ? '/en/' : '/';
  }
  
  // For other paths, add /en prefix for English
  return lang === 'en' ? `/en${path}` : path;
}