import React, { useState } from 'react';
import {
  ArrowLeft, Download, FileText, Calendar, Users,
  MessageSquare, Star, CheckCircle2, Clock, Loader2
} from 'lucide-react';
import { apiCall } from '../../utils/supabase';
import { useAlert } from './AlertProvider';
import jsPDF from 'jspdf';

interface DataExportProps {
  onBack: () => void;
  demoMode?: boolean;
}

export default function DataExport({ onBack, demoMode = false }: DataExportProps) {
  const { showAlert } = useAlert();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    { id: '1', date: '2026-02-15 14:30', pages: 12 },
    { id: '2', date: '2026-02-10 16:45', pages: 20 },
  ]);

  async function handleExport() {
    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(r => setTimeout(r, 1200));
        generateDemoPdf();
        setExportHistory(prev => [{
          id: Date.now().toString(),
          date: new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          pages: 8
        }, ...prev]);
        showAlert('PDF가 성공적으로 내보내기 되었습니다.', 'success');
        return;
      }

      // 실제 서버에서 데이터 가져오기
      const params = new URLSearchParams();
      if (dateRange.start) params.set('startDate', dateRange.start);
      if (dateRange.end) params.set('endDate', dateRange.end);

      const data = await apiCall(`/teacher/export?${params.toString()}`);
      await generatePdf(data);

      setExportHistory(prev => [{
        id: Date.now().toString(),
        date: new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        pages: (data.classes?.length || 1) * 3
      }, ...prev]);

      showAlert('PDF가 성공적으로 내보내기 되었습니다.', 'success');
    } catch (error: any) {
      console.error('Export error:', error);
      showAlert(error.message || 'PDF 내보내기에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function addKoreanText(doc: jsPDF, text: string, x: number, y: number, options?: any) {
    // jsPDF는 기본적으로 한글을 지원하지 않으므로 영문/숫자/기호만 직접 출력하고
    // 한글은 인코딩 처리
    doc.text(text, x, y, options);
  }

  async function generatePdf(serverData: any) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 0;

    function newPage() {
      doc.addPage();
      y = 20;
      // 페이지 번호
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(`Page ${pageNum}`, pageW - margin, 287, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }

    function checkY(need: number) {
      if (y + need > 275) newPage();
    }

    // ===== 표지 =====
    doc.setFillColor(108, 92, 231);
    doc.rect(0, 0, pageW, 80, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Debate - Class Report', pageW / 2, 35, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Teacher: ${serverData.teacherName || 'Teacher'}`, pageW / 2, 50, { align: 'center' });
    doc.text(`Period: ${serverData.dateRange || 'All period'}`, pageW / 2, 60, { align: 'center' });
    doc.text(`Generated: ${serverData.exportedAt || new Date().toLocaleDateString('ko-KR')}`, pageW / 2, 70, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y = 95;

    // ===== 전체 요약 =====
    const allClasses: any[] = serverData.classes || [];
    const totalStudents = allClasses.reduce((s: number, c: any) => s + c.totalStudents, 0);
    const totalDebates = allClasses.reduce((s: number, c: any) =>
      s + c.students.reduce((ss: number, st: any) => ss + st.totalDebates, 0), 0);
    const allScores = allClasses.flatMap((c: any) => c.students.map((st: any) => st.avgScore)).filter((s: number) => s > 0);
    const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length) : 0;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, y);
    y += 8;

    doc.setFillColor(245, 243, 255);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(108, 92, 231);

    const colW = contentW / 4;
    const summaryItems = [
      { label: 'Classes', value: String(allClasses.length) },
      { label: 'Students', value: String(totalStudents) },
      { label: 'Debates', value: String(totalDebates) },
      { label: 'Avg Score', value: overallAvg > 0 ? `${overallAvg}pt` : '-' },
    ];
    summaryItems.forEach((item, i) => {
      const cx = margin + colW * i + colW / 2;
      doc.setFontSize(16);
      doc.text(item.value, cx, y + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(item.label, cx, y + 22, { align: 'center' });
      doc.setTextColor(108, 92, 231);
    });

    doc.setTextColor(0, 0, 0);
    y += 38;

    // ===== 각 학급 상세 =====
    for (const cls of allClasses) {
      checkY(20);

      // 학급 헤더
      doc.setFillColor(108, 92, 231);
      doc.roundedRect(margin, y, contentW, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Class: ${cls.className}  (Code: ${cls.classCode || '-'})  Students: ${cls.totalStudents}`, margin + 4, y + 8);
      doc.setTextColor(0, 0, 0);
      y += 18;

      // 학생 테이블 헤더
      checkY(10);
      doc.setFillColor(240, 238, 255);
      doc.rect(margin, y, contentW, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);

      const cols = [
        { label: 'Name', x: margin + 2, w: 35 },
        { label: 'Email', x: margin + 37, w: 55 },
        { label: 'Debates', x: margin + 93, w: 22 },
        { label: 'Completed', x: margin + 116, w: 25 },
        { label: 'Avg Score', x: margin + 142, w: 25 },
        { label: 'Joined', x: margin + 168, w: 25 },
      ];
      cols.forEach(col => doc.text(col.label, col.x, y + 5.5));
      doc.setTextColor(0, 0, 0);
      y += 10;

      // 학생 행
      for (let si = 0; si < cls.students.length; si++) {
        const st = cls.students[si];
        checkY(9);

        if (si % 2 === 0) {
          doc.setFillColor(252, 252, 252);
          doc.rect(margin, y, contentW, 8, 'F');
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const truncate = (s: string, maxLen: number) =>
          s && s.length > maxLen ? s.substring(0, maxLen) + '..' : (s || '-');

        doc.text(truncate(st.name, 12), margin + 2, y + 5.5);
        doc.text(truncate(st.email, 22), margin + 37, y + 5.5);
        doc.text(String(st.totalDebates || 0), margin + 93 + 11, y + 5.5, { align: 'center' });
        doc.text(String(st.completedDebates || 0), margin + 116 + 12, y + 5.5, { align: 'center' });

        if (st.avgScore > 0) {
          const scoreColor = st.avgScore >= 80 ? [34, 197, 94] : st.avgScore >= 60 ? [234, 179, 8] : [239, 68, 68];
          doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(`${st.avgScore}pt`, margin + 142 + 12, y + 5.5, { align: 'center' });
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        } else {
          doc.text('-', margin + 142 + 12, y + 5.5, { align: 'center' });
        }

        doc.text(truncate(st.joinedAt, 10), margin + 168, y + 5.5);

        // 구분선
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y + 8, margin + contentW, y + 8);
        y += 9;

        // 토론 상세 (있을 때)
        if (st.debates && st.debates.length > 0) {
          for (const debate of st.debates) {
            checkY(8);
            doc.setFillColor(250, 248, 255);
            doc.rect(margin + 3, y, contentW - 3, 7, 'F');
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 120);

            const topicShort = truncate(debate.topicTitle, 25);
            const scoreStr = debate.score > 0 ? `${debate.score}pt` : '-';
            const msgStr = `${debate.messageCount || 0} msg`;

            doc.text(`  → ${topicShort}`, margin + 3, y + 5);
            doc.text(debate.position || '-', margin + 110, y + 5);
            doc.text(debate.status || '-', margin + 128, y + 5);
            doc.text(msgStr, margin + 148, y + 5);
            doc.text(scoreStr, margin + 165, y + 5);
            doc.text(debate.createdAt || '-', margin + 178, y + 5);

            doc.setTextColor(0, 0, 0);
            y += 8;
          }
        }
      }

      y += 6;
    }

    // 파일 저장
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`AI-Debate-Report-${dateStr}.pdf`);
  }

  function generateDemoPdf() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;

    // 표지
    doc.setFillColor(108, 92, 231);
    doc.rect(0, 0, pageW, 80, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Debate - Class Report', pageW / 2, 35, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Teacher: Demo Teacher', pageW / 2, 50, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('ko-KR')}`, pageW / 2, 62, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    let y = 95;

    // 요약
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, y); y += 8;
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');

    const colW = contentW / 4;
    const items = [
      { label: 'Classes', value: '2' },
      { label: 'Students', value: '8' },
      { label: 'Debates', value: '24' },
      { label: 'Avg Score', value: '82pt' },
    ];
    doc.setTextColor(108, 92, 231);
    items.forEach((item, i) => {
      const cx = margin + colW * i + colW / 2;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value, cx, y + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(item.label, cx, y + 22, { align: 'center' });
      doc.setTextColor(108, 92, 231);
    });
    doc.setTextColor(0, 0, 0);
    y += 38;

    // 학급 데이터
    const demoClasses = [
      {
        className: '3rd Grade - Class 1', classCode: 'ABC12',
        students: [
          { name: 'Kim Cheolsu', email: 'kimcs@school.kr', totalDebates: 8, completedDebates: 7, avgScore: 88,
            debates: [
              { topicTitle: 'Should smartphones be allowed in school?', position: 'Agree', status: 'Completed', messageCount: 10, score: 92, createdAt: '2026-02-10' },
              { topicTitle: 'Is homework necessary?', position: 'Disagree', status: 'Completed', messageCount: 8, score: 85, createdAt: '2026-02-15' },
            ]
          },
          { name: 'Park Younghee', email: 'parkyhee@school.kr', totalDebates: 6, completedDebates: 5, avgScore: 79, debates: [] },
          { name: 'Choi Baeduk', email: 'choibd@school.kr', totalDebates: 4, completedDebates: 3, avgScore: 72, debates: [] },
        ]
      },
      {
        className: '3rd Grade - Class 2', classCode: 'DEF34',
        students: [
          { name: 'Lee Minjun', email: 'leemj@school.kr', totalDebates: 7, completedDebates: 6, avgScore: 85, debates: [] },
          { name: 'Shin Jiyeon', email: 'shinjy@school.kr', totalDebates: 5, completedDebates: 5, avgScore: 91, debates: [] },
        ]
      }
    ];

    for (const cls of demoClasses) {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFillColor(108, 92, 231);
      doc.roundedRect(margin, y, contentW, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Class: ${cls.className}  Students: ${cls.students.length}`, margin + 4, y + 8);
      doc.setTextColor(0, 0, 0);
      y += 18;

      // 테이블 헤더
      doc.setFillColor(240, 238, 255);
      doc.rect(margin, y, contentW, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Name', margin + 2, y + 5.5);
      doc.text('Email', margin + 40, y + 5.5);
      doc.text('Debates', margin + 93, y + 5.5);
      doc.text('Done', margin + 118, y + 5.5);
      doc.text('Avg', margin + 143, y + 5.5);
      doc.setTextColor(0, 0, 0);
      y += 10;

      for (let si = 0; si < cls.students.length; si++) {
        const st = cls.students[si];
        if (y > 260) { doc.addPage(); y = 20; }
        if (si % 2 === 0) { doc.setFillColor(252, 252, 252); doc.rect(margin, y, contentW, 8, 'F'); }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(st.name, margin + 2, y + 5.5);
        doc.text(st.email, margin + 40, y + 5.5);
        doc.text(String(st.totalDebates), margin + 97, y + 5.5, { align: 'center' });
        doc.text(String(st.completedDebates), margin + 122, y + 5.5, { align: 'center' });

        const scoreColor = st.avgScore >= 80 ? [34, 197, 94] : st.avgScore >= 60 ? [234, 179, 8] : [239, 68, 68];
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`${st.avgScore}pt`, margin + 148, y + 5.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y + 8, margin + contentW, y + 8);
        y += 9;

        for (const debate of (st.debates || [])) {
          if (y > 265) { doc.addPage(); y = 20; }
          doc.setFillColor(250, 248, 255);
          doc.rect(margin + 3, y, contentW - 3, 7, 'F');
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 120);
          const topic = debate.topicTitle.length > 28 ? debate.topicTitle.substring(0, 28) + '..' : debate.topicTitle;
          doc.text(`  → ${topic}`, margin + 3, y + 5);
          doc.text(debate.position, margin + 128, y + 5);
          doc.text(`${debate.messageCount}msg`, margin + 148, y + 5);
          doc.text(`${debate.score}pt`, margin + 163, y + 5);
          doc.text(debate.createdAt, margin + 177, y + 5);
          doc.setTextColor(0, 0, 0);
          y += 8;
        }
      }
      y += 6;
    }

    doc.save(`AI-Debate-Report-Demo-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blob-bg absolute top-20 right-10 w-96 h-96 bg-secondary"></div>
      <div className="blob-bg absolute bottom-20 left-10 w-80 h-80 bg-primary"></div>

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
