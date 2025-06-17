import React, { useState, useEffect } from 'react';
import { BookOpen, History, BarChart3 } from 'lucide-react';
import SubjectSelector from './components/SubjectSelector';
import QuestionSolver from './components/QuestionSolver';
import ResponseViewer from './components/ResponseViewer';
import HistoryViewer from './components/HistoryViewer';
import Analytics from './components/Analytics';
import { PracticeSession, Subject } from './types';
import { getStoredSessions, getStoredSubjects } from './utils/storage';

type View = 'setup' | 'solving' | 'review' | 'history' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<View>('setup');
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    setSubjects(getStoredSubjects());
  }, []);

  const handleStartSession = (session: PracticeSession) => {
    setCurrentSession(session);
    setCurrentView('solving');
  };

  const handleFinishSolving = () => {
    setCurrentView('review');
  };

  const handleBackToSetup = () => {
    setCurrentSession(null);
    setCurrentView('setup');
    setSubjects(getStoredSubjects()); // Refresh subjects
  };

  const renderNavigation = () => (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 overflow-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Practice</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('setup')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'setup'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                currentView === 'history'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                currentView === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {renderNavigation()}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'setup' && (
          <SubjectSelector onStartSession={handleStartSession} />
        )}
        
        {currentView === 'solving' && currentSession && (
          <QuestionSolver
            session={currentSession}
            onFinish={handleFinishSolving}
            onBack={handleBackToSetup}
          />
        )}
        
        {currentView === 'review' && currentSession && (
          <ResponseViewer
            session={currentSession}
            onBack={handleBackToSetup}
          />
        )}
        
        {currentView === 'history' && (
          <HistoryViewer />
        )}
        
        {currentView === 'analytics' && (
          <Analytics subjects={subjects} />
        )}
      </main>
    </div>
  );
}

export default App;