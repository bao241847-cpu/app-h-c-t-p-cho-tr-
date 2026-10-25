import React from 'react';

export type MascotMood = 'happy' | 'encouraging' | 'thinking' | 'celebrating' | 'gentle';

interface MascotMessageProps {
  message: string;
  mood?: MascotMood;
  onVoiceRead?: () => void;
}

export const MascotMessage: React.FC<MascotMessageProps> = ({
  message,
  mood = 'happy',
  onVoiceRead,
}) => {
  const getAvatar = () => {
    switch (mood) {
      case 'celebrating':
        return '🎉🐰';
      case 'thinking':
        return '🤔🐰';
      case 'encouraging':
        return '💪🐰';
      case 'gentle':
        return '💖🐰';
      default:
        return '✨🐰';
    }
  };

  const getBorderColor = () => {
    switch (mood) {
      case 'celebrating':
        return 'border-amber-300 bg-amber-50/90 text-amber-900';
      case 'encouraging':
        return 'border-rose-300 bg-rose-50/90 text-rose-900';
      case 'gentle':
        return 'border-sky-300 bg-sky-50/90 text-sky-900';
      default:
        return 'border-amber-200 bg-amber-50/80 text-amber-900';
    }
  };

  return (
    <div className="flex items-start gap-3 my-4">
      <div className="text-3xl sm:text-4xl select-none animate-bounce flex-shrink-0 pt-1">
        {getAvatar()}
      </div>
      <div
        className={`relative flex-1 p-3.5 sm:p-4 rounded-2xl border-2 ${getBorderColor()} shadow-sm font-medium text-xs sm:text-sm leading-relaxed`}
      >
        {/* Triangle pointer */}
        <div className="absolute top-4 -left-2 w-3 h-3 bg-inherit border-l-2 border-b-2 border-inherit transform rotate-45" />
        <div className="flex items-center justify-between gap-2">
          <span>{message}</span>
          {onVoiceRead && (
            <button
              onClick={onVoiceRead}
              className="text-xs bg-white/80 hover:bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200 font-bold flex-shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              🔊 Nghe
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
