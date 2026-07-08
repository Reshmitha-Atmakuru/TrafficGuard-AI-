import React, { useState, useEffect } from "react";
import { User, Violation } from "../types";
import {
  FilePlus,
  Car,
  DollarSign,
  MapPin,
  Clock,
  FileText,
  Camera,
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface AddViolationViewProps {
  currentUser: User | null;
  onSuccess: () => void;
}

export default function AddViolationView({ currentUser, onSuccess }: AddViolationViewProps) {
  // Form fields
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [violationType, setViolationType] = useState("Over Speeding");
  const [fineAmount, setFineAmount] = useState(1500);
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState(currentUser?.district || "Vijayawada");
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState<"Pending" | "Paid">("Pending");
  const [description, setDescription] = useState("");
  const [evidenceImage, setEvidenceImage] = useState("");
  
  // States for verification and submission
  const [lookupLoading, setLookupLoading] = useState(false);
  const [ownerFound, setOwnerFound] = useState<boolean | null>(null);
  const [previousViolationsCount, setPreviousViolationsCount] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Standard fines list
  const standardFines: Record<string, number> = {
    "Over Speeding": 1500,
    "No Helmet": 500,
    "Red Light Jump": 1000,
    "Triple Riding": 1200,
    "Drunk Driving": 10000,
    "Using Mobile while Driving": 2000,
  };

  useEffect(() => {
    // Auto-set standard fine based on violation selection
    if (standardFines[violationType]) {
      setFineAmount(standardFines[violationType]);
    }
  }, [violationType]);

  useEffect(() => {
    // Set current date time as default on load
    const now = new Date();
    // Adjust timezone
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setDateTime(localISOTime);
  }, []);

  // Real-time lookup of owner details on typing
  const handleVehicleLookup = async (vNum: string) => {
    const cleanNum = vNum.trim().toUpperCase();
    setVehicleNumber(cleanNum);

    if (cleanNum.length < 5) {
      setOwnerFound(null);
      setPreviousViolationsCount(0);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch(`/api/owners/${cleanNum}`);
      if (res.ok) {
        const data = await res.json();
        setOwnerName(data.ownerName);
        setPreviousViolationsCount(data.previousViolations);
        setOwnerFound(true);
      } else {
        setOwnerFound(false);
        setPreviousViolationsCount(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLookupLoading(false);
    }
  };

  // Image upload handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset images
  const presetImages = [
    { label: "Car Speeding", url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop" },
    { label: "Motorcycle Checkpoint", url: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=600&auto=format&fit=crop" },
    { label: "Red Light surveillance", url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=600&auto=format&fit=crop" },
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!vehicleNumber.trim()) errors.vehicleNumber = "Vehicle registration number is required";
    else if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(vehicleNumber.toUpperCase().replace(/\s+/g, ""))) {
      errors.vehicleNumber = "Format mismatch. Standard: AP16BZ1234";
    }

    if (!ownerName.trim()) errors.ownerName = "Owner name is required";
    if (!location.trim()) errors.location = "Precise violation location is required";
    if (!fineAmount || fineAmount <= 0) errors.fineAmount = "Fine amount must be a positive number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          ownerName: ownerName.trim(),
          violationType,
          fineAmount: Number(fineAmount),
          location: location.trim(),
          district,
          dateTime,
          status,
          description: description.trim() || `${violationType} reported at ${location}`,
          evidenceImage,
          officerId: currentUser?.id,
          officerName: currentUser?.name,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        // Clear Form
        setVehicleNumber("");
        setOwnerName("");
        setLocation("");
        setDescription("");
        setEvidenceImage("");
        setOwnerFound(null);
        setPreviousViolationsCount(0);
        setTimeout(() => {
          setSubmitSuccess(false);
          onSuccess(); // Redirect or refresh
        }, 2200);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit violation record");
      }
    } catch (err) {
      console.error(err);
      alert("Database transmission failed. Check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <FilePlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Register Traffic Violation</h1>
          <p className="text-xs text-slate-500">Log a new offense and upload evidence records</p>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center space-x-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">
            Violation logged successfully! Database updated. Redirecting...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Vehicle Number (with automatic lookup triggers) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Vehicle Plate Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Car className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. AP16BZ1234"
                  value={vehicleNumber}
                  onChange={(e) => handleVehicleLookup(e.target.value)}
                  maxLength={10}
                  className={`w-full pl-11 pr-10 py-2.5 rounded-lg border text-sm font-semibold text-slate-800 font-mono focus:outline-none focus:ring-2 ${
                    formErrors.vehicleNumber
                      ? "border-red-300 focus:ring-red-500/20"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {lookupLoading ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
              {formErrors.vehicleNumber && (
                <p className="text-[10px] text-red-500 font-medium">{formErrors.vehicleNumber}</p>
              )}

              {/* Real-time Owner Verification Card */}
              {ownerFound === true && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-start space-x-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-semibold">Registered Owner Detected</p>
                    <p className="text-slate-500">Auto-filled: {ownerName}</p>
                    {previousViolationsCount >= 2 && (
                      <div className="mt-1.5 flex items-center space-x-1.5 px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold uppercase text-[9px] tracking-wide animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Repeat Offender: {previousViolationsCount} active offenses</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {ownerFound === false && vehicleNumber.length >= 6 && (
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs">
                  <p className="text-amber-800 font-semibold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Unregistered Vehicle Owner</span>
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Will instantiate a new Vehicle Owner file upon saving.
                  </p>
                </div>
              )}
            </div>

            {/* Owner Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Vehicle Owner Name
              </label>
              <input
                type="text"
                placeholder="Full Registered Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                  formErrors.ownerName
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
              {formErrors.ownerName && (
                <p className="text-[10px] text-red-500 font-medium">{formErrors.ownerName}</p>
              )}
            </div>

            {/* Violation Category selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Violation Type
              </label>
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Over Speeding">Over Speeding</option>
                <option value="No Helmet">No Helmet</option>
                <option value="Red Light Jump">Red Light Jump</option>
                <option value="Triple Riding">Triple Riding</option>
                <option value="Drunk Driving">Drunk Driving</option>
                <option value="Using Mobile while Driving">Using Mobile while Driving</option>
              </select>
            </div>

            {/* Fine Amount */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Fine Amount (INR)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  placeholder="Standard Category Fine"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold font-mono"
                />
              </div>
              {formErrors.fineAmount && (
                <p className="text-[10px] text-red-500 font-medium">{formErrors.fineAmount}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Location of Offense
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Benz Circle, Highway 16"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full pl-11 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                    formErrors.location
                      ? "border-red-300 focus:ring-red-500/20"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
              </div>
              {formErrors.location && (
                <p className="text-[10px] text-red-500 font-medium">{formErrors.location}</p>
              )}
            </div>

            {/* District Sector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                District Sector (Andhra Pradesh)
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
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

            {/* Date Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Violation Date and Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Ticket Payment Status */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Initial Payment Status
              </label>
              <div className="flex space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "Pending"}
                    onChange={() => setStatus("Pending")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Unpaid (Pending Ticket)</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "Paid"}
                    onChange={() => setStatus("Paid")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Paid (On-Spot Settled)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Image Upload / Camera simulation */}
        <div className="space-y-2 border-t border-slate-100 pt-5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Evidence Photo Capture
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload form */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:bg-slate-50/50 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Camera className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-slate-600">
                Drag and drop or click to upload
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Supports JPG, PNG (Max 5MB)
              </span>
            </div>

            {/* Select standard presets / preview */}
            <div className="flex flex-col justify-between space-y-3">
              {evidenceImage ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-100 h-28 bg-slate-50 flex items-center justify-center">
                  <img
                    src={evidenceImage}
                    alt="Evidence Preview"
                    referrerPolicy="no-referrer"
                    className="h-full object-cover w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setEvidenceImage("")}
                    className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold shadow-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="h-28 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs text-center p-4">
                  No evidence file active. Choose preset image below or capture frame.
                </div>
              )}

              <div className="flex space-x-2">
                {presetImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEvidenceImage(img.url)}
                    className="flex-1 py-1 px-2 text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded hover:bg-slate-200"
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description / Officer remarks */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Violation Details & Remarks
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <textarea
              rows={3}
              placeholder="Record any additional contextual details (vehicle model, driver statement, weather parameters)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-11 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-slate-100 pt-5 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setVehicleNumber("");
              setOwnerName("");
              setLocation("");
              setDescription("");
              setEvidenceImage("");
            }}
            className="px-5 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 transition-colors"
          >
            Clear Fields
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm rounded-lg shadow-sm flex items-center space-x-2 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <FilePlus className="w-4 h-4" />
                <span>Save Violation Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
