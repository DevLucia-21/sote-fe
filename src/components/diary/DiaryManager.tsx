import React, { useState } from 'react';
import { DiaryHome } from './DiaryHome';
import { DiaryWrite } from './DiaryWrite';
import { DiaryDetail } from './DiaryDetail';
import { WatchSTTUpload } from './WatchSTTUpload';
import { Diary } from './types';
import { mockDiaries } from './mockData';

type ViewType = 'home' | 'write' | 'detail' | 'edit' | 'watch-stt';

interface DiaryManagerProps {
  onBack?: () => void;
}

export function DiaryManager({ onBack }: DiaryManagerProps) {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [diaries, setDiaries] = useState<Diary[]>(mockDiaries);

  const handleWriteNew = () => {
    setCurrentView('write');
    setSelectedDiary(null);
  };

  const handleViewDetail = (diary: Diary) => {
    setSelectedDiary(diary);
    setCurrentView('detail');
  };

  const handleEdit = (diary: Diary) => {
    setSelectedDiary(diary);
    setCurrentView('edit');
  };

  const handleSave = (diaryData: Partial<Diary>) => {
    if (selectedDiary) {
      // Edit existing diary
      const updatedDiaries = diaries.map(d =>
        d.id === selectedDiary.id
          ? { ...d, ...diaryData, updatedAt: new Date().toISOString() }
          : d
      );
      setDiaries(updatedDiaries);
    } else {
      // Create new diary
      const newDiary: Diary = {
        id: Math.max(...diaries.map(d => d.id), 0) + 1,
        date: diaryData.date || new Date().toISOString().split('T')[0],
        content: diaryData.content || '',
        writeType: diaryData.writeType || 'TEXT',
        emotionType: diaryData.emotionType,
        keywords: diaryData.keywords || [],
        imageUrl: diaryData.imageUrl,
        analysisStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDiaries([newDiary, ...diaries]);
    }
    setCurrentView('home');
    setSelectedDiary(null);
  };

  const handleDelete = (diaryId: number) => {
    setDiaries(diaries.filter(d => d.id !== diaryId));
    setCurrentView('home');
    setSelectedDiary(null);
  };

  const handleReAnalyze = (diaryId: number) => {
    const updatedDiaries = diaries.map(d =>
      d.id === diaryId
        ? { ...d, analysisStatus: 'IN_PROGRESS' as const }
        : d
    );
    setDiaries(updatedDiaries);

    // Simulate analysis completion
    setTimeout(() => {
      setDiaries(prev => prev.map(d =>
        d.id === diaryId
          ? { ...d, analysisStatus: 'COMPLETED' as const }
          : d
      ));
    }, 2000);
  };

  const handleWatchUploadComplete = (diaryId: number, date: string, content: string) => {
    // Find and view the uploaded diary
    const uploadedDiary = diaries.find(d => d.id === diaryId);
    if (uploadedDiary) {
      handleViewDetail(uploadedDiary);
    } else {
      setCurrentView('home');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedDiary(null);
  };

  // Render current view
  switch (currentView) {
    case 'write':
      return (
        <DiaryWrite
          onBack={handleBackToHome}
          onSave={handleSave}
        />
      );

    case 'edit':
      return selectedDiary ? (
        <DiaryWrite
          onBack={handleBackToHome}
          onSave={handleSave}
          editingDiary={selectedDiary}
        />
      ) : null;

    case 'detail':
      return selectedDiary ? (
        <DiaryDetail
          diary={selectedDiary}
          onBack={handleBackToHome}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReAnalyze={handleReAnalyze}
        />
      ) : null;

    case 'watch-stt':
      return (
        <WatchSTTUpload
          onBack={handleBackToHome}
          onComplete={handleWatchUploadComplete}
        />
      );

    case 'home':
    default:
      return (
        <DiaryHome
          onBack={onBack}
          onWriteNew={handleWriteNew}
          onViewDetail={handleViewDetail}
        />
      );
  }
}
