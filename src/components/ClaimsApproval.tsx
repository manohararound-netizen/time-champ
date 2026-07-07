import React, { useState } from 'react';
import { TimeClaim, Employee, Project } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  MessageSquare,
  AlertCircle,
  FileCheck,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClaimsApprovalProps {
  claims: TimeClaim[];
  employees: Employee[];
  projects: Project[];
  onApproveClaim: (claimId: string) => void;
  onRejectClaim: (claimId: string, reason: string) => void;
}

export default function ClaimsApproval({
  claims,
  employees,
  projects,
  onApproveClaim,
  onRejectClaim,
}: ClaimsApprovalProps) {
  // Modal / local status to reject a claim with reason
  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const pendingClaims = claims.filter(c => c.status === 'Pending');
  const processedClaims = claims.filter(c => c.status !== 'Pending');

  // Stats calculation
  const totalHoursClaimed = claims.reduce((sum, c) => sum + c.hours, 0);
  const approvedHours = claims.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.hours, 0);
  const pendingCount = pendingClaims.length;

  const handleRejectSubmit = (e: React.FormEvent, claimId: string) => {
    e.preventDefault();
    setErrorMsg('');
    if (!rejectionNote.trim()) {
      setErrorMsg('Please enter a short reason for rejecting this claim.');
      return;
    }
    onRejectClaim(claimId, rejectionNote.trim());
    setRejectingClaimId(null);
    setRejectionNote('');
  };

  const getEmployeeAvatar = (empName: string) => {
    const emp = employees.find(e => e.name === empName);
    return emp?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80';
  };

  return (
    <div className="space-y-6" id="claims-approval-container">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-display">Hour Claim Authorizations</h3>
          <p className="text-xs text-slate-400">Review, validate, and authorize timesheet adjustment claims filed by employees</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700">
          <ShieldCheck className="w-4 h-4" />
          <span>Manager Authorization Panel</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="claims-stats">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Requests</span>
            <span className="text-xl font-bold font-mono text-slate-800">{pendingCount} claims</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Approved Claim Hours</span>
            <span className="text-xl font-bold font-mono text-slate-800">{approvedHours.toFixed(1)}h</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 border border-slate-150 text-slate-600 rounded-lg flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Claims Filed</span>
            <span className="text-xl font-bold font-mono text-slate-800">{claims.length} claims</span>
          </div>
        </div>
      </div>

      {/* PENDING CLAIMS CARD */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-50 pb-2">
          <Clock className="w-4 h-4 text-amber-500" /> Pending Approval Pool ({pendingClaims.length})
        </h4>

        {pendingClaims.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200" id="empty-pending-claims">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h5 className="text-sm font-bold text-slate-800">No claims awaiting approval</h5>
            <p className="text-xs text-slate-400 mt-1">Excellent! All employee hours are certified and processed.</p>
          </div>
        ) : (
          <div className="space-y-4" id="pending-claims-list">
            <AnimatePresence>
              {pendingClaims.map(c => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs space-y-3 relative"
                  id={`pending-claim-card-${c.id}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getEmployeeAvatar(c.employeeName)} 
                        alt={c.employeeName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{c.employeeName}</h5>
                        <p className="text-[11px] text-indigo-600 font-semibold">
                          Task Activity: <span className="text-slate-700">{c.taskName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block">Date of Work</span>
                        <span className="text-xs font-semibold text-slate-700">{c.date}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-lg text-center">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Hours</span>
                        <span className="text-sm font-extrabold text-slate-800">{c.hours.toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600 italic">
                    "{c.reason}"
                  </div>

                  {/* Reject Box Form Toggle */}
                  {rejectingClaimId === c.id ? (
                    <form onSubmit={(e) => handleRejectSubmit(e, c.id)} className="bg-red-50/50 border border-red-150 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Specify Rejection Justification</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Please provide a more detailed breakdown, hours seem excessive, etc..."
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:border-red-500"
                        id="rejection-note-input"
                      />
                      {errorMsg && <p className="text-[10px] text-red-600 font-bold">{errorMsg}</p>}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
                          id="submit-rejection-btn"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRejectingClaimId(null); setRejectionNote(''); setErrorMsg(''); }}
                          className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Default Actions Row */
                    <div className="flex gap-2.5 pt-2 border-t border-slate-100 justify-end">
                      <button
                        onClick={() => onApproveClaim(c.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-4 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        id={`approve-btn-${c.id}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve Claim
                      </button>
                      <button
                        onClick={() => { setRejectingClaimId(c.id); setRejectionNote(''); setErrorMsg(''); }}
                        className="border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50/50 font-semibold py-1.5 px-4 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                        id={`reject-btn-${c.id}`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Claim
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* COMPLETED CLAIMS CARD (AUDIT TRAIL) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-50 pb-2">
          <FileCheck className="w-4 h-4 text-slate-400" /> Completed Claims Log & Audit ({processedClaims.length})
        </h4>

        {processedClaims.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">
            No completed hour adjustment claims in historic logs.
          </p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1" id="processed-claims-list">
            {processedClaims.map(c => (
              <div key={c.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-slate-100 p-3.5 rounded-lg bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <img 
                    src={getEmployeeAvatar(c.employeeName)} 
                    alt={c.employeeName}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{c.employeeName}</h5>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {c.date} • Task: {c.taskName}
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">"{c.reason}"</p>
                    {c.rejectionReason && (
                      <p className="text-[10px] text-red-600 font-semibold mt-1">
                        Reason Rejected: {c.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {c.hours.toFixed(1)} hrs
                  </span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    c.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {c.status === 'Approved' ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
