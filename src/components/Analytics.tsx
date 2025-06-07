import React from 'react';
import { TrendingUp, BookOpen, Clock, Target } from 'lucide-react';
import { Subject } from '../types';

interface AnalyticsProps {
  subjects: Subject[];
}

const Analytics: React.FC<AnalyticsProps> = ({ subjects }) => {
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.totalQuestions, 0);
  const totalSessions = subjects.reduce((sum, subject) => sum + subject.totalSessions, 0);
  const averageQuestionsPerSession = totalSessions > 0 ? (totalQuestions / totalSessions).toFixed(1) : '0';

  const getMostPracticedSubject = () => {
    if (subjects.length === 0) return null;
    return subjects.reduce((max, subject) => 
      subject.totalQuestions > max.totalQuestions ? subject : max
    );
  };

  const getRecentlyPracticedSubjects = () => {
    return subjects
      .filter(subject => subject.lastPracticed)
      .sort((a, b) => new Date(b.lastPracticed!).getTime() - new Date(a.lastPracticed!).getTime())
      .slice(0, 5);
  };

  const mostPracticed = getMostPracticedSubject();
  const recentSubjects = getRecentlyPracticedSubjects();

  if (subjects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Yet</h3>
          <p className="text-gray-600">Start practicing to see your progress analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Practice Analytics</h2>
        <p className="text-gray-600">Track your GATE exam preparation progress across subjects</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Questions</p>
              <p className="text-3xl font-bold">{totalQuestions}</p>
            </div>
            <Target className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Practice Sessions</p>
              <p className="text-3xl font-bold">{totalSessions}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Subjects Covered</p>
              <p className="text-3xl font-bold">{subjects.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg. Questions/Session</p>
              <p className="text-3xl font-bold">{averageQuestionsPerSession}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
          <div className="space-y-4">
            {subjects
              .sort((a, b) => b.totalQuestions - a.totalQuestions)
              .map((subject, index) => (
                <div key={subject.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <p className="text-sm text-gray-600">{subject.totalSessions} sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{subject.totalQuestions}</p>
                    <p className="text-sm text-gray-600">questions</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentSubjects.length > 0 ? (
            <div className="space-y-4">
              {recentSubjects.map((subject) => (
                <div key={subject.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{subject.name}</h4>
                    <p className="text-sm text-gray-600">
                      Last practiced: {subject.lastPracticed ? new Date(subject.lastPracticed).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{subject.totalQuestions} questions</p>
                    <p className="text-sm text-gray-600">{subject.totalSessions} sessions</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Most Practiced Subject Highlight */}
      {mostPracticed && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Most Practiced Subject</h3>
              <p className="text-2xl font-bold text-green-600">{mostPracticed.name}</p>
              <p className="text-gray-600">
                {mostPracticed.totalQuestions} questions across {mostPracticed.totalSessions} sessions
              </p>
            </div>
            <div className="text-right">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Keep it up!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;