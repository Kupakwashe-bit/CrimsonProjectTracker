import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const isBrowser = typeof window !== 'undefined';
const defaultOptions = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
};

const getSpeechSynthesis = () => {
  if (!isBrowser || typeof window.speechSynthesis === 'undefined') {
    return null;
  }
  return window.speechSynthesis;
};

const mergeOptions = (base, override) => ({
  ...base,
  ...override,
});

export const useVoiceFeedback = (options = {}) => {
  const mergedDefaults = useMemo(() => mergeOptions(defaultOptions, options), [options]);
  const synthRef = useRef(getSpeechSynthesis());
  const utteranceRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [supported] = useState(Boolean(synthRef.current));

  const stop = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text, overrideOptions = {}) => {
      if (!text || !synthRef.current) return;

      // Interrupt current playback
      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const finalOptions = mergeOptions(mergedDefaults, overrideOptions);

      utterance.rate = finalOptions.rate;
      utterance.pitch = finalOptions.pitch;
      utterance.volume = finalOptions.volume;

      if (finalOptions.voice && availableVoices.length) {
        const selected = availableVoices.find((voice) => voice.name === finalOptions.voice);
        if (selected) {
          utterance.voice = selected;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        utteranceRef.current = null;
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        utteranceRef.current = null;
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [availableVoices, mergedDefaults, stop],
  );

  useEffect(() => {
    if (!synthRef.current) return undefined;

    const populateVoices = () => {
      const voices = synthRef.current.getVoices();
      if (voices?.length) {
        setAvailableVoices(voices);
      }
    };

    synthRef.current.addEventListener?.('voiceschanged', populateVoices);
    populateVoices();

    return () => {
      synthRef.current?.removeEventListener?.('voiceschanged', populateVoices);
    };
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    supported,
    availableVoices,
  };
};

export default useVoiceFeedback;

