import React, { useState } from 'react';
import { 
  ArrowLeft, Download, FileText, Table, 
  FileSpreadsheet, CheckCircle, Calendar, Users,
  TrendingUp, MessageSquare, Trophy, Clock
} from 'lucide-react';
import { apiCall } from '../../lib/api';
import { useAlert } from './AlertProvider';

interface DataExportProps {
  onBack: () => void;
  demoMode?: boolean;
}

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';
type ExportType = 'students' | 'debates' | 'scores' | 'activity' | 'full';

export default function DataExport({ onBack, demoMode = false }: DataExportProps) {
  const { showAlert } = useAlert();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedType, setSelectedType] = useState<ExportType>('students');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    { id: '1', type: '학생 명단', format: 'CSV', date: '2026-02-15 14:30', size: '45 KB' },
    { id: '2', type: '토론 기록', format: 'Excel', date: '2026-02-14 09:15', size: '128 KB' },
    { id: '3', type: '전체 데이터', format: 'PDF', date: '2026-02-10 16:45', size: '2.3 MB' }
  ]);

  async function handleExport() {
    if (!selectedFormat || !selectedType) {
      showAlert('작업이 완료되었습니다.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const typeNames: Record<ExportType, string> = {
          students: '학생 명단',
          debates: '토론 기록',
          scores: '점수 데이터',
          activity: '활동 이력',
          full: '전체 데이터'
        };
        
        const newExport = {
          id: Date.now().toString(),
          type: typeNames[selectedType],
          format: selectedFormat.toUpperCase(),
          date: new Date().toLocaleString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          size: `${Math.floor(Math.random() * 500) + 50} KB`
        };
        
        setExportHistory([newExport, ...exportHistory]);
        showAlert(`${typeNames[selectedType]} ?�이?��? ${selectedFormat.toUpperCase()} ?�식?�로 ?�보?�기 ?�었?�니??`, 'success');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        format: selectedFormat,
        type: selectedType,
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      });

      const response = await apiCall(`/teacher/export?${params.toString()}`);
      
      // Create download link
      const blob = new Blob([response.data], { type: response.contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showAlert('데이터가 성공적으로 내보내기 되었습니다.', 'success');
    } catch (error: any) {
      console.error('Export error:', error);
      showAlert(error.message || '데이터 내보내기에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const exportOptions = [
    {
      type: 'students' as ExportType,
      title: '학생 명단',
      description: '학생 이름, 이메일, 가입일 등 기본 정보',
      icon: Users,
      color: 'from-blue-400 to-blue-500'
    },
    {
      type: 'debates' as ExportType,
      title: '토론 기록',
      description: '모든 토론 세션의 상세 이력',
      icon: MessageSquare,
      color: 'from-green-400 to-green-500'
    },
    {
      type: 'scores' as ExportType,
      title: '점수 데이터',
      description: '학생별 점수 및 평가 결과',
      icon: Trophy,
      color: 'from-yellow-400 to-yellow-500'
    },
    {
      type: 'activity' as ExportType,
      title: '활동 이력',
      description: '학생들의 참여 기록 및 통계',
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-500'
    },
    {
      type: 'full' as ExportType,
      title: '전체 데이터',
      description: '모든 데이터를 포함한 완전한 백업',
      icon: FileText,
      color: 'from-pink-400 to-pink-500'
    }
  ];

  const formatOptions = [
    {
      format: 'csv' as ExportFormat,
      title: 'CSV',
      description: '설명',
      icon: Table,
      recommended: '텍스트'
    },
    {
      format: 'excel' as ExportFormat,
      title: 'Excel',
      description: 'Microsoft Excel ?�일',
      icon: FileSpreadsheet,
      recommended: '텍스트'
    },
    {
      format: 'pdf' as ExportFormat,
      title: 'PDF',
      description: '설명',
      icon: FileText,
      recommended: '텍스트'
    },
    {
      format: 'json' as ExportFormat,
      title: 'JSON',
      description: '?�로그래�?처리가 가?�한 ?�식',
      icon: FileText,
      recommended: '텍스트'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-secondary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-primary"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-text-secondary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-soft">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">텍스트</h1>
                  <p className="text-sm text-text-secondary">텍스트</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Export Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Data Type Selection */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border animate-fade-in-up">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  ?�보???�이???�택
                </h3>
                
                <div className="grid gap-3">
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => setSelectedType(option.type)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedType === option.type
                            ? 'border-secondary bg-secondary/5 shadow-medium'
                            : 'border-border hover:border-secondary/50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-text-primary">{option.title}</h4>
                              {selectedType === option.type && (
                                <CheckCircle className="w-5 h-5 text-secondary" />
                              )}
                            </div>
                            <p className="text-sm text-text-secondary">{option.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Selection */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  ?�일 ?�식 ?�택
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.format}
                        onClick={() => setSelectedFormat(option.format)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedFormat === option.format
                            ? 'border-primary bg-primary/5 shadow-medium'
                            : 'border-border hover:border-primary/50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-6 h-6 ${
                            selectedFormat === option.format ? 'text-primary' : 'text-gray-400'
                          }`} />
                          <h4 className="font-bold text-text-primary">{option.title}</h4>
                          {selectedFormat === option.format && (
                            <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mb-1">{option.description}</p>
                        <p className="text-xs text-primary font-semibold">텍스트</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  기간 ?�정 (?�택?�항)
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      ?�작??                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      종료??                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                
                {dateRange.start && dateRange.end && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-2xl">
                    <p className="text-sm text-accent font-semibold">
                      ?�� {dateRange.start} ~ {dateRange.end} 기간???�이?��? ?�보?�기?�니??                    </p>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-secondary text-white rounded-full hover:shadow-glow transition-all font-bold text-lg shadow-medium disabled:opacity-50 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                <Download className="w-6 h-6" />
                {loading ? '?�보?�기 �?..' : '?�이???�보?�기'}
              </button>
            </div>

            {/* Right Column - Export History & Info */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-2 border-blue-200 shadow-soft animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-900">텍스트</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">�??�보?�기 ?�수</span>
                    <span className="text-2xl font-bold text-blue-900">{exportHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">가??최근 ?�보?�기</span>
                    <span className="text-sm font-semibold text-blue-900">
                      {exportHistory[0]?.date.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Export History */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-border animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  ?�보?�기 기록
                </h3>
                
                <div className="space-y-3">
                  {exportHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-primary text-sm">{item.type}</h4>
                          <p className="text-xs text-text-secondary">{item.date}</p>
                        </div>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          {item.format}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">{item.size}</span>
                        <button className="text-xs text-primary hover:text-primary/80 font-semibold">
                          ?�시 ?�운로드
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-6 border-2 border-yellow-200 shadow-soft animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  💡 내보내기 팁
                </h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>CSV는 Excel에서 바로 열 수 있어요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>PDF는 인쇄와 공유에 적합해요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>JSON은 데이터 백업에 적합해요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Excel 형식은 차트와 그래프 생성에 유용해요.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
