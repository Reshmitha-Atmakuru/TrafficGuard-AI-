import { Info, ShieldAlert, Cpu, HeartHandshake, Eye } from "lucide-react";

export default function AboutView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">About TrafficGuard AI</h1>
          <p className="text-xs text-slate-500">System architecture and division objectives</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-md font-bold text-slate-800">Enforcement Vision</h2>
          <p>
            The **TrafficGuard AI – Smart Traffic Violation Detection and Management System** is a next-generation analytical platform engineered to streamline Andhra Pradesh's highway traffic safety enforcement operations.
          </p>
          <p>
            By bridging artificial intelligence and regional traffic logs, the system helps officers analyze risk trends, register violations, look up vehicle records, and auto-flag repeat offenders with 100% precision.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-800">Advanced AI Insights</h3>
            <p className="text-[11px] text-slate-400">
              Utilizes Gemini SDK to dynamically compile regional hazard recommendations and smart officer patrol directives.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-xs text-slate-800">Hotspot Indexing</h3>
            <p className="text-[11px] text-slate-400">
              Indexes accident-prone intersections across major Andhra Pradesh highways and towns for resource planning.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-xs text-slate-800">Officer Collaboration</h3>
            <p className="text-[11px] text-slate-400">
              Features role-based access control, keeping personal officer logs private while giving administrators full visibility.
            </p>
          </div>
        </div>

        {/* Technical Stack Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Technical Specifications</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[9px] text-slate-400 block uppercase">Frontend UI</span>
              <strong className="text-slate-700 block text-[11px]">React + Vite</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[9px] text-slate-400 block uppercase">Backend Driver</span>
              <strong className="text-slate-700 block text-[11px]">Java Spring Boot</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[9px] text-slate-400 block uppercase">ORM Layer</span>
              <strong className="text-slate-700 block text-[11px]">Spring Data JPA</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[9px] text-slate-400 block uppercase">SQL Database</span>
              <strong className="text-slate-700 block text-[11px]">MySQL Server</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
