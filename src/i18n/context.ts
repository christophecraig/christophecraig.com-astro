import { createContext } from 'astro:content';
import { translations } from './translations';

type Language = 'en' | 'fr';
type Translations = typeof translations.en;

interface LanguageContext {
  language: Language;
  t: Translations;
  switchLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContext>({
  language: 'fr', // Default to French as most customers are French
  t: translations.fr,
  switchLanguage: () => {},
});