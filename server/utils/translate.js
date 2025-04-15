const { Translate } = require('@google-cloud/translate').v2;

// Initialize the Google Translate client
const translate = new Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  key: process.env.GOOGLE_API_KEY
});

/**
 * Translate text using Google Translator API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} - Translated text
 */
const translateText = async (text, targetLang) => {
  try {
    const [translation] = await translate.translate(text, targetLang);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed');
  }
};

/**
 * Detect the language of a text
 * @param {string} text - Text to detect language
 * @returns {Promise<string>} - Language code
 */
const detectLanguage = async (text) => {
  try {
    const [detection] = await translate.detect(text);
    return detection.language;
  } catch (error) {
    console.error('Language detection error:', error);
    throw new Error('Language detection failed');
  }
};

module.exports = {
  translateText,
  detectLanguage
};