export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h2>
      <a
        href="/"
        className="px-4 py-2 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}

