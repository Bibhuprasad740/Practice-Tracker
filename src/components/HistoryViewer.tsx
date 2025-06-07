import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Clock, Trash2 } from 'lucide-react';
import { PracticeSession } from '../types';
import { getStoredSessions } from '../utils/storage';

const HistoryViewer: React.FC = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  useEffect(() => {
    setSessions(getStoredSessions().sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
  }, []);

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'In progress';
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    return `${duration} minutes`;
  };

  const getCompletionRate = (session: PracticeSession) => {
    const answered = session.questions.filter(q => q.answer !== undefined && !q.skipped).length;
    return ((answered / session.questions.length) * 100).toFixed(1);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('gate_practice_sessions', JSON.stringify(updatedSessions));
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Practice Sessions Yet</h3>
          <p className="text-gray-600">Start your first practice session to see your history here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Practice History</h2>
        <p className="text-gray-600">Review your past practice sessions and track your progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{session.subject}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(session.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDuration(new Date(session.startTime), session.endTime ? new Date(session.endTime) : undefined)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Questions {session.startQuestion} - {session.endQuestion}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      session.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.completed ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {getCompletionRate(session)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${getCompletionRate(session)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Details */}
        <div className="lg:col-span-1">
          {selectedSession ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Subject:</span>
                  <p className="text-gray-900">{selectedSession.subject}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Question Range:</span>
                  <p className="text-gray-900">{selectedSession.startQuestion} - {selectedSession.endQuestion}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Start Time:</span>
                  <p className="text-gray-900">{new Date(selectedSession.startTime).toLocaleString()}</p>
                </div>
                
                {selectedSession.endTime && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">End Time:</span>
                    <p className="text-gray-900">{new Date(selectedSession.endTime).toLocaleString()}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedSession.questions.filter(q => q.answer !== undefined && !q.skipped).length}
                      </p>
                      <p className="text-xs text-gray-600">Answered</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {selectedSession.questions.filter(q => q.skipped).length}
                      </p>
                      <p className="text-xs text-gray-600">Skipped</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Question Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">MCQ:</span>
                      <span className="text-sm font-medium">{selectedSession.questions.filter(q => q.type === 'MCQ').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">MSQ:</span>
                      <span className="text-sm font-medium">{selectedSession.questions.filter(q => q.type === 'MSQ').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">NAT:</span>
                      <span className="text-sm font-medium">{selectedSession.questions.filter(q => q.type === 'NAT').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Session</h3>
              <p className="text-gray-600">Click on any session to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryViewer;