import { useEffect, useMemo, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const defaultCommands = [
  {
    command: ['show tasks', 'open tasks'],
    callback: ({ onCommand }) => onCommand?.('tasks'),
  },
  {
    command: ['show overview', 'open overview', 'show dashboard'],
    callback: ({ onCommand }) => onCommand?.('overview'),
  },
  {
    command: ['show risks', 'open risks'],
    callback: ({ onCommand }) => onCommand?.('risks'),
  },
];

export const useVoiceCommands = ({ enabled = false, onCommand, commands = [] } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);

  const normalizedCommands = useMemo(() => {
    const mappedDefaults = defaultCommands.map(({ command, callback }) => ({
      command,
      callback: (phrase) => {
        setLastCommand(phrase);
        callback({ onCommand });
      },
    }));

    const mappedCustom = commands.map(({ command, callback }) => ({
      command,
      callback: (phrase) => {
        setLastCommand(phrase);
        callback?.(phrase);
      },
    }));

    return [...mappedDefaults, ...mappedCustom];
  }, [commands, onCommand]);

  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands: normalizedCommands });

  useEffect(() => {
    if (!enabled || !browserSupportsSpeechRecognition) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      return undefined;
    }

    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    setIsListening(true);

    return () => {
      SpeechRecognition.stopListening();
      setIsListening(false);
    };
  }, [enabled, browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (!listening) {
      setIsListening(false);
    }
  }, [listening]);

  return {
    isListening,
    supported: browserSupportsSpeechRecognition,
    lastCommand,
  };
};

export default useVoiceCommands;

