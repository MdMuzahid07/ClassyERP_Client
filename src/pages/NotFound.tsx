import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12">
      <h1 className="text-8xl font-black text-slate-200 tracking-wider">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mt-6">Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};
export default NotFound;
