import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Download, FileText, Calendar, Users,
  MessageSquare, Star, CheckCircle2, Clock, Loader2
} from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DataExportProps {
  onBack: () => void;
  demoMode?: boolean;
}

interface DebateItem {
  topicTitle: string;
  position: string;
  status: string;
  createdAt: string;
  messageCount: number;
  score: number;
}

interface StudentItem {
  name: string;
  email: string;
  joinedAt: string;
  totalDebates: number;
  completedDebates: number;
  avgScore: number;
  debates: DebateItem[];
}

interface ClassItem {
  className: string;
  classCode: string;
  totalStudents: number;
  students: StudentItem[];
}

interface ExportData {
  teacherName: string;
  dateRange: string;
  exportedAt: string;
  classes: ClassItem[];
}

const DEMO_DATA: ExportData = {
  teacherName: '김선생',
  dateRange: '전체 기간',
  exportedAt: new Date().toLocaleDateString('ko-KR'),
  classes: [
    {
      className: '3학년 1반',
      classCode: 'ABC12',
      totalStudents: 3,
      students: [
        {
          name: '김철수',
          email: 'kimcs@school.kr',
          joinedAt: '2026. 2. 1.',
          totalDebates: 8,
          completedDebates: 7,
          avgScore: 88,
          debates: [
            { topicTitle: '학교에서 스마트폰 사용을 허용해야 한다', position: '찬성', status: '완료', createdAt: '2026. 2. 10.', messageCount: 10, score: 92 },
            { topicTitle: '숙제는 꼭 필요한가', position: '반대', status: '완료', createdAt: '2026. 2. 15.', messageCount: 8, score: 85 },
          ],
        },
        {
          name: '박영희',
          email: 'parkyhee@school.kr',
          joinedAt: '2026. 2. 1.',
          totalDebates: 6,
          completedDebates: 5,
          avgScore: 79,
          debates: [
            { topicTitle: '인공지능이 인간의 일자리를 대체한다', position: '찬성', status: '완료', createdAt: '2026. 2. 12.', messageCount: 7, score: 79 },
          ],
        },
        {
          name: '최배덕',
          email: 'choibd@school.kr',
          joinedAt: '2026. 2. 2.',
          totalDebates: 4,
          completedDebates: 3,
          avgScore: 72,
          debates: [],
        },
      ],
    },
  ],
};

