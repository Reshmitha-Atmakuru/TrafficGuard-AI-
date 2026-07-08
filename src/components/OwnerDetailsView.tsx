import React, { useState, useEffect } from "react";
import { VehicleOwner, User } from "../types";
import {
  Search,
  User as UserIcon,
  Smartphone,
  Mail,
  MapPin,
  CreditCard,
  Car,
  AlertOctagon,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface OwnerDetailsViewProps {
  currentUser: User | null;
  searchVehicleNumber: string;
  setSearchVehicleNumber: (vNum: string) => void;
}

export default function OwnerDetailsView({
  currentUser,
  searchVehicleNumber,
  setSearchVehicleNumber,
}: OwnerDetailsViewProps) {
  const [searchInput, setSearchInput] = useState(searchVehicleNumber || "");
  const [ownerData, setOwnerData] = useState<VehicleOwner | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLookup = async (plateNum: string) => {
    const cleanPlate = plateNum.trim().toUpperCase();
    if (!cleanPlate) return;

    setLoading(true);
    setErrorMessage("");
    try {
      const queryParams = currentUser ? `?officerId=${currentUser.id}&role=${currentUser.role}` : "";
      const res = await fetch(`/api/owners/${cleanPlate}${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setOwnerData(data);
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "No owner files matching plate number.");
        setOwnerData(null);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Database lookup failed. Ensure backend service is online.");
      setOwnerData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchVehicleNumber) {
      setSearchInput(searchVehicleNumber);
      handleLookup(searchVehicleNumber);
    }
  }, [searchVehicleNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchVehicleNumber(searchInput);
    handleLookup(searchInput);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Owner & Vehicle Lookup</h1>
          <p className="text-xs text-slate-500">Query vehicle registry profile and historic offenses</p>
        </div>
      </div>

      {/* Query Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex space-x-2"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Car className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Enter AP Vehicle Plate Number (e.g. AP16BZ1234)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/15"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          {loading ? "Searching..." : "Lookup Registry"}
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Lookup Query Unresolved</h4>
            <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Owner Profile Grid */}
      {ownerData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Owner Profile Details */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              {/* Profile Avatar Badge */}
              <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mb-3">
                  <UserIcon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{ownerData.ownerName}</h3>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Registry: {ownerData.licenseNumber}
                </span>
              </div>

              {/* Data Lines */}
              <div className="space-y-3.5 text-xs">
                {/* Vehicle Model */}
                <div className="flex items-start space-x-3">
                  <Car className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Vehicle Asset
                    </span>
                    <span className="font-semibold text-slate-700">{ownerData.vehicleModel}</span>
                    <span className="text-[10px] font-mono block text-slate-500 font-bold">
                      {ownerData.vehicleNumber}
                    </span>
                  </div>
                </div>

                {/* Contact phone */}
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Contact Phone
                    </span>
                    <span className="font-semibold text-slate-700">{ownerData.phone}</span>
                  </div>
                </div>

                {/* Contact email */}
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Email Address
                    </span>
                    <span className="font-semibold text-slate-700 break-all">
                      {ownerData.email}
                    </span>
                  </div>
                </div>

                {/* Registered Address */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Physical Address
                    </span>
                    <span className="font-semibold text-slate-600 leading-normal">
                      {ownerData.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div
                className={`p-3.5 rounded-lg flex items-center justify-between border ${
                  ownerData.previousViolations >= 2
                    ? "bg-red-50 border-red-100 text-red-800"
                    : "bg-slate-50 border-slate-100 text-slate-700"
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider block">
                    Recorded Violations
                  </span>
                  <span className="text-lg font-extrabold block">
                    {ownerData.previousViolations} cases
                  </span>
                </div>
                <AlertOctagon
                  className={`w-5 h-5 ${
                    ownerData.previousViolations >= 2 ? "text-red-600 animate-bounce" : "text-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Violation History list */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                Ticket Records Timeline
              </h2>

              <div className="space-y-4">
                {!ownerData.violationsHistory || ownerData.violationsHistory.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    This vehicle has no registered violation logs in the database. Clean record.
                  </div>
                ) : (
                  ownerData.violationsHistory.map((v, i) => (
                    <div
                      key={v.id}
                      className="relative pl-6 border-l-2 border-slate-200 pb-2 space-y-2 group last:pb-0"
                    >
                      {/* Circle indicator */}
                      <div className="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-slate-200 group-hover:bg-blue-600 transition-colors"></div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{v.violationType}</span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            v.status === "Paid"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-slate-500 text-[10px]">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{v.location}</span>
                          </span>
                          <span className="flex items-center space-x-1 justify-end font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{v.dateTime.replace("T", " ")}</span>
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-normal">
                          "{v.description}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-semibold border-t border-slate-200/50 pt-2 text-slate-400">
                          <span>Fine Imposed: <strong className="text-slate-700">₹{v.fineAmount}</strong></span>
                          <span>Logged by: {v.officerName}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial Landing Placeholder */}
      {!ownerData && !errorMessage && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-sm">Query Vehicle Dossier</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal mt-1">
              Enter any Andhra Pradesh registration plate number in the search bar above to fetch owner contact details, license filings, and complete driving citations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
