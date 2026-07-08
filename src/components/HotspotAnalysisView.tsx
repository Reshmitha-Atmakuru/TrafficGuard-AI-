import { useState, useEffect } from "react";
import { Hotspot, Violation } from "../types";
import {
  AlertTriangle,
  MapPin,
  Car,
  TrendingUp,
  Activity,
  PlusCircle,
  HelpCircle,
  AlertOctagon,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

interface HotspotAnalysisViewProps {
  hotspots: Hotspot[];
  violations: Violation[];
  fetchViolations: () => void;
}

export default function HotspotAnalysisView({
  hotspots,
  violations,
  fetchViolations,
}: HotspotAnalysisViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<Hotspot | null>(null);
  const [filterRisk, setFilterRisk] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  useEffect(() => {
    fetchViolations();
    if (hotspots.length > 0) {
      setSelectedSpot(hotspots[0]);
    }
  }, [hotspots]);

  // Filters application
  const filteredSpots = hotspots.filter((spot) => {
    const matchesRisk = filterRisk ? spot.riskLevel === filterRisk : true;
    const matchesDistrict = filterDistrict ? spot.district === filterDistrict : true;
    return matchesRisk && matchesDistrict;
  });

  // Calculate repeat offenders linked to hotspots
  const offenderCounts: Record<string, number> = {};
  violations.forEach((v) => {
    offenderCounts[v.vehicleNumber] = (offenderCounts[v.vehicleNumber] || 0) + 1;
  });
  const repeatOffendersList = violations
    .filter((v) => offenderCounts[v.vehicleNumber] >= 2)
    .filter((v, idx, self) => self.findIndex((o) => o.vehicleNumber === v.vehicleNumber) === idx);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Andhra Pradesh Hotspot Analysis</h1>
          <p className="text-xs text-slate-500">
            Identify accident-prone intersections, repeated offenders, and patrol risk sectors
          </p>
        </div>
      </div>

      {/* Grid: Map simulation and table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Map simulation & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Map Simulator */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg p-6 relative min-h-[320px] flex flex-col justify-between text-white">
            {/* Ambient grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-widest">
                  Live Vector Map Simulation
                </span>
                <h3 className="font-bold text-sm font-sans">AP High-Risk Intersection Radar</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] border border-emerald-500/20 animate-pulse">
                SYSTEM ONLINE
              </span>
            </div>

            {/* Simulated Map Markers */}
            <div className="relative z-10 flex-1 my-6 flex items-center justify-center min-h-[160px] bg-slate-950/40 rounded-lg border border-slate-800/60 p-4">
              <div className="relative w-full h-full min-h-[140px]">
                {/* Simulated contour circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full border border-blue-500/5 animate-ping"></div>
                  <div className="w-56 h-56 rounded-full border border-blue-500/5"></div>
                </div>

                {filteredSpots.map((spot, idx) => {
                  const isSelected = selectedSpot?.id === spot.id;
                  // Map latitude/longitude to clean percentages for simulated layout
                  const latSeed = (spot.coordinates?.lat - 13) / (18 - 13);
                  const lngSeed = (spot.coordinates?.lng - 77) / (84 - 77);
                  const topPercent = Math.max(15, Math.min(85, 100 - Math.round(latSeed * 100)));
                  const leftPercent = Math.max(15, Math.min(85, Math.round(lngSeed * 100)));

                  return (
                    <button
                      key={spot.id}
                      onClick={() => setSelectedSpot(spot)}
                      style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all group"
                    >
                      <div className="relative">
                        <MapPin
                          className={`w-6 h-6 transition-transform ${
                            isSelected
                              ? "text-red-500 scale-125"
                              : spot.riskLevel === "High Risk"
                              ? "text-orange-500 hover:text-red-400"
                              : spot.riskLevel === "Medium Risk"
                              ? "text-yellow-500 hover:text-yellow-400"
                              : "text-blue-400 hover:text-blue-300"
                          }`}
                        />
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-[8px] font-mono whitespace-nowrap px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none z-30">
                          {spot.locationName}
                        </span>
                      </div>
                    </button>
                  );
                })}

                <div className="absolute bottom-2 left-2 text-[9px] text-slate-500 font-mono">
                  Vijayawada Segment Core (NH-16 Apex)
                </div>
              </div>
            </div>

            {/* Radar Coordinates Panel */}
            {selectedSpot && (
              <div className="relative z-10 p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="text-slate-500 uppercase tracking-wider text-[8px] block">
                    Target Intersection Coordinate
                  </span>
                  <span className="text-slate-300 font-bold block text-[11px]">
                    {selectedSpot.locationName} ({selectedSpot.district})
                  </span>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  LAT: {selectedSpot.coordinates?.lat}° N
                  <br />
                  LNG: {selectedSpot.coordinates?.lng}° E
                </div>
              </div>
            )}
          </div>

          {/* Detailed Hotspot Audits Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Andhra Pradesh Regional Audits</h3>
                <p className="text-[10px] text-slate-400">Crash indices and enforcement stats</p>
              </div>

              {/* Table Filters */}
              <div className="flex space-x-2">
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded focus:outline-none bg-white"
                >
                  <option value="">All Risk Indices</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Medium Risk">Medium Risk</option>
                  <option value="Low Risk">Low Risk</option>
                </select>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded focus:outline-none bg-white"
                >
                  <option value="">All Districts</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Tirupati">Tirupati</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="py-2.5 px-3">Location Name</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3 text-center">Accidents</th>
                    <th className="py-2.5 px-3 text-center">Violations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSpots.map((spot) => (
                    <tr
                      key={spot.id}
                      onClick={() => setSelectedSpot(spot)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                        selectedSpot?.id === spot.id ? "bg-blue-50/20" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-700">{spot.locationName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{spot.district}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            spot.riskLevel === "High Risk"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : spot.riskLevel === "Medium Risk"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}
                        >
                          {spot.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                        {spot.accidentCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                        {spot.violationCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Active Recommendation & Repeat Offenders */}
        <div className="space-y-6">
          {/* Active Hotspot Inspector Card */}
          {selectedSpot && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Zone Inspector</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">
                    Location Name
                  </span>
                  <span className="font-bold text-slate-800 block text-sm">
                    {selectedSpot.locationName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
                    District: {selectedSpot.district} Division
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-slate-400 font-semibold block text-[8px] uppercase">
                      Crash Index
                    </span>
                    <span className="font-extrabold text-slate-800 block text-md">
                      {selectedSpot.accidentCount} crashes
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-slate-400 font-semibold block text-[8px] uppercase">
                      Citations
                    </span>
                    <span className="font-extrabold text-slate-800 block text-md">
                      {selectedSpot.violationCount} tickets
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider mb-1">
                    Risk Assessment Detail
                  </span>
                  <p className="text-slate-600 leading-normal bg-slate-50/50 p-2.5 rounded border border-slate-100 italic">
                    "{selectedSpot.description}"
                  </p>
                </div>

                {/* AI Patrol Recommendation banner */}
                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 flex items-start space-x-2.5">
                  <BrainCircuit className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-blue-400 font-mono tracking-wider">
                      AI Patrol Directive
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {selectedSpot.riskLevel === "High Risk"
                        ? `Deploy speed interceptors on this NH sector. Schedule speed audits between 21:00 and 02:00.`
                        : `Deploy mobile patrolling checks. Conduct automated surveillance camera auditing periodically.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Repeat Offenders Quicklist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Flagged Repeat Offenders</h3>
              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-extrabold border border-red-100">
                {repeatOffendersList.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {repeatOffendersList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-mono">
                  No recurring offenders recorded yet.
                </div>
              ) : (
                repeatOffendersList.map((offender, i) => (
                  <div
                    key={i}
                    className="p-3 bg-red-50/30 border border-red-100/50 hover:border-red-200 rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 font-mono">
                        {offender.vehicleNumber}
                      </h4>
                      <p className="text-slate-500 text-[10px] font-medium">
                        Owner: {offender.ownerName}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wide">
                      Recurring
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
