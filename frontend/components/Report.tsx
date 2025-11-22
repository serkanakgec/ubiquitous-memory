import React from "react";

type ReportProps = {
  title: string;
  summary: string;
  details: string;
  onDownload?: () => void;
};

export const Report: React.FC<ReportProps> = ({ title, summary, details, onDownload }) => {
  return (
    <div className="space-y-4 rounded-2xl bg-white/5 p-6 shadow-xl ring-1 ring-white/10">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-purple-200">Özet</p>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-base text-white/80">{summary}</p>
      </div>
      <div className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap rounded-xl bg-slate-900/60 p-4 text-sm text-purple-100">
          {details}
        </pre>
      </div>
      <button
        onClick={onDownload}
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-center text-base font-semibold text-slate-900 shadow-lg transition hover:scale-[1.01]"
      >
        Detaylı 80 Sayfalık Raporu İndir (Premium)
      </button>
    </div>
  );
};

