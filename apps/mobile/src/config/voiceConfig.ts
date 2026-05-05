/**
 * Locale used for on-device speech-to-text recognition.
 *
 * `en-IN` (English – India) is preferred over `hi-IN` for the following reasons:
 *  - English speech is transcribed correctly in Roman script.
 *  - Hinglish speech (code-switched Hindi/English) is kept in Roman script rather
 *    than being forced into Devanagari, which GPT extracts far more reliably.
 *  - `en-IN` understands Indian English accents better than `en-US`.
 *
 * There is no "Hinglish" locale in any standard STT engine (iOS CoreSpeech /
 * Android SpeechRecognizer). `en-IN` is the closest available configuration.
 * Pure Hindi words may be phonetically transliterated to Roman script or
 * occasionally dropped — this is a platform STT limitation, not a code issue.
 */
export const STT_LOCALE = 'en-IN';
