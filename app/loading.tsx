export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 bg-opacity-50">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 h-16 w-16 rounded-full border-t-4 border-blue-600 animate-spin"></div>
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Loading Case Data...</h2>
        <p className="text-gray-500 mt-2">Please wait while we prepare your files.</p>
      </div>
    </div>
  );
}
