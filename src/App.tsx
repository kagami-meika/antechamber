import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { ChatTimeline } from './components/ChatTimeline';
import { Composer } from './components/Composer';
import { PresencesModal } from './components/PresencesModal';
import { ExportModal } from './components/ExportModal';
import { TitleBar } from './components/TitleBar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { GlobalSearchPanel } from './components/GlobalSearchPanel';

export const App: React.FC = () => {
  const { init, loading, error, theme, isConfirmOpen, confirmData, closeConfirm, isSearchActive } = useAppStore();
  const [isPresencesOpen, setIsPresencesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-zinc-950 font-sans text-xs text-zinc-400">
        正在初始化心灵场域...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 font-sans text-xs text-red-500 p-4">
        <p className="font-semibold mb-2">加载失败</p>
        <p className="font-mono text-zinc-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 font-sans">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onOpenPresencesModal={() => setIsPresencesOpen(true)}
          onOpenExportModal={() => setIsExportOpen(true)}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
          onOpenAboutModal={() => setIsAboutOpen(true)}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {isSearchActive ? (
            <GlobalSearchPanel />
          ) : (
            <>
              <ChatTimeline />
              <Composer />
            </>
          )}
        </main>
      </div>

      {isConfirmOpen && confirmData && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title={confirmData.title}
          message={confirmData.message}
          onConfirm={() => {
            confirmData.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
        />
      )}

      <PresencesModal
        isOpen={isPresencesOpen}
        onClose={() => setIsPresencesOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};


export default App;
