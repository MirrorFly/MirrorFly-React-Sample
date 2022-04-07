import {avaliableLanguages} from './Index';

export const CombineLocale = (locale) => {
    let combineAll = {};
    for (let key in avaliableLanguages) {
        combineAll[key] = {};
    }
    for (let key in locale) {
        for (var lang in locale[key]) {
            if(combineAll.hasOwnProperty(lang)) {
                combineAll[lang][key] = locale[key][lang];
            }
        }
    }
    return combineAll;
}
