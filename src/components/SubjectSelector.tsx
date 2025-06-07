import React, { useState } from 'react';
import { Play, BookOpen } from 'lucide-react';
import { PracticeSession } from '../types';
import { generateSessionId } from '../utils/storage';

interface SubjectSelectorProps {
  onStartSession: (session: PracticeSession) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onStartSession }) => {
  const [subject, setSubject] = useState('');
  const [startQuestion, setStartQuestion] = useState<number>(1);
  const [endQuestion, setEndQuestion] = useState<number>(10);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (startQuestion < 1) {
      newErrors.startQuestion = 'Start question must be at least 1';
    }

    if (endQuestion < startQuestion) {
      newErrors.endQuestion = 'End question must be greater than or equal to start question';
    }

    if (endQuestion - startQuestion > 100) {
      newErrors.endQuestion = 'Maximum 100 questions per session';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartSession = () => {
    if (!validateInputs()) return;

    const questions = [];
    for (let i = startQuestion; i <= endQuestion; i++) {
      questions.push({
        id: i,
        type: 'MCQ' as const,
      });
    }

    const session: PracticeSession = {
      id: generateSessionId(),
      subject: subject.trim(),
      startQuestion,
      endQuestion,
      questions,
      startTime: new Date(),
      completed: false,
    };

    onStartSession(session);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Start New Practice Session</h2>
          <p className="text-gray-600">Set up your GATE exam practice session</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleStartSession(); }}>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Computer Science, Mathematics, Electronics"
            />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startQuestion" className="block text-sm font-medium text-gray-700 mb-2">
                Start Question Number
              </label>
              <input
                type="number"
                id="startQuestion"
                value={startQuestion}
                onChange={(e) => setStartQuestion(parseInt(e.target.value) || 1)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.startQuestion ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
              />
              {errors.startQuestion && <p className="mt-1 text-sm text-red-600">{errors.startQuestion}</p>}
            </div>

            <div>
              <label htmlFor="endQuestion" className="block text-sm font-medium text-gray-700 mb-2">
                End Question Number
              </label>
              <input
                type="number"
                id="endQuestion"
                value={endQuestion}
                onChange={(e) => setEndQuestion(parseInt(e.target.value) || 10)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.endQuestion ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
              />
              {errors.endQuestion && <p className="mt-1 text-sm text-red-600">{errors.endQuestion}</p>}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between text-sm text-blue-800">
              <span>Total Questions:</span>
              <span className="font-semibold">{Math.max(0, endQuestion - startQuestion + 1)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Practice Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubjectSelector;