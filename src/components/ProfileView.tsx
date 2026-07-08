import { User, Violation } from "../types";
import {
  UserCheck,
  ShieldAlert,
  MapPin,
  Calendar,
  Layers,
  Award,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface ProfileViewProps {
  currentUser: User | null;
  violations: Violation[];
}

export default function ProfileView({ currentUser, violations }: ProfileViewProps) {
  if (!currentUser) return null;

  // Calculate officer specific statistics
  const officerLogsCount = violations.filter((v) => v.officerId === currentUser.id).length || violations.length; // Fallback
  const settledFinesCount = violations
    .filter((v) => v.officerId === currentUser.id && v.status === "Paid")
    .reduce((sum, v) => sum + v.fineAmount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Officer Credentials Portfolio</h1>
          <p className="text-xs text-slate-500">Official traffic authority registry files</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 relative flex items-end p-6">
          <div className="absolute right-4 top-4 bg-white/10 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-white/20 uppercase font-bold">
            Govt. of Andhra Pradesh
          </div>
        </div>

        {/* Info Layout */}
        <div className="p-6 pt-0 relative space-y-6">
          {/* Avatar Position */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 sm:space-x-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-white p-1 border-2 border-slate-100 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
            <div className="mt-3 sm:mt-0 space-y-1">
              <h2 className="text-lg font-extrabold text-slate-800">{currentUser.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                <span>Badge: {currentUser.badgeNumber}</span>
                <span>•</span>
                <span className="font-sans uppercase text-blue-600 font-bold tracking-wide">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-slate-100 py-6 text-xs">
            {/* Field */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  Assigned District Sector
                </span>
                <span className="font-semibold text-slate-700 text-sm">
                  {currentUser.district}, AP
                </span>
              </div>
            </div>

            {/* Field */}
            <div className="flex items-start space-x-3">
              <Layers className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  Security Privilege Cleared
                </span>
                <span className="font-semibold text-slate-700 text-sm capitalize">
                  {currentUser.role} Authorization
                </span>
              </div>
            </div>

            {/* Field */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  System Session Logged At
                </span>
                <span className="font-semibold text-slate-700 text-sm font-mono">
                  {new Date().toISOString().slice(0, 10)}
                </span>
              </div>
            </div>

            {/* Field */}
            <div className="flex items-start space-x-3">
              <Award className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  Enforcement Authority Division
                </span>
                <span className="font-semibold text-slate-700 text-sm">
                  AP Road Transport Department
                </span>
              </div>
            </div>
          </div>

          {/* Core Badges Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto" />
              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">
                Verification status
              </span>
              <span className="text-xs font-bold text-slate-700 block">Verified Officer</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-1">
              <FileCheck className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">
                Total Citations Logged
              </span>
              <span className="text-xs font-bold text-slate-700 block">{violations.length} cases</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-5 h-5 text-amber-500 mx-auto" />
              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">
                Division Status
              </span>
              <span className="text-xs font-bold text-slate-700 block">Active Patrol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
