import { PracticeSession, Subject } from '../types';

const SESSIONS_KEY = 'gate_practice_sessions';
const SUBJECTS_KEY = 'gate_practice_subjects';

export const getStoredSessions = (): PracticeSession[] => {
  try {
    const sessions = localStorage.getItem(SESSIONS_KEY);
    return sessions ? JSON.parse(sessions).map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined
    })) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

export const saveSession = (session: PracticeSession): void => {
  try {
    const sessions = getStoredSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    updateSubjectStats(session);
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const getStoredSubjects = (): Subject[] => {
  try {
    const subjects = localStorage.getItem(SUBJECTS_KEY);
    return subjects ? JSON.parse(subjects).map((subject: any) => ({
      ...subject,
      lastPracticed: subject.lastPracticed ? new Date(subject.lastPracticed) : undefined
    })) : [];
  } catch (error) {
    console.error('Error loading subjects:', error);
    return [];
  }
};

const updateSubjectStats = (session: PracticeSession): void => {
  try {
    const subjects = getStoredSubjects();
    const existingSubject = subjects.find(s => s.name === session.subject);
    
    if (existingSubject) {
      existingSubject.totalQuestions += session.questions.length;
      existingSubject.totalSessions += 1;
      existingSubject.lastPracticed = session.endTime || session.startTime;
    } else {
      subjects.push({
        name: session.subject,
        totalQuestions: session.questions.length,
        totalSessions: 1,
        lastPracticed: session.endTime || session.startTime
      });
    }
    
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error('Error updating subject stats:', error);
  }
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};