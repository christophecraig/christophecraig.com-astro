import { describe, it, expect } from 'vitest';
import { getTranslations, detectLanguageFromPath, isValidLanguage } from './utils';

describe('i18n utils', () => {
  it('should return English translations', () => {
    const translations = getTranslations('en');
    expect(translations.greeting).toBe("Hi, I'm Christophe");
  });

  it('should return French translations', () => {
    const translations = getTranslations('fr');
    expect(translations.greeting).toBe('Salut, je suis Christophe');
  });

  it('should detect English language from path', () => {
    expect(detectLanguageFromPath('/en/about')).toBe('en');
    expect(detectLanguageFromPath('/en/')).toBe('en');
  });

  it('should default to French for non-English paths', () => {
    expect(detectLanguageFromPath('/fr/about')).toBe('fr');
    expect(detectLanguageFromPath('/projects')).toBe('fr');
  });

  it('should validate languages correctly', () => {
    expect(isValidLanguage('en')).toBe(true);
    expect(isValidLanguage('fr')).toBe(true);
    expect(isValidLanguage('es')).toBe(false);
  });
});