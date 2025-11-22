import React from "react";

type ChartProps = {
  svg: string;
};

export const Chart: React.FC<ChartProps> = ({ svg }) => {
  return (
    <div className="rounded-2xl bg-slate-900 p-4 shadow-2xl ring-1 ring-purple-500/20">
      <div
        className="w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

