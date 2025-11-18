import { Mic, MicOff } from 'lucide-react';

const VoiceCommandIndicator = ({ active, supported, lastCommand }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-muted">
    <div className="flex items-center gap-2 text-white">
      {supported ? (
        active ? (
          <Mic className="h-4 w-4 text-success" />
        ) : (
          <MicOff className="h-4 w-4 text-text-muted" />
        )
      ) : (
        <MicOff className="h-4 w-4 text-danger" />
      )}
      <span>{supported ? (active ? 'Listening for commands' : 'Voice commands paused') : 'Voice commands unavailable'}</span>
    </div>
    {lastCommand && <p className="mt-1 text-xs uppercase tracking-[0.3em] text-text-muted">“{lastCommand}”</p>}
  </div>
);

export default VoiceCommandIndicator;