export default function DataExport({ onBack, demoMode = false }: DataExportProps) {
  const { showAlert } = useAlert();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [exportHistory, setExportHistory] = useState([
    { id: '1', date: '2026-02-15 14:30', pages: 12 },
    { id: '2', date: '2026-02-10 16:45', pages: 20 },
  ]);
  const printRef = useRef<HTMLDivElement>(null);

  async function handleExport() {
    setLoading(true);
    try {
      let data: ExportData;

      if (demoMode) {
        await new Promise(r => setTimeout(r, 800));
        data = DEMO_DATA;
      } else {
        const params = new URLSearchParams();
        if (dateRange.start) params.set('startDate', dateRange.start);
        if (dateRange.end) params.set('endDate', dateRange.end);
        data = await apiCall(`/teacher/export?${params.toString()}`);
      }

      setExportData(data);
      // 렌더링 대기 후 PDF 생성
      await new Promise(r => setTimeout(r, 300));
      await generatePdfFromHtml(data);

      setExportHistory(prev => [{
        id: Date.now().toString(),
        date: new Date().toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        }),
        pages: (data.classes?.length || 1) * 3,
      }, ...prev]);

      showAlert('PDF가 성공적으로 내보내기 되었습니다.', 'success');
    } catch (error: any) {
      console.error('Export error:', error);
      showAlert(error.message || 'PDF 내보내기에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
      setExportData(null);
    }
  }

  async function generatePdfFromHtml(data: ExportData) {
    if (!printRef.current) return;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;

    const sections = printRef.current.querySelectorAll<HTMLElement>('.pdf-section');

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgH = (canvas.height * pageW) / canvas.width;

      if (i > 0) pdf.addPage();

      // 이미지가 한 페이지보다 길면 분할
      if (imgH <= pageH) {
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH);
      } else {
        let yOffset = 0;
        while (yOffset < canvas.height) {
          if (yOffset > 0) pdf.addPage();
          const sliceH = Math.min((pageH * canvas.width) / pageW, canvas.height - yOffset);
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sliceH;
          const ctx = tempCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, -yOffset);
          pdf.addImage(tempCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageW, (sliceH * pageW) / canvas.width);
          yOffset += sliceH;
        }
      }
    }

    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`AI토론-학급보고서-${dateStr}.pdf`);
  }

  const totalStudents = exportData?.classes.reduce((s, c) => s + c.totalStudents, 0) ?? 0;
  const totalDebates = exportData?.classes.reduce((s, c) =>
    s + c.students.reduce((ss, st) => ss + st.totalDebates, 0), 0) ?? 0;
  const allScores = exportData?.classes.flatMap(c => c.students.map(st => st.avgScore)).filter(s => s > 0) ?? [];
  const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-secondary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-primary"></div>

      {/* 숨겨진 PDF 렌더링 영역 */}
      {exportData && (
        <div
          ref={printRef}
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '794px',
            fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
            backgroundColor: '#fff',
          }}
        >
          {/* 표지 섹션 */}
          <div className="pdf-section" style={{ width: '794px', minHeight: '300px', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', padding: '60px 40px 40px', boxSizing: 'border-box' }}>
            <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: '0 0 16px', textAlign: 'center' }}>AI 토론 학급 보고서</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', textAlign: 'center', margin: '0 0 8px' }}>담당 교사: {exportData.teacherName}</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', textAlign: 'center', margin: '0 0 8px' }}>기간: {exportData.dateRange}</p>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', textAlign: 'center', margin: 0 }}>생성일: {exportData.exportedAt}</p>

            {/* 요약 통계 */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', padding: '24px' }}>
              {[
                { label: '학급 수', value: `${exportData.classes.length}개` },
                { label: '학생 수', value: `${totalStudents}명` },
                { label: '토론 수', value: `${totalDebates}회` },
                { label: '평균 점수', value: overallAvg > 0 ? `${overallAvg}점` : '-' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>{item.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 학급별 섹션 */}
          {exportData.classes.map((cls, ci) => (
            <div key={ci} className="pdf-section" style={{ width: '794px', padding: '32px 40px', boxSizing: 'border-box', background: '#fff' }}>
              {/* 학급 헤더 */}
              <div style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px' }}>
                  🏫 {cls.className}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: 0 }}>
                  학급 코드: {cls.classCode || '-'} · 학생 수: {cls.totalStudents}명
                </p>
              </div>

              {/* 학생 목록 */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                {/* 테이블 헤더 */}
                <div style={{ display: 'flex', background: '#f3f0ff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ flex: '2', fontSize: '12px', fontWeight: 'bold', color: '#6c5ce7' }}>이름</div>
                  <div style={{ flex: '3', fontSize: '12px', fontWeight: 'bold', color: '#6c5ce7' }}>이메일</div>
                  <div style={{ flex: '1', fontSize: '12px', fontWeight: 'bold', color: '#6c5ce7', textAlign: 'center' }}>토론</div>
                  <div style={{ flex: '1', fontSize: '12px', fontWeight: 'bold', color: '#6c5ce7', textAlign: 'center' }}>완료</div>
                  <div style={{ flex: '1', fontSize: '12px', fontWeight: 'bold', color: '#6c5ce7', textAlign: 'center' }}>평균점수</div>
                  <div style={{ flex: '2', fontSize: '12px', fontWeight: 'bold', color: '#6c5ce7' }}>가입일</div>
                </div>

                {cls.students.map((st, si) => (
                  <div key={si}>
                    {/* 학생 행 */}
                    <div style={{ display: 'flex', padding: '10px 16px', background: si % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f3f3', alignItems: 'center' }}>
                      <div style={{ flex: '2', fontSize: '13px', fontWeight: 'bold', color: '#1f2937' }}>
                        {st.name}
                      </div>
                      <div style={{ flex: '3', fontSize: '12px', color: '#6b7280' }}>
                        {st.email.length > 22 ? st.email.substring(0, 22) + '…' : st.email}
                      </div>
                      <div style={{ flex: '1', fontSize: '13px', color: '#374151', textAlign: 'center' }}>{st.totalDebates}회</div>
                      <div style={{ flex: '1', fontSize: '13px', color: '#374151', textAlign: 'center' }}>{st.completedDebates}회</div>
                      <div style={{ flex: '1', textAlign: 'center' }}>
                        {st.avgScore > 0 ? (
                          <span style={{
                            fontSize: '13px', fontWeight: 'bold',
                            color: st.avgScore >= 80 ? '#059669' : st.avgScore >= 60 ? '#d97706' : '#dc2626',
                          }}>
                            {st.avgScore}점
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>-</span>
                        )}
                      </div>
                      <div style={{ flex: '2', fontSize: '12px', color: '#6b7280' }}>{st.joinedAt}</div>
                    </div>

                    {/* 토론 상세 */}
                    {st.debates && st.debates.length > 0 && st.debates.map((debate, di) => (
                      <div key={di} style={{ display: 'flex', padding: '7px 16px 7px 32px', background: '#f5f3ff', borderBottom: '1px solid #ede9fe', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#7c3aed', marginRight: '4px' }}>↳</span>
                        <div style={{ flex: '4', fontSize: '11px', color: '#4b5563' }}>
                          {debate.topicTitle.length > 30 ? debate.topicTitle.substring(0, 30) + '…' : debate.topicTitle}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6d28d9', background: '#ede9fe', borderRadius: '6px', padding: '1px 8px' }}>
                          {debate.position}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{debate.status}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>발언 {debate.messageCount}개</div>
                        {debate.score > 0 && (
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669' }}>{debate.score}점</div>
                        )}
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>{debate.createdAt}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* 학급 통계 요약 */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                {(() => {
                  const totalD = cls.students.reduce((s, st) => s + st.totalDebates, 0);
                  const completedD = cls.students.reduce((s, st) => s + st.completedDebates, 0);
                  const scores = cls.students.map(st => st.avgScore).filter(s => s > 0);
                  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                  return [
                    { label: '총 토론', value: `${totalD}회` },
                    { label: '완료 토론', value: `${completedD}회` },
                    { label: '완료율', value: totalD > 0 ? `${Math.round((completedD / totalD) * 100)}%` : '-' },
                    { label: '학급 평균', value: avg > 0 ? `${avg}점` : '-' },
                  ].map(stat => (
                    <div key={stat.label} style={{ flex: 1, background: '#f5f3ff', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c5ce7', margin: '0 0 4px' }}>{stat.value}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>{stat.label}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* 헤더 */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-text-secondary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">데이터 내보내기</h1>
                  <p className="text-sm text-text-secondary">모든 학급 데이터를 통합 PDF로 저장합니다</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">PDF 전용</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 왼쪽: 설정 + 버튼 */}
            <div className="lg:col-span-2 space-y-6">

              {/* PDF 포함 내용 안내 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  PDF에 포함되는 내용
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: '학생 명단', desc: '이름, 이메일, 가입일', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: MessageSquare, label: '토론 기록', desc: '주제, 입장, 발언수', color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: Star, label: '점수 & 평가', desc: '참여도, 논리성, 근거력', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { icon: CheckCircle2, label: '학급 통계', desc: '완료율, 평균 점수', color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map(item => (
                    <div key={item.label} className={`flex items-center gap-3 p-3 ${item.bg} rounded-2xl`}>
                      <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-bold text-text-primary">{item.label}</p>
                        <p className="text-xs text-text-secondary">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 기간 설정 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  기간 설정
                  <span className="text-sm font-normal text-text-secondary">(선택사항 - 비우면 전체 기간)</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">시작일</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">종료일</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors bg-white"
                    />
                  </div>
                </div>
                {dateRange.start && dateRange.end && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-2xl border border-primary/20">
                    <p className="text-sm text-primary font-semibold">
                      📅 {dateRange.start} ~ {dateRange.end} 기간의 데이터만 포함됩니다
                    </p>
                  </div>
                )}
              </div>

              {/* 내보내기 버튼 */}
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-primary text-white rounded-full hover:shadow-glow transition-all font-bold text-lg shadow-medium disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    PDF 생성 중...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    통합 PDF로 내보내기
                  </>
                )}
              </button>
            </div>

            {/* 오른쪽: 안내 + 기록 */}
            <div className="space-y-6">
              {/* PDF 특징 */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-6 border border-primary/20 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-text-primary">PDF 내보내기</h3>
                </div>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {[
                    '모든 학급 & 학생 통합 보고서',
                    '인쇄 및 공유에 최적화',
                    '보고서 형태로 제출 가능',
                    '학부모 상담 자료로 활용',
                    '어떤 기기에서도 동일하게 표시',
                  ].map(text => (
                    <li key={text} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 font-bold flex-shrink-0">✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 내보내기 기록 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  최근 내보내기
                </h3>
                {exportHistory.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-4">내보내기 기록이 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {exportHistory.map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-text-secondary">{item.date}</p>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">PDF</span>
                        </div>
                        <p className="text-xs text-text-secondary">약 {item.pages}페이지</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
