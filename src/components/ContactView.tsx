import React, { useState } from "react";
import { Mail, Send, CheckCircle, Smartphone, MapPin } from "lucide-react";

export default function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Contact Highway Support</h1>
          <p className="text-xs text-slate-500">
            Submit critical bugs, service outages, or hardware support tickets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side: Contacts Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              Department Registry
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-700">HQ Office</strong>
                  <span>RTD Complex, Benz Circle,<br />Vijayawada, Andhra Pradesh - 520010</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Smartphone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-700">Enforcement Hotline</strong>
                  <span className="font-mono">+91 866 555-0199</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-700">Inquiries Email</strong>
                  <span className="font-mono">support@trafficguard.ap.gov.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-slate-800 text-sm">Submit System Ticket</h3>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center space-x-2 animate-bounce">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">
                  Ticket submitted! Technical team will resolve.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="Officer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. prasad@ap.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Problem Description / Support Request
              </label>
              <textarea
                rows={4}
                placeholder="Describe camera hardware failure, speed radar sync error, database latency issues, or login privilege adjustments..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "Transmitting..." : "Send Support Ticket"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
