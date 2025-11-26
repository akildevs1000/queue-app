import * as Speech from 'expo-speech';

let tokenSound = null;
let cachedVoices = { ar: null, en: null, fr: null, es: null };

export const preloadAudioAndTTS = async () => {
    try {
        // Preload TTS voices for all languages
        Speech.speak("", { language: "en-US", rate: 1.0 });
        return true;
    } catch (err) {
        console.error('TTS Preload failed:', err);
        return false;
    }
};

export const announceTheToken = (token, counter, language = "en") => {
    if (!token) return;

    const messages = {
        ar: `الرقم ${token}، يرجى التوجه إلى ${counter}.`,
        en: `Token ${token}, please proceed to the ${counter}.`,
        fr: `Numéro ${token}, veuillez vous rendre à ${counter}.`,
        es: `Número ${token}, por favor proceda a ${counter}.`,
    };

    const message = messages[language] || messages["en"];
    const speak = () => Speech.speak(message, { language: language === 'ar' ? 'ar' : 'en-US' });

    if (tokenSound) {
        tokenSound.replayAsync();
        setTimeout(() => speak(), 1000);
    } else {
        speak();
    }
};

export const setTokenSound = (sound) => {
    tokenSound = sound;
};

export const getCachedVoices = () => cachedVoices;
