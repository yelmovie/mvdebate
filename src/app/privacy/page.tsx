"use client";

import { useEffect, useRef } from "react";
import { CommonIcons, iconStyles } from "@/lib/icons";
import { LuFileDown } from "react-icons/lu";

export default function PrivacyPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // 목차 자동 생성
  useEffect(() => {
    const headings = contentRef.current?.querySelectorAll("h2");
    if (headings && headings.length > 0) {
      const toc = document.getElementById("table-of-contents");
      if (toc) {
        toc.innerHTML = "";
        headings.forEach((heading, index) => {
          const id = `section-${index + 1}`;
          heading.id = id;
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = `#${id}`;
          a.textContent = heading.textContent || "";
          a.className = "text-purple-600 hover:text-purple-700 underline";
          li.appendChild(a);
          toc.appendChild(li);
        });
      }
    }
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-gray-900">개인정보 처리방침</h1>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <LuFileDown size={20} />
                PDF 다운로드
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              최종 수정일: 2024년 12월 1일
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">목차</h2>
            <ul id="table-of-contents" className="space-y-2 text-gray-700">
              {/* 목차는 JavaScript로 자동 생성 */}
            </ul>
          </div>

          {/* Content */}
          <div ref={contentRef} className="bg-white rounded-2xl shadow-lg p-8 prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 개인정보의 처리 목적</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                MovieSSam Debate Lab(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>서비스 제공: AI 기반 토론 학습 플랫폼 제공, 학생·교사 계정 관리</li>
                <li>회원 관리: 본인 확인, 부정 이용 방지, 가입 의사 확인, 분쟁 조정을 위한 기록 보존</li>
                <li>서비스 개선: 신규 서비스 개발, 맞춤 서비스 제공, 서비스 이용 통계 분석</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 개인정보의 처리 및 보유기간</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)</li>
                <li>전자상거래에서의 계약·청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 처리하는 개인정보의 항목</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 다음의 개인정보 항목을 처리하고 있습니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">학생 회원</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>필수항목: 반 코드, 학생 번호, 이름</li>
                  <li>자동 수집 항목: IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">교사 회원</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>필수항목: 이메일 주소, 이름(또는 닉네임)</li>
                  <li>선택항목: 프로필 사진</li>
                  <li>자동 수집 항목: IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                현재 회사는 개인정보를 제3자에게 제공하지 않습니다. 다만, 향후 서비스 제공을 위해 제3자 제공이 필요한 경우, 사전에 정보주체에게 개인정보를 제공받는 자, 제공 목적, 제공 항목, 보유 및 이용 기간을 고지하고 동의를 받겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보처리의 위탁</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">수탁업체</th>
                      <th className="text-left p-2 font-semibold">위탁업무 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Google Cloud Platform</td>
                      <td className="p-2">서버 호스팅 및 데이터 저장</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Firebase (Google)</td>
                      <td className="p-2">인증 서비스, 데이터베이스 관리</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>개인정보 처리정지 요구권</li>
                <li>개인정보 열람 요구권</li>
                <li>개인정보 정정·삭제 요구권</li>
                <li>개인정보 처리정지 요구권</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 개인정보의 파기</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">파기 방법</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                  <li>기록물, 인쇄물, 서면 등: 분쇄하거나 소각하여 파기</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보 보호책임자</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>개인정보 보호책임자</strong><br />
                  성명: MovieSSam 운영팀<br />
                  연락처: support@moviesam.com<br />
                  이메일: privacy@moviesam.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 개인정보의 안전성 확보 조치</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 개인정보 처리방침 변경</h2>
              <p className="text-gray-700 leading-relaxed">
                이 개인정보 처리방침은 2024년 12월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .min-h-screen {
            padding: 0 !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
          button {
            display: none !important;
          }
          #table-of-contents {
            page-break-after: always;
          }
          section {
            page-break-inside: avoid;
          }
          h2 {
            page-break-after: avoid;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </>
  );
}

