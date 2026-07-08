import React, { useState, useEffect } from "react";
import { Violation, User } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  IndianRupee,
  Activity,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ReportsViewProps {
  currentUser: User | null;
  violations: Violation[];
}

export default function ReportsView({ currentUser, violations }: ReportsViewProps) {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reports from Express
  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = currentUser ? `?officerId=${currentUser.id}&role=${currentUser.role}` : "";
      const resWeekly = await fetch(`/api/reports/weekly${queryParams}`);
      const resMonthly = await fetch(`/api/reports/monthly${queryParams}`);
      
      if (resWeekly.ok && resMonthly.ok) {
        setWeeklyData(await resWeekly.json());
        setMonthlyData(await resMonthly.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [violations]);

  // Process Category distribution
  const typeCounts: Record<string, number> = {};
  violations.forEach((v) => {
    typeCounts[v.violationType] = (typeCounts[v.violationType] || 0) + 1;
  });

  const categoryDistribution = Object.keys(typeCounts).map((key) => ({
    name: key,
    value: typeCounts[key],
  }));

  // Theme colors for charts
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // Download simulation
  const handleExport = (format: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ weeklyData, monthlyData, categories: categoryDistribution }, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `TrafficGuard_Analytical_Report_${new Date().getFullYear()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Analytical Reports & Charts</h1>
            <p className="text-xs text-slate-500">
              Aggregated charts and metrics for traffic violation audits
            </p>
          </div>
        </div>

        {/* Exports */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport("CSV")}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Audit CSV</span>
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>Audit PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-3 py-24 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs text-slate-400 font-mono">Compiling monthly/weekly reports...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Weekly Traffic Citations</h3>
                <p className="text-[10px] text-slate-400">Total violations registered over last 7 days</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="violations" name="Violations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Fine Line Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Revenue Collections (INR)</h3>
                <p className="text-[10px] text-slate-400">Fines collected in rupees per month</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="fineCollected"
                      name="Fines (₹)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart: Categories Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-1">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Violation Demographics</h3>
                <p className="text-[10px] text-slate-400">Breakdown of infraction categories</p>
              </div>
              {categoryDistribution.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-mono">
                  No categories recorded.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-44 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Custom Legends */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {categoryDistribution.map((entry, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        ></div>
                        <span className="truncate text-slate-600 font-medium">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Structured Table summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Monthly Enforcement Summary</h3>
                <p className="text-[10px] text-slate-400">Monthly breakdown of fines levied vs logs</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="py-2.5 px-3">Month Calendar</th>
                      <th className="py-2.5 px-3">Cases Registered</th>
                      <th className="py-2.5 px-3">Levied Revenue</th>
                      <th className="py-2.5 px-3">Performance Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyData.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{m.month} {new Date().getFullYear()}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono font-bold">{m.violations} tickets</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 font-mono">₹{m.fineCollected}</td>
                        <td className="py-2.5 px-3">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full"
                              style={{
                                width: `${
                                  m.violations > 0
                                    ? Math.min((m.violations / Math.max(...monthlyData.map((o) => o.violations))) * 100, 100)
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
