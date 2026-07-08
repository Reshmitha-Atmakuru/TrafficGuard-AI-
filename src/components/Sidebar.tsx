import { ActivePage, User } from "../types";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  BarChart3,
  AlertTriangle,
  UserCheck,
  Settings,
  Info,
  Mail,
  LogOut,
  ShieldAlert,
} from "lucide-react";

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ activePage, setActivePage, currentUser, onLogout }: SidebarProps) {
  if (!currentUser) return null;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add-violation", label: "Add Violation", icon: PlusCircle },
    { id: "view-records", label: "View Records", icon: FileText },
    { id: "owner-details", label: "Owner Details", icon: Search },
    { id: "reports", label: "Reports & Charts", icon: BarChart3 },
    { id: "hotspot-analysis", label: "Hotspot Analysis", icon: AlertTriangle },
    { id: "profile", label: "Officer Profile", icon: UserCheck },
    { id: "settings", label: "System Settings", icon: Settings },
    { id: "about", label: "About System", icon: Info },
    { id: "contact", label: "Contact Support", icon: Mail },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-20 shadow-xl border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-white font-sans">
            TrafficGuard AI
          </h1>
          <span className="text-xs text-blue-400 font-medium font-mono">
            Smart Enforcement
          </span>
        </div>
      </div>

      {/* Logged-In User Badge */}
      <div className="p-4 mx-4 my-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-semibold truncate text-slate-200">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono truncate">
              {currentUser.badgeNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[10px]">
          <span className="text-slate-400">Role:</span>
          <span
            className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              currentUser.role === "admin"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/10"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <IconComponent
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Log Out */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-red-600/10 hover:border-red-600/20 border border-transparent transition-all duration-150"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Exit Session</span>
        </button>
        <div className="text-center text-[10px] text-slate-600 font-mono">
          Ver. 1.0.0 (Andhra Pradesh)
        </div>
      </div>
    </aside>
  );
}
