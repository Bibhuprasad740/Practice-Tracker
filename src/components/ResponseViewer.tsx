import React from 'react';
import { ArrowLeft, Download, Check, X, Hash } from 'lucide-react';
import { PracticeSession, VerifiedPracticeSession, VerifiedQuestion } from '../types';

interface ResponseViewerProps {
  session: PracticeSession;
  onBack: () => void;
  onUpdateSession: (updatedSession: PracticeSession) => void;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ session, onBack, onUpdateSession }) => {
  // Cast the session to our verified type for type safety
  const verifiedSession = session as VerifiedPracticeSession;

  const updateQuestionStatus = (questionId: number, isCorrect: boolean) => {
    const updatedQuestions = verifiedSession.questions.map(q => ({
      ...q,
      isCorrect: q.id === questionId ? isCorrect : q.isCorrect,
      verified: q.id === questionId ? true : q.verified
    }));

    const updatedSession: PracticeSession = {
      ...verifiedSession,
      questions: updatedQuestions
    };

    onUpdateSession(updatedSession);
  };

  const formatAnswer = (question: VerifiedQuestion) => {
    if (question.skipped) return 'Skipped';
    if (question.answer === undefined) return 'Not answered';

    if (question.type === 'MSQ' && Array.isArray(question.answer)) {
      return question.answer.join(', ');
    }

    return question.answer.toString();
  };

  const getQuestionStatus = (question: VerifiedQuestion) => {
    if (question.skipped) return 'skipped';
    if (question.answer === undefined) return 'unanswered';
    if (question.type === 'NAT') return 'nat';
    if (question.verified) return question.isCorrect ? 'correct' : 'incorrect';
    return 'answered';
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

  const getQuestionActions = (question: VerifiedQuestion) => {
    const status = getQuestionStatus(question);

    if (status === 'skipped' || status === 'unanswered') {
      return <X className="h-5 w-5 text-red-600" />;
    }

    if (status === 'nat') {
      return <Hash className="h-5 w-5 text-blue-600" />;
    }

    if (status === 'correct') {
      return <Check className="h-5 w-5 text-green-600" />;
    }

    if (status === 'incorrect') {
      return <X className="h-5 w-5 text-red-600" />;
    }

    return (
      <div className="flex space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateQuestionStatus(question.id, true);
          }}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          aria-label="Mark as correct"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateQuestionStatus(question.id, false);
          }}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          aria-label="Mark as incorrect"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Calculate counts including verified status
  const answeredCount = verifiedSession.questions.filter(q =>
    q.answer !== undefined && !q.skipped
  ).length;
  const correctCount = verifiedSession.questions.filter(q =>
    q.verified && q.isCorrect
  ).length;
  const incorrectCount = verifiedSession.questions.filter(q =>
    q.verified && !q.isCorrect
  ).length;
  const skippedCount = verifiedSession.questions.filter(q => q.skipped).length;
  const totalQuestions = verifiedSession.questions.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - Updated to show correct/incorrect counts */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
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
            <p className="text-blue-700">{verifiedSession.subject}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Correct</h3>
            <p className="text-2xl font-bold text-green-700">{correctCount}/{totalQuestions}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900">Incorrect</h3>
            <p className="text-2xl font-bold text-red-700">{incorrectCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900">Range</h3>
            <p className="text-purple-700">{verifiedSession.startQuestion} - {verifiedSession.endQuestion}</p>
          </div>
        </div>
      </div>

      {/* Responses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verifiedSession.questions.map((question) => {
          const status = getQuestionStatus(question);
          const isIncorrect = status === 'incorrect' || status === 'unanswered';
          const isCorrect = status === 'correct';
          
          return (
            <div 
              key={question.id} 
              className={`rounded-lg shadow-md p-3 transition-all ${
                isIncorrect ? 'bg-red-100' : isCorrect ? 'bg-green-100  ' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 mr-2">Q{question.id}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    question.type === 'MCQ' ? 'bg-blue-100 text-blue-800' :
                    question.type === 'MSQ' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {question.type}
                  </span>
                  {getQuestionActions(question)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className={`text-sm ${
                    question.skipped ? 'text-red-600' :
                    question.answer !== undefined ? 
                      isIncorrect ? 'text-red-600' : 
                      status === 'correct' ? 'text-green-600' : 'text-gray-500'
                    : 'text-gray-500'
                  }`}>
                    {formatAnswer(question)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Updated Summary Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Session Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {verifiedSession.questions.filter(q => q.type === 'MCQ').length}
            </p>
            <p className="text-sm text-gray-600">MCQ Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {verifiedSession.questions.filter(q => q.type === 'MSQ').length}
            </p>
            <p className="text-sm text-gray-600">MSQ Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {verifiedSession.questions.filter(q => q.type === 'NAT').length}
            </p>
            <p className="text-sm text-gray-600">NAT Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {correctCount > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Accuracy Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseViewer;