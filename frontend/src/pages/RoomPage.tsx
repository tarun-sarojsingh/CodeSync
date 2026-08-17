import { useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';
import EditorArea from '../components/EditorArea';
import BottomStatusBar from '../components/BottomStatusBar';
import { useState } from 'react';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [language, setLanguage] = useState('javascript');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <TopNav 
        roomId={roomId || ''} 
        language={language}
        setLanguage={setLanguage}
        onShareClick={() => setIsShareModalOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <EditorArea language={language} />
        
        {/* Share Modal - simple slide down implementation */}
        <div className={`absolute top-0 right-4 mt-2 p-4 bg-surface border border-border rounded-lg shadow-xl transition-transform duration-300 z-50 ${isShareModalOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Share Room</h3>
            <button onClick={() => setIsShareModalOpen(false)} className="text-secondary hover:text-primary">&times;</button>
          </div>
          <div className="flex space-x-2">
            <input 
              type="text" 
              readOnly 
              value={window.location.href} 
              className="px-2 py-1 bg-background border border-border rounded text-sm w-64 text-primary focus:outline-none"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // Optionally show a checkmark (implement later)
              }}
              className="px-3 py-1 bg-brand text-white text-sm rounded hover:bg-opacity-90 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <BottomStatusBar status="connected" latency={42} />
    </div>
  );
}
