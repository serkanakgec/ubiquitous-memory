import React, { useState } from "react";
import { Chart } from "../components/Chart";
import { Form } from "../components/Form";
import { Report } from "../components/Report";

type CalculationResponse = {
  hd_type: string;
  svg?: string;
  defined_centers: string[];
  active_channels: string[];
};

type ReportPayload = {
  content: string;
};

const LandingPage: React.FC = () => {
  const [calculation, setCalculation] = useState<CalculationResponse | null>(null);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const submitForm = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        }),
      });
      const calc = await res.json();
      setCalculation(calc);

      const reportRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculation: calc }),
      });
      const rep = await reportRes.json();
      setReport(rep);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">Human Design SaaS</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Kendi Human Design haritanı hesapla ve AI destekli okumanı al.
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Astroloji, mistik renkler ve kurumsal kaliteyi buluşturan yeni nesil platform.
          </p>
        </header>

        <main className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Form onSubmit={submitForm} isLoading={loading} />
            {calculation?.svg && <Chart svg={calculation.svg} />}
          </div>
          <div className="space-y-6">
            <Report
              title={calculation ? calculation.hd_type : "Human Design Okuması"}
              summary="Tip, strateji ve otoriteni temel alan hızlı bir özet."
              details={report?.content ?? "Haritan hazır olduğunda AI özetin burada belirecek."}
              onDownload={() => alert("Premium rapor indirme akışı burada tetiklenir.")}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;

