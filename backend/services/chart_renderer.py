"""SVG renderer for Human Design BodyGraph."""
from __future__ import annotations

from typing import Dict, Set

CENTER_COLORS: Dict[str, str] = {
    "head": "#f5e9ff",
    "ajna": "#f0f4ff",
    "throat": "#e7e7ff",
    "g": "#f8f1e8",
    "ego": "#fef3c7",
    "solar_plexus": "#ffe4d9",
    "sacral": "#fbcfe8",
    "spleen": "#e0f2f1",
    "root": "#f5d0c5",
}

DEFINED_COLORS: Dict[str, str] = {
    "head": "#d8b4fe",
    "ajna": "#c7d2fe",
    "throat": "#a5b4fc",
    "g": "#f5c59b",
    "ego": "#f59e0b",
    "solar_plexus": "#f97316",
    "sacral": "#f43f5e",
    "spleen": "#4ade80",
    "root": "#ea580c",
}

CHANNEL_COLOR = "#7c3aed"

CENTER_SHAPES: Dict[str, str] = {
    "head": '<polygon id="center_head" points="240,30 300,70 240,110 180,70" />',
    "ajna": '<polygon id="center_ajna" points="240,120 300,160 240,200 180,160" />',
    "throat": '<rect id="center_throat" x="200" y="210" width="80" height="60" rx="8" />',
    "g": '<rect id="center_g" x="200" y="290" width="80" height="100" rx="12" />',
    "ego": '<rect id="center_ego" x="120" y="310" width="60" height="60" rx="12" />',
    "solar_plexus": '<ellipse id="center_solar_plexus" cx="140" cy="410" rx="50" ry="35" />',
    "spleen": '<ellipse id="center_spleen" cx="340" cy="410" rx="50" ry="35" />',
    "sacral": '<rect id="center_sacral" x="200" y="410" width="80" height="80" rx="12" />',
    "root": '<rect id="center_root" x="200" y="520" width="80" height="60" rx="10" />',
}

CHANNEL_LINES: Dict[str, str] = {
    "34-20": '<line id="channel_34_20" x1="240" y1="450" x2="240" y2="240" stroke-width="8" />',
    "5-15": '<line id="channel_5_15" x1="240" y1="450" x2="240" y2="350" stroke-width="8" />',
    "1-8": '<line id="channel_1_8" x1="240" y1="330" x2="240" y2="230" stroke-width="8" />',
    "7-31": '<line id="channel_7_31" x1="220" y1="330" x2="220" y2="230" stroke-width="8" />',
    "10-20": '<line id="channel_10_20" x1="210" y1="330" x2="240" y2="230" stroke-width="8" />',
    "3-60": '<line id="channel_3_60" x1="240" y1="520" x2="240" y2="450" stroke-width="8" />',
}


SVG_WRAPPER = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="120 0 260 620" style="background:linear-gradient(180deg,#0f172a 0%,#111827 100%);color:#f8fafc;font-family:'Inter',sans-serif;">
  <defs>
    <filter id="shadow" x="-20" y="-20" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0ea5e9" flood-opacity="0.3" />
    </filter>
  </defs>
  <g id="centers">{centers}</g>
  <g id="channels" stroke="{channel_color}" stroke-linecap="round" opacity="0.9">{channels}</g>
</svg>
"""


def _render_centers(active_centers: Set[str]) -> str:
    pieces: list[str] = []
    for center, shape in CENTER_SHAPES.items():
        fill = DEFINED_COLORS[center] if center in active_centers else "#ffffff"
        styled = shape.replace(
            "/>",
            f' fill="{fill}" stroke="{CENTER_COLORS[center]}" stroke-width="3" filter="url(#shadow)" />',
        )
        pieces.append(styled)
    return "".join(pieces)


def _render_channels(active_channels: Set[str]) -> str:
    parts: list[str] = []
    for channel, line in CHANNEL_LINES.items():
        if channel in active_channels:
            colored = line.replace(
                "/>", f' stroke="{CHANNEL_COLOR}" filter="url(#shadow)" />'
            )
            parts.append(colored)
    return "".join(parts)


def generate_svg(active_centers: Set[str], active_channels: Set[str]) -> str:
    centers_svg = _render_centers(active_centers)
    channels_svg = _render_channels(active_channels)
    return SVG_WRAPPER.format(
        centers=centers_svg,
        channels=channels_svg,
        channel_color=CHANNEL_COLOR,
    )

