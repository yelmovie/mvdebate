"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">오류가 발생했습니다</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700"
      >
        다시 시도
      </button>
    </div>
  );
}
