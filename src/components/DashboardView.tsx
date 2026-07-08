import { useEffect, useState } from "react";
import { User, Violation, Hotspot } from "../types";
import {
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";

interface DashboardViewProps {
  currentUser: User | null;
  violations: Violation[];
  hotspots: Hotspot[];
  onNavigate: (page: any) => void;
  fetchViolations: () => void;
}

export default function DashboardView({
  currentUser,
  violations,
  hotspots,
  onNavigate,
  fetchViolations,
}: DashboardViewProps) {
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  // Calculate statistics
  const totalViolations = violations.length;
  const pendingViolations = violations.filter((v) => v.status === "Pending").length;
  const paidViolations = violations.filter((v) => v.status === "Paid").length;
  const totalFines = violations.reduce((sum, v) => sum + v.fineAmount, 0);
  const paidFines = violations.filter((v) => v.status === "Paid").reduce((sum, v) => sum + v.fineAmount, 0);

  // Repeat offenders count
  const vehicleCounts: Record<string, number> = {};
  violations.forEach((v) => {
    vehicleCounts[v.vehicleNumber] = (vehicleCounts[v.vehicleNumber] || 0) + 1;
  });
  const repeatOffendersCount = Object.values(vehicleCounts).filter((c) => c >= 2).length;

  const fetchAIRecommendations = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId: currentUser?.id, role: currentUser?.role }),
      });
      const data = await res.json();
      setAiRecommendation(data.recommendation);
    } catch (err) {
      console.error(err);
      setAiRecommendation("Failed to fetch smart recommendation. Please check system integration.");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchViolations();
    fetchAIRecommendations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-12">
          <ShieldCheck className="w-96 h-96 text-blue-500" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider font-semibold border border-blue-400/20">
            {currentUser?.district} Division Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, Officer {currentUser?.name}!
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            You are managing smart traffic enforcement logs for the AP traffic division.
            {currentUser?.role === "officer"
              ? " You are currently in restricted view mode. Showing your registered logs only."
              : " You are in administrator view. You can check all regional logs, edit records, and register officers."}
          </p>
        </div>
      </div>

      {/* Statistics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Violations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">+12%</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Violations Logged
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalViolations}</h3>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">Registered cases</span>
          </div>
        </div>

        {/* Pending & Paid */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">PENDING</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Fines
            </p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingViolations}</h3>
            <span className="text-[10px] text-amber-500 font-mono block mt-1">₹{totalFines - paidFines} outstanding</span>
          </div>
        </div>

        {/* Paid Violations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">REVENUE</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fines Collected
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">₹{paidFines}</h3>
            <span className="text-[10px] text-emerald-500 font-mono block mt-1">{paidViolations} of {totalViolations} cleared</span>
          </div>
        </div>

        {/* Repeat Offenders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">HIGH RISK</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Repeat Offenders
            </p>
            <h3 className="text-3xl font-extrabold text-red-600 mt-1">{repeatOffendersCount}</h3>
            <span className="text-[10px] text-red-500 font-mono block mt-1">Flagged vehicle owners</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI recommendations (Lg spans 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg text-white">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">TrafficGuard AI Analyst</h2>
                  <p className="text-xs text-slate-400">
                    Dynamic machine recommendations & safety audits
                  </p>
                </div>
              </div>
              <button
                onClick={fetchAIRecommendations}
                disabled={loadingAI}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700/60 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {loadingAI ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <span>Re-analyse Logs</span>
                )}
              </button>
            </div>

            <div className="min-h-[140px] text-sm text-slate-300 font-sans prose prose-invert max-w-none prose-sm leading-relaxed whitespace-pre-wrap">
              {loadingAI ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-xs text-slate-400 font-mono animate-pulse">
                    Aggregating regional hotspots and generating AI recommendations...
                  </span>
                </div>
              ) : (
                aiRecommendation || "Retrieving recommendations..."
              )}
            </div>
          </div>
        </div>

        {/* Hotspots Quicklist */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Critical Hotspots (AP)
              </h2>
              <button
                onClick={() => onNavigate("hotspot-analysis")}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-0.5 group cursor-pointer"
              >
                <span>View Map</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-3">
              {hotspots.slice(0, 3).map((spot) => (
                <div
                  key={spot.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/50 transition-colors"
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <h4 className="text-xs font-bold text-slate-700 truncate">
                      {spot.locationName}
                    </h4>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{spot.district}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                      spot.riskLevel === "High Risk"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}
                  >
                    {spot.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] leading-relaxed text-blue-800 font-medium">
            <span className="font-bold uppercase text-[9px] block text-blue-900 tracking-wider mb-0.5">
              Patrol Recommendation
            </span>
            Increase interceptor presence at high risk nodes during peak evening slots to reduce repeat offense rates.
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-md font-bold text-slate-800">Recent Violations Logged</h2>
            <p className="text-xs text-slate-500">Latest active cases recorded in database</p>
          </div>
          <button
            onClick={() => onNavigate("view-records")}
            className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
          >
            <span>All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle Number</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Violation</th>
                <th className="py-3 px-4">Fine</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                    No violation records logged in database yet.
                  </td>
                </tr>
              ) : (
                violations.slice(0, 3).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                      {v.vehicleNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{v.ownerName}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{v.violationType}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold font-mono">
                      ₹{v.fineAmount}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{v.district}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs font-mono">
                      {v.dateTime.replace("T", " ")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                          v.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
