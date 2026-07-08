import { useState, useEffect } from "react";
import { User, Violation, Hotspot, ActivePage } from "./types";
import Sidebar from "./components/Sidebar";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import AddViolationView from "./components/AddViolationView";
import ViewRecordsView from "./components/ViewRecordsView";
import OwnerDetailsView from "./components/OwnerDetailsView";
import ReportsView from "./components/ReportsView";
import HotspotAnalysisView from "./components/HotspotAnalysisView";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import AboutView from "./components/AboutView";
import ContactView from "./components/ContactView";
import { ShieldCheck, LogOut, Clock, HelpCircle, UserCheck } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>("login");
  
  // Dynamic state loaded from REST APIs
  const [violations, setViolations] = useState<Violation[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [searchVehicleNumber, setSearchVehicleNumber] = useState("");

  const [timeStr, setTimeStr] = useState("");

  // Sync current time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString() + "  " + now.toLocaleDateString());
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check existing session
  useEffect(() => {
    const storedUser = sessionStorage.getItem("tg_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setActivePage("dashboard");
    }
  }, []);

  // Fetch violation records from Java or prototype REST API
  const fetchViolations = async () => {
    if (!currentUser) return;
    try {
      // Send parameters to filter if officer
      const url = `/api/violations?officerId=${currentUser.id}&role=${currentUser.role}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setViolations(data);
      }
    } catch (e) {
      console.error("Failed to retrieve violation logs:", e);
    }
  };

  // Fetch hotspots from REST API
  const fetchHotspots = async () => {
    try {
      const res = await fetch("/api/hotspots");
      if (res.ok) {
        const data = await res.json();
        setHotspots(data);
      }
    } catch (e) {
      console.error("Failed to retrieve hotspots:", e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchViolations();
      fetchHotspots();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem("tg_user", JSON.stringify(user));
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("tg_user");
    setActivePage("login");
  };

  // Render the current active view screen
  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <DashboardView
            currentUser={currentUser}
            violations={violations}
            hotspots={hotspots}
            onNavigate={(page) => setActivePage(page)}
            fetchViolations={fetchViolations}
          />
        );
      case "add-violation":
        return (
          <AddViolationView
            currentUser={currentUser}
            onSuccess={() => {
              fetchViolations();
              setActivePage("view-records");
            }}
          />
        );
      case "view-records":
        return (
          <ViewRecordsView
            currentUser={currentUser}
            violations={violations}
            fetchViolations={fetchViolations}
            onNavigate={(page) => setActivePage(page)}
            setSearchVehicleNumber={setSearchVehicleNumber}
          />
        );
      case "owner-details":
        return (
          <OwnerDetailsView
            currentUser={currentUser}
            searchVehicleNumber={searchVehicleNumber}
            setSearchVehicleNumber={setSearchVehicleNumber}
          />
        );
      case "reports":
        return <ReportsView currentUser={currentUser} violations={violations} />;
      case "hotspot-analysis":
        return (
          <HotspotAnalysisView
            hotspots={hotspots}
            violations={violations}
            fetchViolations={fetchViolations}
          />
        );
      case "profile":
        return <ProfileView currentUser={currentUser} violations={violations} />;
      case "settings":
        return (
          <SettingsView
            currentUser={currentUser}
            onUserRegistered={fetchViolations}
          />
        );
      case "about":
        return <AboutView />;
      case "contact":
        return <ContactView />;
      default:
        return (
          <DashboardView
            currentUser={currentUser}
            violations={violations}
            hotspots={hotspots}
            onNavigate={(page) => setActivePage(page)}
            fetchViolations={fetchViolations}
          />
        );
    }
  };

  // Handle Login screen routing
  if (!currentUser || activePage === "login") {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={(p) => setActivePage(p)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">
              District: {currentUser.district} Patrol Sector
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 font-medium">
            {/* Clock Widget */}
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeStr}</span>
            </div>

            {/* Quick Officer Tag */}
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">{currentUser.name}</span>
            </div>

            {/* Logout control */}
            <button
              onClick={handleLogout}
              title="Terminate Active Session"
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-red-500 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Core Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
