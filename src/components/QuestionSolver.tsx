import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, ArrowLeft, Check, X } from 'lucide-react';
import { PracticeSession, QuestionType } from '../types';
import { saveSession } from '../utils/storage';

interface QuestionSolverProps {
  session: PracticeSession;
  onFinish: () => void;
  onBack: () => void;
}

const QuestionSolver: React.FC<QuestionSolverProps> = ({ session, onFinish, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionData, setSessionData] = useState<PracticeSession>(session);
  const [natAnswer, setNatAnswer] = useState<string>('');

  useEffect(() => {
    // Auto-save session whenever it changes
    saveSession(sessionData);
  }, [sessionData]);

  const currentQuestion = sessionData.questions[currentQuestionIndex];

  const updateQuestion = (questionId: number, updates: any) => {
    setSessionData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const handleTypeChange = (newType: QuestionType) => {
    updateQuestion(currentQuestion.id, { 
      type: newType, 
      answer: undefined,
      skipped: false 
    });
    setNatAnswer('');
  };

  const handleMCQAnswer = (option: string) => {
    updateQuestion(currentQuestion.id, { 
      answer: option,
      skipped: false 
    });
  };

  const handleMSQAnswer = (option: string) => {
    const currentAnswers = Array.isArray(currentQuestion.answer) ? currentQuestion.answer : [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(a => a !== option)
      : [...currentAnswers, option];
    
    updateQuestion(currentQuestion.id, { 
      answer: newAnswers,
      skipped: false 
    });
  };

  const handleNATAnswer = () => {
    const numValue = parseFloat(natAnswer);
    if (!isNaN(numValue)) {
      updateQuestion(currentQuestion.id, { 
        answer: numValue,
        skipped: false 
      });
    }
  };

  const handleSkip = () => {
    updateQuestion(currentQuestion.id, { 
      skipped: true,
      answer: undefined 
    });
    setNatAnswer('');
  };

  const handleFinish = () => {
    const updatedSession = {
      ...sessionData,
      endTime: new Date(),
      completed: true
    };
    setSessionData(updatedSession);
    saveSession(updatedSession);
    onFinish();
  };

  const getAnsweredCount = () => {
    return sessionData.questions.filter(q => q.answer !== undefined && !q.skipped).length;
  };

  const getSkippedCount = () => {
    return sessionData.questions.filter(q => q.skipped).length;
  };

  const renderQuestionTypeSelector = () => (
    <div className="flex space-x-2 mb-6">
      {(['MCQ', 'MSQ', 'NAT'] as QuestionType[]).map(type => (
        <button
          key={type}
          onClick={() => handleTypeChange(type)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentQuestion.type === type
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );

  const renderMCQOptions = () => (
    <div className="grid grid-cols-2 gap-4">
      {['A', 'B', 'C', 'D'].map(option => (
        <button
          key={option}
          onClick={() => handleMCQAnswer(option)}
          className={`p-4 border-2 rounded-lg font-semibold transition-all ${
            currentQuestion.answer === option
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          }`}
        >
          Option {option}
        </button>
      ))}
    </div>
  );

  const renderMSQOptions = () => (
    <div className="grid grid-cols-2 gap-4">
      {['A', 'B', 'C', 'D'].map(option => {
        const isSelected = Array.isArray(currentQuestion.answer) && currentQuestion.answer.includes(option);
        return (
          <button
            key={option}
            onClick={() => handleMSQAnswer(option)}
            className={`p-4 border-2 rounded-lg font-semibold transition-all flex items-center justify-between ${
              isSelected
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
            }`}
          >
            <span>Option {option}</span>
            {isSelected && <Check className="h-5 w-5" />}
          </button>
        );
      })}
    </div>
  );

  const renderNATInput = () => (
    <div className="flex space-x-4">
      <input
        type="number"
        step="any"
        value={natAnswer}
        onChange={(e) => setNatAnswer(e.target.value)}
        placeholder="Enter numerical answer"
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleNATAnswer}
        disabled={!natAnswer.trim()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Save Answer
      </button>
    </div>
  );

  const renderQuestionStatus = (question: any, index: number) => {
    if (question.skipped) return 'bg-red-100 text-red-700';
    if (question.answer !== undefined) return 'bg-green-100 text-green-700';
    return index === currentQuestionIndex ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-3xl mx-auto">
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
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{sessionData.subject}</h2>
            <p className="text-gray-600">Questions {sessionData.startQuestion} - {sessionData.endQuestion}</p>
          </div>
          <button
            onClick={handleFinish}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Review Answers
          </button>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Answered: <strong className="text-green-600">{getAnsweredCount()}</strong></span>
          <span>Skipped: <strong className="text-red-600">{getSkippedCount()}</strong></span>
          <span>Remaining: <strong className="text-blue-600">{sessionData.questions.length - getAnsweredCount() - getSkippedCount()}</strong></span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>
        <div className="grid grid-cols-10 gap-2">
          {sessionData.questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`p-2 rounded text-sm font-medium transition-colors ${renderQuestionStatus(question, index)}`}
            >
              {question.id}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Question {currentQuestion.id}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(sessionData.questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === sessionData.questions.length - 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {renderQuestionTypeSelector()}

        <div className="mb-8">
          {currentQuestion.type === 'MCQ' && renderMCQOptions()}
          {currentQuestion.type === 'MSQ' && renderMSQOptions()}
          {currentQuestion.type === 'NAT' && renderNATInput()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleSkip}
            className="flex items-center px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Skip Question
          </button>

          <div className="text-sm text-gray-600">
            {currentQuestion.skipped && <span className="text-red-600">Question skipped</span>}
            {currentQuestion.answer !== undefined && !currentQuestion.skipped && (
              <span className="text-green-600">Answer saved {currentQuestion.answer}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSolver;