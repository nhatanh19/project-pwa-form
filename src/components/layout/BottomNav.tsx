import React from 'react';
import { ClipboardEdit, BarChart3, BookCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ActiveTab = 'survey' | 'dashboard' | 'records';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
}) => {
  const tabs = [
    {
      id: 'survey' as ActiveTab,
      label: 'Khảo sát',
      icon: ClipboardEdit,
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'Báo cáo',
      icon: BarChart3,
    },
    {
      id: 'records' as ActiveTab,
      label: 'Sổ tay phiếu',
      icon: BookCheck,
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center py-2 text-xs font-semibold transition-all duration-200 touch-manipulation',
                isActive
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {/* Active Top Bar Indicator */}
              {isActive && (
                <span className="absolute top-0 h-1 w-12 rounded-full bg-blue-600 shadow-xs" />
              )}

              <div className="relative mb-1">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive ? 'scale-110 text-blue-600' : 'text-slate-400'
                  )}
                />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-3 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
