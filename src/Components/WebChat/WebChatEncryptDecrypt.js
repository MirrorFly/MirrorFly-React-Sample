import { ls } from '../../Helpers/LocalStorage';
import { REACT_APP_ENCRYPT_KEY, REACT_APP_LICENSE_KEY } from '../processENV';
import CryptoJS from 'crypto-js';

/**
 * Encrypt the json object and store into localstorage
 * @param {string} key Localstorage Key
 * @param {object} data Localstorage data - json object
 */
export function encryptAndStoreInLocalStorage(key, data) {
    let ecytData = encrypt(JSON.stringify(data), key);
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    ls.setItem(encryptedKey, ecytData);
    return true;
}

/**
 * Decrypt the json object and retive data from localstorage
 * @param {string} key Localstorage Key
 */
export function getFromLocalStorageAndDecrypt(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    let lsData = ls.getItem(encryptedKey);
    try {
        let dcypData = decrypt(lsData, key);
        return JSON.parse(dcypData);
    } catch (error){
        return lsData;
    }    
}

/**
 * Encrypt the json object and store into session storage
 * @param {string} key Session storage Key
 * @param {object} data Session storage data - json object
 */
 export function encryptAndStoreInSessionStorage(key, data) {
    let ecytData = encrypt(JSON.stringify(data), key);
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    sessionStorage.setItem(encryptedKey, ecytData);
    return true;
}

/**
 * Decrypt the json object and retive data from session storage
 * @param {string} key Session storage Key
 */
export function getFromSessionStorageAndDecrypt(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    let lsData = sessionStorage.getItem(encryptedKey);
    try {
        let dcypData = decrypt(lsData, key);
        return JSON.parse(dcypData);
    } catch (error){
        return lsData;
    }    
}

export function deleteItemFromLocalStorage(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    localStorage.removeItem(encryptedKey);
}

export function deleteItemFromSessionStorage(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    sessionStorage.removeItem(encryptedKey);
}

const encrypt = (data, key) => {
  const encryptKey = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256(key).toString().substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse(REACT_APP_ENCRYPT_KEY.substring(0, 16));
  return CryptoJS.AES.encrypt(encodeURIComponent(data), encryptKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
};
  
const decrypt = (data, key) => {
  const decryptKey = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256(key).toString().substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse(REACT_APP_ENCRYPT_KEY.substring(0, 16));
  return decodeURIComponent(
    CryptoJS.AES.decrypt(data, decryptKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8)
  );
};
