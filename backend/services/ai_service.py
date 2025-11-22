"""Integration with Google Gemini for Human Design readings."""
from __future__ import annotations

import json
import os
from typing import Any, Dict

import google.generativeai as genai

SYSTEM_PROMPT = (
    "Sen dünyaca ünlü bir Human Design uzmanısın (Jenna Zoe tarzı). "
    "Sana verilen teknik JSON verilerini (Tip, Profil, Kapılar) kullanarak, kullanıcıya "
    '"Sen şöylesin, böylesin" diyen, soğuk olmayan, empatik, güçlendirici ve aksiyon '
    "odaklı bir rapor yaz. Astrolojik jargon kullanma, hayatın içinden örnekler ver."
)


def _build_model() -> genai.GenerativeModel:
    api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_GEMINI_API_KEY is not configured")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-pro")


def generate_reading(technical_data: Dict[str, Any]) -> str:
    """Send technical JSON data to Gemini and return a markdown report."""

    model = _build_model()
    payload = json.dumps(technical_data, ensure_ascii=False, indent=2)
    response = model.generate_content(
        [
            {"role": "system", "parts": [SYSTEM_PROMPT]},
            {
                "role": "user",
                "parts": [
                    "Aşağıdaki Human Design teknik verilerine dayanarak markdown formatında uzun, başlıklı ve madde işaretli bir rapor üret:",
                    payload,
                ],
            },
        ]
    )
    return response.text

