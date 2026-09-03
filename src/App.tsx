import { useState } from 'react';
import { useOfflineSync } from './hooks/use-offline-sync';
import { useSurveyQuestions } from './hooks/use-survey-questions';
import { useAnalytics } from './hooks/use-analytics';
import { usePwaInstall } from './hooks/use-pwa-install';
import { Header } from './components/layout/Header';
import { BottomNav, ActiveTab } from './components/layout/BottomNav';
import { OfflineSyncBanner } from './components/layout/OfflineSyncBanner';
import { PwaInstallBanner } from './components/layout/PwaInstallBanner';
import { DynamicSurveyWizard } from './components/survey/DynamicSurveyWizard';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { RecordsHistoryView } from './components/records/RecordsHistoryView';
import { QuestionManagerModal } from './components/admin/QuestionManagerModal';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('survey');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);

  // 1. Offline Sync Engine
  const {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncedAt,
    lastError,
    syncSuccessToast,
    saveSubmission,
    triggerSync,
  } = useOfflineSync();

  // 2. Questions & Survey Data (Động, hỗ trợ N câu hỏi)
  const { survey, questions, refreshQuestions } = useSurveyQuestions();

  // 3. Analytics Dashboard Data
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    refreshAnalytics,
  } = useAnalytics();

  // 4. PWA Install Prompt
  const { isInstallable, installApp } = usePwaInstall();

  // Chuyển tab
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'dashboard' && isOnline) {
      refreshAnalytics();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* 1. App Header */}
      <Header
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onManualSync={triggerSync}
        onOpenQuestionManager={() => setIsQuestionModalOpen(true)}
      />

      {/* 2. Offline / Auto-Sync Notification Banner */}
      <OfflineSyncBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        lastError={lastError}
        onSync={triggerSync}
        syncSuccessToast={syncSuccessToast}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 px-4 max-w-lg mx-auto w-full">
        {/* PWA Install Banner */}
        {isInstallable && <PwaInstallBanner onInstall={installApp} />}

        {/* Tab 1: Khảo sát động */}
        {activeTab === 'survey' && (
          <DynamicSurveyWizard
            surveyId={survey.id}
            questions={questions}
            onSaveSubmission={saveSubmission}
            onViewDashboard={() => handleTabChange('dashboard')}
          />
        )}

        {/* Tab 2: Báo cáo thống kê */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard
            data={analyticsData}
            isLoading={isAnalyticsLoading}
            isOnline={isOnline}
            onRefresh={refreshAnalytics}
          />
        )}

        {/* Tab 3: Sổ tay phiếu đã thu thập */}
        {activeTab === 'records' && (
          <RecordsHistoryView
            questions={questions}
            isOnline={isOnline}
            isSyncing={isSyncing}
            onTriggerSync={triggerSync}
            lastSyncedAt={lastSyncedAt}
          />
        )}
      </main>

      {/* 4. Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={pendingCount}
      />

      {/* 5. Question Manager Modal */}
      <QuestionManagerModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        questions={questions}
        onRefreshQuestions={refreshQuestions}
        isOnline={isOnline}
      />
    </div>
  );
}

export default App;
