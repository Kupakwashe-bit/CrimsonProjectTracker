import { Volume2, VolumeX } from 'lucide-react';

const VoiceFeedbackButton = ({ isPlaying, onClick, disabled, label = 'Play voice feedback' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm transition
      ${disabled ? 'cursor-not-allowed bg-white/5 text-text-muted' : 'bg-white/10 text-white hover:bg-white/20'}
    `}
  >
    {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    {isPlaying ? 'Stop Voice' : label}
  </button>
);

export default VoiceFeedbackButton;

