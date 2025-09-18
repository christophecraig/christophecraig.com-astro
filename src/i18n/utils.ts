import { translations } from './translations';

type Language = 'en' | 'fr';

export function getTranslations(lang: Language) {
  return translations[lang];
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
  
  // Default to French
  return 'fr';
}