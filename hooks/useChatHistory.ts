import { useState, useCallback } from 'react';
import { ChatMessage, ScenarioDetails, AnalysisReport } from '../types';

export interface ChatSession {
  id: string;
  timestamp: Date;
  scenarioDetails: ScenarioDetails;
  conversationHistory: ChatMessage[];
  finalEngagement: number;
  analysisReport?: AnalysisReport;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const saveSession = useCallback((session: ChatSession) => {
    setSessions(prev => {
      const newSessions = [...prev, session];
      // Keep only the last 10 sessions to prevent memory issues
      if (newSessions.length > 10) {
        return newSessions.slice(-10);
      }
      return newSessions;
    });
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, []);

  const exportSession = useCallback((session: ChatSession) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sosheiq-session-${session.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportAllSessions = useCallback(() => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sosheiq-all-sessions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sessions]);

  const getSessionById = useCallback((id: string) => {
    return sessions.find(session => session.id === id);
  }, [sessions]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  }, []);

  return {
    sessions,
    saveSession,
    clearSessions,
    exportSession,
    exportAllSessions,
    getSessionById,
    deleteSession,
  };
} 