"use client";

import { useEffect, useRef } from "react";
import { LuFileDown } from "react-icons/lu";

export default function TermsPage() {
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
              <h1 className="text-4xl font-bold text-gray-900">이용약관</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
              <p className="text-gray-700 leading-relaxed">
                이 약관은 MovieSSam Debate Lab(이하 "회사")이 제공하는 AI 기반 토론 학습 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>"서비스"란 회사가 제공하는 AI 기반 토론 학습 플랫폼 및 관련 제반 서비스를 의미합니다.</li>
                <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 학생, 교사, 기타 회원을 의미합니다.</li>
                <li>"학생"이란 반 코드를 통해 서비스에 가입한 학생 회원을 의미합니다.</li>
                <li>"교사"란 구글 계정 또는 게스트 계정으로 서비스에 가입한 교사 회원을 의미합니다.</li>
                <li>"반"이란 교사가 생성한 학생 그룹 단위를 의미합니다.</li>
                <li>"콘텐츠"란 서비스를 통해 이용자가 게시, 전송, 공유하는 모든 정보, 자료, 데이터를 의미합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 게시와 개정)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다. 약관이 개정되는 경우 회사는 개정된 약관의 내용과 적용일자를 명시하여 현행약관과 함께 서비스의 초기 화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 이용자에게 불리하게 약관 내용을 변경하는 경우에는 최소한 30일 이상의 사전 유예기간을 두고 공지합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공 및 변경)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 다음과 같은 서비스를 제공합니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>AI 기반 토론 학습 플랫폼 서비스</li>
                <li>토론 주제 선택 및 토론 세션 생성 서비스</li>
                <li>실시간 AI 피드백 및 평가 서비스</li>
                <li>학생 활동 모니터링 및 관리 서비스(교사용)</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                회사는 서비스의 내용, 이용방법, 이용시간에 대하여 변경이 있는 경우, 변경사유, 변경될 서비스의 내용 및 제공일자 등을 그 변경 전 7일 이상 서비스 화면에 게시하여야 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (서비스의 중단)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (회원의 의무)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                이용자는 다음 행위를 하여서는 안 됩니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제 또는 유통하거나 상업적으로 이용하는 행위</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (개인정보보호)</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 이용자의 개인정보 수집 시 서비스 제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다. 회사는 회원가입 시 구매계약이 필요하거나 서비스 제공을 위하여 필요한 개인정보만을 수집하며, 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다. 회사는 개인정보 보호법 제20조에 따라 이용자의 개인정보를 보호하며, 자세한 사항은 개인정보 처리방침에 고지합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (회사의 의무)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                회사는 이용자가 안전하게 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함) 보호를 위한 보안 시스템을 구축하며 개인정보 처리방침을 공시하고 준수합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (손해배상)</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 중대한 과실에 의한 경우를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제11조 (면책조항)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제12조 (준거법 및 관할법원)</h2>
              <p className="text-gray-700 leading-relaxed">
                이 약관의 해석 및 회사와 회원 간의 분쟁에 대하여는 대한민국의 법을 적용하며, 본 분쟁으로 인하여 소송이 제기될 경우 소송은 회사의 본사 소재지를 관할하는 법원의 관할로 합니다.
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

