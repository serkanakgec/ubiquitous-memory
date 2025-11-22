import React, { useState } from "react";

type FormData = {
  name: string;
  city: string;
  latitude: string;
  longitude: string;
  datetime: string;
};

type FormProps = {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
};

export const Form: React.FC<FormProps> = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState<FormData>({
    name: "",
    city: "",
    latitude: "",
    longitude: "",
    datetime: "",
  });

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white/10 p-6 shadow-xl ring-1 ring-white/10 backdrop-blur"
    >
      <div>
        <label className="text-sm font-semibold text-white">Ad</label>
        <input
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
          placeholder="Adınız"
          value={form.name}
          onChange={handleChange("name")}
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-white">Doğum Yeri</label>
        <input
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
          placeholder="Şehir"
          value={form.city}
          onChange={handleChange("city")}
          required
        />
        <p className="mt-1 text-xs text-white/70">Google Places Autocomplete entegrasyonu için hazır.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-white">Enlem</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="41.0082"
            value={form.latitude}
            onChange={handleChange("latitude")}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-white">Boylam</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            placeholder="28.9784"
            value={form.longitude}
            onChange={handleChange("longitude")}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-white">Doğum Tarihi ve Saati</label>
        <input
          type="datetime-local"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
          value={form.datetime}
          onChange={handleChange("datetime")}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Hesaplanıyor..." : "Haritanı Ücretsiz Çıkar"}
      </button>
    </form>
  );
};

