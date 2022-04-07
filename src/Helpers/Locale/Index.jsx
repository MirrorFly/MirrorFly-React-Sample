import LocalizedStrings from 'react-localization';
import { CombineLocale } from './CombineLocale';
import { common } from './Common';
import { user } from './User';

/* Export all the available languages */
export const avaliableLanguages = { en: 'English' }
/* Combine and Export all the available locale */
export const locale = new LocalizedStrings(
    CombineLocale({ common, user })
);

if ((typeof localStorage.getItem('language') === 'string')) {
    locale.setLanguage(localStorage.getItem('language'));
}
