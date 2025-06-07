import React from 'react';
import { ArrowLeft, Download, Check, X, Hash } from 'lucide-react';
import { PracticeSession } from '../types';

interface ResponseViewerProps {
  session: PracticeSession;
  onBack: () => void;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ session, onBack }) => {
  const formatAnswer = (question: any) => {
    if (question.skipped) return 'Skipped';
    if (question.answer === undefined) return 'Not answered';
    
    if (question.type === 'MSQ' && Array.isArray(question.answer)) {
      return question.answer.join(', ');
    }
    
    return question.answer.toString();
  };

  const getQuestionIcon = (question: any) => {
    if (question.skipped) return <X className="h-5 w-5 text-red-600" />;
    if (question.answer === undefined) return <div className="h-5 w-5 border-2 border-gray-300 rounded" />;
    
    if (question.type === 'NAT') return <Hash className="h-5 w-5 text-blue-600" />;
    return <Check className="h-5 w-5 text-green-600" />;
  };

  const exportResponses = () => {
    const responses = session.questions.map(q => ({
      question: q.id,
      type: q.type,
      answer: formatAnswer(q),
      status: q.skipped ? 'Skipped' : q.answer !== undefined ? 'Answered' : 'Not answered'
    }));

    const exportData = {
      session: {
        subject: session.subject,
        questionRange: `${session.startQuestion}-${session.endQuestion}`,
        startTime: session.startTime,
        endTime: session.endTime,
        totalQuestions: session.questions.length,
        answered: session.questions.filter(q => q.answer !== undefined && !q.skipped).length,
        skipped: session.questions.filter(q => q.skipped).length
      },
      responses
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gate_practice_${session.subject.replace(/\s+/g, '_')}_${session.startTime.toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const answeredCount = session.questions.filter(q => q.answer !== undefined && !q.skipped).length;
  const skippedCount = session.questions.filter(q => q.skipped).length;
  const totalQuestions = session.questions.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Setup
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Practice Session Summary</h2>
          <button
            onClick={exportResponses}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">Subject</h3>
            <p className="text-blue-700">{session.subject}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Answered</h3>
            <p className="text-2xl font-bold text-green-700">{answeredCount}/{totalQuestions}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900">Skipped</h3>
            <p className="text-2xl font-bold text-red-700">{skippedCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900">Range</h3>
            <p className="text-purple-700">{session.startQuestion} - {session.endQuestion}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{((answeredCount / totalQuestions) * 100).toFixed(1)}% Completed</span>
          <span>{totalQuestions - answeredCount - skippedCount} Unanswered</span>
        </div>
      </div>

      {/* Responses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {session.questions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Q{question.id}</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  question.type === 'MCQ' ? 'bg-blue-100 text-blue-800' :
                  question.type === 'MSQ' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {question.type}
                </span>
                {getQuestionIcon(question)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Answer:</span>
                <p className={`text-sm ${
                  question.skipped ? 'text-red-600' :
                  question.answer !== undefined ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {formatAnswer(question)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Session Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{session.questions.filter(q => q.type === 'MCQ').length}</p>
            <p className="text-sm text-gray-600">MCQ Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{session.questions.filter(q => q.type === 'MSQ').length}</p>
            <p className="text-sm text-gray-600">MSQ Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{session.questions.filter(q => q.type === 'NAT').length}</p>
            <p className="text-sm text-gray-600">NAT Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{((answeredCount / totalQuestions) * 100).toFixed(0)}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseViewer;