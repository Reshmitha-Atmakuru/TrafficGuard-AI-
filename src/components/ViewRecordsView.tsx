import { useState, useEffect } from "react";
import { User, Violation } from "../types";
import {
  FileText,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Loader2,
  X,
  CreditCard,
  CheckCircle,
} from "lucide-react";

interface ViewRecordsViewProps {
  currentUser: User | null;
  violations: Violation[];
  fetchViolations: () => void;
  onNavigate: (page: any) => void;
  setSearchVehicleNumber: (vNum: string) => void;
}

export default function ViewRecordsView({
  currentUser,
  violations,
  fetchViolations,
  onNavigate,
  setSearchVehicleNumber,
}: ViewRecordsViewProps) {
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected violation details drawer
  const [selectedRecord, setSelectedRecord] = useState<Violation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<"Pending" | "Paid">("Pending");
  const [editFine, setEditFine] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchViolations();
  }, []);

  // Filter & Search application
  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType ? v.violationType === filterType : true;
    const matchesStatus = filterStatus ? v.status === filterStatus : true;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination calculation
  const totalItems = filteredViolations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredViolations.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Open details drawer
  const handleOpenDetails = (v: Violation) => {
    setSelectedRecord(v);
    setEditStatus(v.status);
    setEditFine(v.fineAmount);
    setEditDesc(v.description);
    setIsEditing(false);
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!selectedRecord) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/violations/${selectedRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          fineAmount: Number(editFine),
          description: editDesc,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedRecord(updated);
        setIsEditing(false);
        fetchViolations();
      } else {
        alert("Failed to update violation record");
      }
    } catch (e) {
      console.error(e);
      alert("Network exception updating record");
    } finally {
      setSavingEdit(false);
    }
  };

  // Quick mark paid
  const handleMarkPaid = async (v: Violation) => {
    try {
      const res = await fetch(`/api/violations/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid" }),
      });
      if (res.ok) {
        fetchViolations();
        if (selectedRecord && selectedRecord.id === v.id) {
          setSelectedRecord({ ...selectedRecord, status: "Paid" });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete violation (Admin only)
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this traffic violation ticket?")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/violations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSelectedRecord(null);
        fetchViolations();
      } else {
        alert("Failed to delete record");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  // Excel / PDF Export simulation
  const handleExport = (format: "Excel" | "PDF") => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredViolations, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `TrafficGuard_Violations_Export_${new Date().toISOString().slice(0, 10)}.${
        format === "Excel" ? "csv" : "pdf"
      }`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle viewing owner details
  const handleViewOwner = (vehicleNo: string) => {
    setSearchVehicleNumber(vehicleNo);
    onNavigate("owner-details");
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Violation Records Database</h1>
            <p className="text-xs text-slate-500">
              Browse, update, delete, and download regional enforcement logs
            </p>
          </div>
        </div>

        {/* Exports */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport("Excel")}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-red-600" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Board */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by vehicle plate number, owner, or location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/15"
          />
        </div>

        {/* Filter Violation Category */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white bg-white"
          >
            <option value="">All Violation Types</option>
            <option value="Over Speeding">Over Speeding</option>
            <option value="No Helmet">No Helmet</option>
            <option value="Red Light Jump">Red Light Jump</option>
            <option value="Triple Riding">Triple Riding</option>
            <option value="Drunk Driving">Drunk Driving</option>
            <option value="Using Mobile while Driving">Using Mobile while Driving</option>
          </select>
        </div>

        {/* Filter Ticket Status */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white bg-white"
          >
            <option value="">All Ticket Statuses</option>
            <option value="Pending">Pending (Unpaid)</option>
            <option value="Paid">Paid (Settled)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Table & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table View (Spans 2 cols if details active, otherwise 3) */}
        <div className={`${selectedRecord ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Plate Number</th>
                  <th className="py-3.5 px-4">Owner Name</th>
                  <th className="py-3.5 px-4">Violation</th>
                  <th className="py-3.5 px-4">Fine</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-mono">
                      No matching violation records found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((v) => (
                    <tr
                      key={v.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        selectedRecord?.id === v.id ? "bg-blue-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                        <button
                          onClick={() => handleViewOwner(v.vehicleNumber)}
                          className="hover:underline text-blue-600 focus:outline-none"
                        >
                          {v.vehicleNumber}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{v.ownerName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-700">{v.violationType}</span>
                          {v.repeatOffender && (
                            <span className="bg-red-50 text-red-600 text-[8px] font-extrabold uppercase px-1 py-0.5 rounded border border-red-100 animate-pulse">
                              Repeat
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                        ₹{v.fineAmount}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{v.location}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            v.status === "Paid"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenDetails(v)}
                          title="View Details"
                          className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition-colors border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {v.status === "Pending" && (
                          <button
                            onClick={() => handleMarkPaid(v)}
                            title="Mark Paid"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded border border-emerald-200 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {currentUser?.role === "admin" && (
                          <button
                            onClick={() => handleDeleteRecord(v.id)}
                            disabled={deletingId === v.id}
                            title="Delete Record"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded transition-colors border border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>
                Showing {indexOfFirstItem + 1} to{" "}
                {indexOfLastItem > totalItems ? totalItems : indexOfLastItem} of {totalItems} logs
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`px-2.5 py-1 rounded border ${
                      currentPage === idx + 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details and Editing Side-Drawer */}
        {selectedRecord && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4 relative animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Violation Case File</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Evidence Image */}
            <div className="relative rounded-lg overflow-hidden border border-slate-100 aspect-video bg-slate-900 flex items-center justify-center">
              {selectedRecord.evidenceImage ? (
                <img
                  src={selectedRecord.evidenceImage}
                  alt="Evidence"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-slate-400 font-mono text-xs">No Photo Uploaded</span>
              )}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white font-mono text-[9px] px-2 py-0.5 rounded backdrop-blur-sm">
                Case: {selectedRecord.id}
              </span>
            </div>

            {/* Dynamic View/Edit Content */}
            {!isEditing ? (
              <div className="space-y-3.5 text-xs">
                {/* Information Lines */}
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                      Vehicle Number
                    </span>
                    <button
                      onClick={() => handleViewOwner(selectedRecord.vehicleNumber)}
                      className="text-blue-600 font-bold block hover:underline font-mono"
                    >
                      {selectedRecord.vehicleNumber}
                    </button>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                      Owner Name
                    </span>
                    <span className="font-bold text-slate-700 block">
                      {selectedRecord.ownerName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                      Violation Type
                    </span>
                    <span className="font-bold text-slate-700 block">
                      {selectedRecord.violationType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                      Fine Imposed
                    </span>
                    <span className="font-bold text-slate-800 block">
                      ₹{selectedRecord.fineAmount}
                    </span>
                  </div>
                </div>

                <div className="pb-2.5 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] block">
                    Location & Time
                  </span>
                  <span className="font-semibold text-slate-600 block">
                    {selectedRecord.location}, {selectedRecord.district}
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono mt-0.5 block">
                    {selectedRecord.dateTime.replace("T", " ")}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] block">
                    Officer Remarks
                  </span>
                  <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-100 leading-normal mt-1">
                    "{selectedRecord.description}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400">
                    Logged by: <strong>{selectedRecord.officerName}</strong>
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      selectedRecord.status === "Paid"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>

                {/* Edit Controls */}
                <div className="flex space-x-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" />
                    <span>Edit Ticket</span>
                  </button>
                  {currentUser?.role === "admin" && (
                    <button
                      onClick={() => handleDeleteRecord(selectedRecord.id)}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Editing Screen */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Ticket Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "Pending" | "Paid")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="Pending">Pending (Unpaid)</option>
                    <option value="Paid">Paid (Cleared)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Fine Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={editFine}
                    onChange={(e) => setEditFine(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Amend Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  ></textarea>
                </div>

                {/* Edit Save/Cancel Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-1.5 bg-slate-100 text-slate-500 font-semibold text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={savingEdit}
                    className="flex-1 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-1"
                  >
                    {savingEdit ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
