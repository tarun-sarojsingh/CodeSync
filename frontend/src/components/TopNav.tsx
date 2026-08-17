import { Code2, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserInfo } from '../utils/user';

interface TopNavProps {
  roomId: string;
  language: string;
  setLanguage: (lang: string) => void;
  onShareClick: () => void;
  activeUsers: UserInfo[];
}

export default function TopNav({ roomId, language, setLanguage, onShareClick, activeUsers }: TopNavProps) {
  const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css'];

  return (
    <header className="h-[60px] bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center text-brand hover:opacity-80 transition-opacity">
          <Code2 size={24} />
        </Link>
        <div className="h-4 w-px bg-border"></div>
        <span className="text-sm font-medium text-secondary truncate max-w-[200px]">
          Room: <span className="text-primary">{roomId}</span>
        </span>
      </div>

      <div className="flex items-center justify-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-background border border-border text-primary text-sm rounded-full px-4 py-1.5 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex -space-x-2">
          {activeUsers.map((avatar, i) => (
            <div 
              key={i}
              className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 cursor-help"
              style={{ backgroundColor: avatar.color, color: '#0F1115' }}
              title={avatar.name}
            >
              {avatar.name.charAt(avatar.name.indexOf(' ') + 1)}
            </div>
          ))}
        </div>
        
        <button 
          onClick={onShareClick}
          className="flex items-center px-4 py-1.5 bg-brand text-white text-sm font-medium rounded hover:bg-opacity-90 transition-all hover:-translate-y-px shadow-sm"
        >
          <Share2 size={16} className="mr-2" />
          Share
        </button>
      </div>
    </header>
  );
}
