"""Human Design calculation utilities.

This module centralizes the computational rules for the Human Design system.
The implementation focuses on modular, testable helpers so downstream
endpoints can orchestrate the workflow in small, verifiable steps.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, Iterable, List, Set, Tuple

import pytz
from timezonefinder import TimezoneFinder

# pyswisseph or flatlib are heavy optional dependencies; imports are placed inside
# functions so the module can be imported even when the packages are missing in
# lightweight environments.


@dataclass
class BirthData:
    name: str
    city: str
    latitude: float
    longitude: float
    datetime: datetime


@dataclass
class GateActivation:
    planet: str
    gate: int
    line: int
    degree: float
    consciousness: str  # "personality" or "design"


@dataclass
class CalculationResult:
    personality: List[GateActivation]
    design: List[GateActivation]
    defined_centers: Set[str]
    active_channels: Set[str]
    hd_type: str


CHANNEL_MAP: Dict[str, Dict[str, Iterable[int] | Iterable[str]]] = {
    "34-20": {"gates": (34, 20), "centers": ("sacral", "throat")},
    "5-15": {"gates": (5, 15), "centers": ("sacral", "g")},
    "1-8": {"gates": (1, 8), "centers": ("g", "throat")},
    "7-31": {"gates": (7, 31), "centers": ("g", "throat")},
    "10-20": {"gates": (10, 20), "centers": ("g", "throat")},
    "3-60": {"gates": (3, 60), "centers": ("sacral", "root")},
}


GATE_TO_CENTER: Dict[int, str] = {
    34: "sacral",
    20: "throat",
    5: "sacral",
    15: "g",
    1: "g",
    8: "throat",
    7: "g",
    31: "throat",
    10: "g",
    3: "sacral",
    60: "root",
}

MOTOR_CENTERS: Set[str] = {"sacral", "root", "solar_plexus", "ego"}


def resolve_timezone(latitude: float, longitude: float) -> pytz.BaseTzInfo:
    """Return a pytz timezone object using coordinates.

    The function raises a ValueError when a timezone cannot be resolved.
    """

    tf = TimezoneFinder()
    tz_name = tf.timezone_at(lng=longitude, lat=latitude)
    if not tz_name:
        raise ValueError("Unable to resolve timezone from coordinates")
    return pytz.timezone(tz_name)


def localize_datetime(dt: datetime, latitude: float, longitude: float) -> datetime:
    """Attach the correct timezone to a naive datetime."""

    tz = resolve_timezone(latitude, longitude)
    return tz.localize(dt)


def compute_planet_positions(moment: datetime) -> Dict[str, float]:
    """Compute ecliptic longitudes for key planets.

    The Swiss Ephemeris (pyswisseph) is preferred for accuracy. The calculation
    is intentionally isolated to allow mocking in unit tests.
    """

    import swisseph as swe  # type: ignore

    swe.set_topo(0, 0, 0)
    julian_day = swe.julday(
        moment.year, moment.month, moment.day, moment.hour + moment.minute / 60
    )
    planet_keys = {
        "sun": swe.SUN,
        "earth": swe.EARTH,
        "moon": swe.MOON,
        "mercury": swe.MERCURY,
        "venus": swe.VENUS,
        "mars": swe.MARS,
        "jupiter": swe.JUPITER,
        "saturn": swe.SATURN,
    }
    positions: Dict[str, float] = {}
    for name, code in planet_keys.items():
        lon, _, _, _, _ = swe.calc_ut(julian_day, code)
        positions[name] = lon % 360
    return positions


def gate_and_line_from_degree(degree: float) -> Tuple[int, int]:
    """Translate a degree on the zodiac wheel to a Human Design gate and line."""

    gate_size = 360 / 64
    gate_index = int(degree // gate_size)
    gate = gate_index + 1
    within_gate = degree % gate_size
    line_size = gate_size / 6
    line = int(within_gate // line_size) + 1
    return gate, line


def calculate_design_moment(birth_moment: datetime) -> datetime:
    """Return the Design moment: 88 degrees of solar movement before birth."""

    solar_speed_deg_per_day = 1  # approximate average
    days_offset = 88 / solar_speed_deg_per_day
    return birth_moment - timedelta(days=days_offset)


def build_activations(
    positions: Dict[str, float], consciousness: str
) -> List[GateActivation]:
    activations: List[GateActivation] = []
    for planet, degree in positions.items():
        gate, line = gate_and_line_from_degree(degree)
        activations.append(
            GateActivation(
                planet=planet,
                gate=gate,
                line=line,
                degree=degree,
                consciousness=consciousness,
            )
        )
    return activations


def derive_active_channels(active_gates: Set[int]) -> Set[str]:
    channels: Set[str] = set()
    for channel_id, spec in CHANNEL_MAP.items():
        g1, g2 = spec["gates"]  # type: ignore[misc]
        if {g1, g2}.issubset(active_gates):
            channels.add(channel_id)
    return channels


def derive_centers(active_gates: Set[int], active_channels: Set[str]) -> Set[str]:
    centers: Set[str] = set()
    for gate in active_gates:
        center = GATE_TO_CENTER.get(gate)
        if center:
            centers.add(center)
    for channel_id in active_channels:
        for center in CHANNEL_MAP[channel_id]["centers"]:  # type: ignore[index]
            centers.add(center)
    return centers


def determine_type(defined_centers: Set[str], active_channels: Set[str]) -> str:
    has_sacral = "sacral" in defined_centers
    motor_to_throat = any(
        "throat" in set(CHANNEL_MAP[ch]["centers"]) and set(CHANNEL_MAP[ch]["centers"]).intersection(MOTOR_CENTERS)
        for ch in active_channels
    )
    if has_sacral and motor_to_throat:
        return "Manifesting Generator"
    if has_sacral:
        return "Generator"
    if motor_to_throat:
        return "Manifestor"
    if defined_centers:
        return "Projector"
    return "Reflector"


def perform_calculation(birth: BirthData) -> CalculationResult:
    localized_dt = localize_datetime(birth.datetime, birth.latitude, birth.longitude)
    design_dt = calculate_design_moment(localized_dt)

    personality_positions = compute_planet_positions(localized_dt)
    design_positions = compute_planet_positions(design_dt)

    personality = build_activations(personality_positions, "personality")
    design = build_activations(design_positions, "design")

    active_gates = {a.gate for a in personality + design}
    active_channels = derive_active_channels(active_gates)
    defined_centers = derive_centers(active_gates, active_channels)
    hd_type = determine_type(defined_centers, active_channels)

    return CalculationResult(
        personality=personality,
        design=design,
        defined_centers=defined_centers,
        active_channels=active_channels,
        hd_type=hd_type,
    )

