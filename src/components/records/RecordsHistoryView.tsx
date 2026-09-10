import React, { useState } from 'react';
import {
  ClipboardCheck,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Download,
  MapPin,
  ExternalLink,
  Timer,
  Camera,
  ZoomIn,
  X,
} from 'lucide-react';
import { OfflineSubmissionRecord } from '../../types/sync';
import { Question } from '../../types/survey';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatNumber, formatVND } from '../../lib/utils';
import { exportSubmissionsToCSV } from '../../lib/csv-exporter';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';

interface RecordsHistoryViewProps {
  questions: Question[];
  isOnline: boolean;
  isSyncing: boolean;
  onTriggerSync: () => void;
  lastSyncedAt?: string | null;
}

export const RecordsHistoryView: React.FC<RecordsHistoryViewProps> = ({
  questions = [],
  isOnline,
  isSyncing,
  onTriggerSync,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'SYNCED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<{
    url: string;
    recordNum: number;
    date: string;
  } | null>(null);

  // Lấy toàn bộ danh sách phiếu từ IndexedDB (cả đã sync và chưa sync)
  const allSubmissions = useLiveQuery(() => db.offline_submissions.reverse().toArray(), []) || [];

  const pendingList = allSubmissions.filter((s) => s.is_synced === 0);
  const syncedList = allSubmissions.filter((s) => s.is_synced === 1);

  // Lọc theo filter mode
  const filteredList = allSubmissions.filter((sub) => {
    if (filterMode === 'PENDING' && sub.is_synced !== 0) return false;
    if (filterMode === 'SYNCED' && sub.is_synced !== 1) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Xuất file CSV từ dữ liệu máy hiện tại
  const handleExportCSV = () => {
    exportSubmissionsToCSV(allSubmissions, questions, 'khao-sat-thuc-dia-may-nay');
  };

  // Helper format câu trả lời của 1 phiếu
  const getAnswerText = (q: Question, record: OfflineSubmissionRecord): string => {
    const ans = record.answers.find((a) => a.question_id === q.id);
    if (!ans) return 'Không có dữ liệu';

    if (q.question_type === 'SINGLE_CHOICE') {
      const opt = q.options?.find((o) => o.id === ans.option_id);
      return opt?.option_text || 'Chưa chọn';
    }
    if (q.question_type === 'MULTIPLE_CHOICE') {
      const opts = q.options?.filter((o) => ans.selected_option_ids?.includes(o.id));
      return opts?.map((o) => o.option_text).join(', ') || 'Chưa chọn';
    }
    if (q.question_type === 'NUMERIC') {
      const isVND = q.unit?.toUpperCase().includes('VN') || q.unit?.toUpperCase().includes('Đ');
      const val = ans.numeric_value ?? 0;
      return isVND ? formatVND(val) : `${formatNumber(val)} ${q.unit || ''}`;
    }
    if (q.question_type === 'RATING') {
      return `${ans.numeric_value ?? 0} ⭐`;
    }
    return ans.text_value || 'Không có ý kiến';
  };

  return (
    <div className="space-y-4 pt-2 pb-28">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <ClipboardCheck className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900">Sổ Tay Khảo Sát</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Export CSV Button */}
          {allSubmissions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-xl border-slate-300 font-bold text-xs gap-1 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span>Xuất CSV</span>
            </Button>
          )}

          {/* Sync Button */}
          {pendingList.length > 0 && isOnline && (
            <Button
              variant="emerald"
              size="sm"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="h-9 px-3 rounded-xl font-bold text-xs shadow-md gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang gửi...' : `Gửi (${pendingList.length})`}</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Overview Status Card */}
      <Card className="border-slate-200/90 bg-white shadow-sm rounded-3xl overflow-hidden">
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tổng số phiếu thu thập
            </p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">{allSubmissions.length}</span>
              <span className="text-xs text-slate-300">bản ghi trên thiết bị</span>
            </div>
          </div>

          <div className="text-right">
            {isOnline ? (
              <Badge variant="success" className="text-[11px] gap-1 px-2.5 py-1">
                <Wifi className="h-3 w-3" />
                <span>Online</span>
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[11px] gap-1 px-2.5 py-1 bg-amber-500 text-white">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 grid grid-cols-2 gap-3 text-xs bg-slate-50/50">
          <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium text-[11px]">Đã đồng bộ máy chủ</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{syncedList.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium text-[11px]">Chờ gửi (Trong máy)</p>
            <p className="text-lg font-black text-amber-600 mt-0.5">{pendingList.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterMode('ALL')}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
            filterMode === 'ALL'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tất cả ({allSubmissions.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('PENDING')}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
            filterMode === 'PENDING'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Chờ gửi ({pendingList.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('SYNCED')}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
            filterMode === 'SYNCED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Đã đồng bộ ({syncedList.length})
        </button>
      </div>

      {/* 4. Submissions List */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center bg-white">
            <ClipboardCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Chưa có phiếu khảo sát nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Bắt đầu khảo sát tại tab "Khảo sát" để thu thập phiếu mới.
            </p>
          </div>
        ) : (
          filteredList.map((record, idx) => {
            const isExpanded = expandedId === record.id;
            const isSynced = record.is_synced === 1;

            const lat = record.location?.latitude;
            const lng = record.location?.longitude;
            const acc = record.location?.accuracy;
            const durationSec = record.survey_duration_seconds;

            return (
              <Card
                key={record.id}
                className="border-slate-200/90 bg-white shadow-sm rounded-2xl overflow-hidden transition-all"
              >
                {/* Accordion Card Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(record.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900">
                        Phiếu #{allSubmissions.length - idx}
                      </span>
                      {isSynced ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Đã đồng bộ
                        </span>
                      ) : (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Lưu trong máy
                        </span>
                      )}

                      {record.photo_data && (
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 flex items-center space-x-1">
                          <Camera className="h-3 w-3" />
                          <span>Có ảnh</span>
                        </span>
                      )}
                    </div>

                    {/* Timestamp & Duration */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(record.client_created_at).toLocaleTimeString('vi-VN')} •{' '}
                          {new Date(record.client_created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </span>

                      {durationSec !== undefined && durationSec !== null && (
                        <span className="flex items-center space-x-1 text-blue-600 font-semibold">
                          <Timer className="h-3 w-3" />
                          <span>
                            {durationSec > 60
                              ? `${Math.floor(durationSec / 60)}p ${durationSec % 60}s`
                              : `${durationSec}s`}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* GPS Coordinates Preview */}
                    {lat && lng && (
                      <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>
                          GPS: {lat.toFixed(4)}°, {lng.toFixed(4)}° {acc ? `(±${acc}m)` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-blue-600 font-bold hidden sm:inline">
                      {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Answer Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-2.5 animate-fadeIn">
                    {/* Google Maps link if GPS exists */}
                    {lat && lng && (
                      <div className="pt-2">
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Xem vị trí trên Google Maps</span>
                          <ExternalLink className="h-3 w-3 ml-0.5" />
                        </a>
                      </div>
                    )}

                    {/* Survey Area Photo Preview if exists */}
                    {record.photo_data && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Ảnh thực địa khu vực khảo sát:
                        </p>
                        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-950 aspect-video max-h-44 max-w-xs flex items-center justify-center">
                          <img
                            src={record.photo_data}
                            alt="Ảnh hiện trường"
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-102 transition-transform duration-300"
                            onClick={() =>
                              setActiveLightboxPhoto({
                                url: record.photo_data!,
                                recordNum: allSubmissions.length - idx,
                                date: new Date(record.client_created_at).toLocaleString('vi-VN'),
                              })
                            }
                          />
                          <div
                            onClick={() =>
                              setActiveLightboxPhoto({
                                url: record.photo_data!,
                                recordNum: allSubmissions.length - idx,
                                date: new Date(record.client_created_at).toLocaleString('vi-VN'),
                              })
                            }
                            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <span className="flex items-center space-x-1 text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                              <ZoomIn className="h-3.5 w-3.5" />
                              <span>Xem phóng to</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                      Chi tiết câu trả lời:
                    </p>

                    <div className="space-y-2">
                      {questions.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-xl bg-white p-2.5 border border-slate-200/60 shadow-xs space-y-0.5"
                        >
                          <p className="text-[11px] font-bold text-slate-600 line-clamp-1">
                            {q.question_text}
                          </p>
                          <p className="text-xs font-black text-slate-900">
                            {getAnswerText(q, record)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
                      ID: {record.id}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Full-screen Lightbox Modal for Records */}
      {activeLightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-lg w-full flex flex-col max-h-[90vh]">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 text-white">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Ảnh hiện trường — Phiếu #{activeLightboxPhoto.recordNum}
                </h4>
                <p className="text-[10px] text-slate-400">{activeLightboxPhoto.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightboxPhoto(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo Display */}
            <div className="flex-1 overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <img
                src={activeLightboxPhoto.url}
                alt={`Phiếu #${activeLightboxPhoto.recordNum}`}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
