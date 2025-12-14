export default function MainCard() {
  return (
    <div className="w-full max-w-[480px] min-h-[200px] mx-auto bg-white/90 backdrop-blur-sm rounded-2xl border border-lavender-200/40 shadow-lg p-6 md:p-8 flex flex-col items-center justify-center space-y-5 md:space-y-6">
      {/* App Logo */}
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-lavender-400 via-mint-300 to-lavender-300 flex items-center justify-center shadow-md">
        <i className="fas fa-comments text-white text-xl md:text-2xl"></i>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">
          MovieSSam Debate Lab
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-medium">
          학생용 AI 모의 토론 연습실
        </p>
      </div>

      {/* Version Chip */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-100 text-lavender-700 text-xs font-semibold border border-lavender-200">
        <span className="w-1.5 h-1.5 rounded-full bg-lavender-500"></span>
        v1.0
      </div>
    </div>
  );
}

