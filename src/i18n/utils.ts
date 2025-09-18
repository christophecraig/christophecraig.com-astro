import { translations } from './translations';

type Language = 'en' | 'fr';

export function getTranslations(lang: Language) {
  return translations[lang];
}

export function detectLanguageFromPath(pathname: string): Language {
  // No longer detect language from path since we're removing language folders
  return 'fr'; // Default to French
}

export function detectLanguage(request: Request): Language {
  // Check URL parameter first
  const url = new URL(request.url);
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
  // No longer add language prefix since we're removing language folders
  return path;
}