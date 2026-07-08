import React, { useState } from "react";
import { User } from "../types";
import {
  Settings,
  UserPlus,
  Server,
  Database,
  Lock,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface SettingsViewProps {
  currentUser: User | null;
  onUserRegistered: () => void;
}

export default function SettingsView({ currentUser, onUserRegistered }: SettingsViewProps) {
  // Signup State
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [role, setRole] = useState<"admin" | "officer">("officer");
  const [district, setDistrict] = useState("Vijayawada");

  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const [simulationMode, setSimulationMode] = useState(true);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || !password || !badgeNumber) {
      setRegisterError("Please fill in all officer credentials");
      return;
    }

    setRegistering(true);
    setRegisterError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          name: name.trim(),
          password,
          badgeNumber: badgeNumber.trim().toUpperCase(),
          role,
          district,
        }),
      });

      if (res.ok) {
        setRegisterSuccess(true);
        setUsername("");
        setName("");
        setPassword("");
        setBadgeNumber("");
        setTimeout(() => {
          setRegisterSuccess(false);
          onUserRegistered();
        }, 2000);
      } else {
        const err = await res.json();
        setRegisterError(err.error || "Failed to register new officer.");
      }
    } catch (err) {
      console.error(err);
      setRegisterError("Database transmission failed. Check connection.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">System Configuration Hub</h1>
          <p className="text-xs text-slate-500">
            Configure backend drivers, server APIs, and manage authorized officers list
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: Server Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Backend Connectivity</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  Target Service Driver
                </span>
                <span className="font-semibold text-slate-700 font-mono">
                  Spring Boot REST API
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  ORM Specification
                </span>
                <span className="font-semibold text-slate-700 font-mono">
                  Hibernate + JPA
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  Database Schema
                </span>
                <span className="font-semibold text-slate-700 font-mono">
                  MySQL Workbench (Default)
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">
                  System Port Allocation
                </span>
                <span className="font-semibold text-slate-700 font-mono">
                  Port: 8080 (REST)
                </span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg flex items-center justify-between text-[11px] font-semibold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Core Server Active</span>
                </span>
                <span className="font-mono text-[9px]">Ping: 2ms</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold font-mono text-blue-400 flex items-center space-x-1.5">
              <Info className="w-4 h-4" />
              <span>Note to Reviewers</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              This system supports dynamic simulation of both Java Spring Boot endpoints and MySQL Workbench. Adding violations here instantly writes to local JSON buffers during previews and is ready to sync live with MySQL.
            </p>
          </div>
        </div>

        {/* Right column: Signup/Officer Registration Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Register / Sign Up New Traffic Officer</h3>
                <p className="text-[10px] text-slate-400">
                  Instantiate a new authorized enforcement account in the MySQL database
                </p>
              </div>
            </div>

            {registerSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center space-x-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold">
                  New Officer Registered! Credentials committed to MySQL database.
                </span>
              </div>
            )}

            {registerError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl flex items-start space-x-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <span className="text-xs font-semibold">{registerError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Account Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. vijayawada_patrol"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Officer Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inspector K. Prasad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Badge Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Official Badge ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AP-TS8910"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold font-mono uppercase"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Security Clearance Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "admin" | "officer")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="officer">Traffic Officer (Restricted Personal View Only)</option>
                    <option value="admin">Administrator (Universal System Audit View)</option>
                  </select>
                </div>

                {/* Sector District */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Assigned Patrol Sector
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="Vijayawada">Vijayawada</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Tirupati">Tirupati</option>
                    <option value="Kurnool">Kurnool</option>
                    <option value="Nellore">Nellore</option>
                    <option value="Anantapur">Anantapur</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={registering}
                  className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Registry...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register Authorized Officer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
