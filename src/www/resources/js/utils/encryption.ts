import CryptoJS from 'crypto-js';

export interface LicenseData {
    expiry_date: string;
    [key: string]: any; // any other properties
}

export const decryptData = (encryptedData: string, secretKey: string): LicenseData | null => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
