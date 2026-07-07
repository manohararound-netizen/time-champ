import React from 'react';
import { X, Mail, Sparkles, Send, FileText, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailRecipient?: string;
  employeeName?: string;
}

export default function DailySummaryModal({
  isOpen,
  onClose,
  emailRecipient = 'manohar@around29.io',
  employeeName = 'Manohar Donakonda'
}: DailySummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="daily-summary-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-50 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ff981a] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Daily summary report</h3>
              <p className="text-[10px] text-slate-400 font-bold">Jul 6, 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Email Info banner matching Image 1 layout */}
          <div className="space-y-1.5 border-b pb-4 border-slate-200/60 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-400 w-16">To Email:</span>
              <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">{emailRecipient}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-400 w-16">Attachments:</span>
              <span className="text-slate-400 font-medium italic">No attachments are available here</span>
            </div>
          </div>

          {/* Report Paper Area styled cleanly */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
            
            {/* Greetings */}
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-800">Hi {employeeName},</h4>
              <p className="text-xs text-slate-400">Here is your summary report of <span className="font-bold text-slate-600">Jul 6, 2026</span>.</p>
            </div>

            {/* Metrics Circle styled identical to Image 1 layout */}
            <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6">
              
              {/* Total Time */}
              <div className="text-center space-y-1">
                <p className="text-[10px] text-[#00a3a4] font-black uppercase tracking-wider">Total Time</p>
                <h5 className="text-lg sm:text-2xl font-black text-[#00a3a4] font-mono">9h 27m</h5>
              </div>

              {/* Desk Time */}
              <div className="text-center space-y-1 border-x border-slate-100">
                <p className="text-[10px] text-[#4ea1ff] font-black uppercase tracking-wider">Desk Time</p>
                <h5 className="text-lg sm:text-2xl font-black text-[#4ea1ff] font-mono font-medium">7h 47m</h5>
              </div>

              {/* Idle Time */}
              <div className="text-center space-y-1">
                <p className="text-[10px] text-[#ff6a6a] font-black uppercase tracking-wider">Idle Time</p>
                <h5 className="text-lg sm:text-2xl font-black text-[#ff6a6a] font-mono">1h 38m</h5>
              </div>

            </div>

            {/* Second row of Metrics (Productive, Non-Productive, Neutral) */}
            <div className="grid grid-cols-3 gap-4 pb-4">
              
              <div className="text-center space-y-1">
                <p className="text-[10px] text-[#42b883] font-black uppercase tracking-wider">Productive Time</p>
                <h5 className="text-base sm:text-xl font-black text-[#42b883] font-mono">7h 47m</h5>
              </div>

              <div className="text-center space-y-1 border-x border-slate-100">
                <p className="text-[10px] text-[#ffb800] font-black uppercase tracking-wider">Non-Productive</p>
                <h5 className="text-base sm:text-xl font-black text-[#ffb800] font-mono">0h 0m</h5>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Neutral Time</p>
                <h5 className="text-base sm:text-xl font-black text-slate-400 font-mono">0h 0m</h5>
              </div>

            </div>

            {/* Most Used Applications list identical to Image 1 */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h5 className="text-xs font-extrabold text-[#00a3a4] uppercase tracking-wider">Most Used Applications & Websites</h5>
              
              <ul className="space-y-2.5 text-xs text-slate-600 pl-4 list-disc font-mono">
                <li className="marker:text-[#00a3a4]">
                  <span className="font-bold text-slate-800">app.connect29.com</span>
                </li>
                <li className="marker:text-[#00a3a4]">
                  <span className="font-bold text-slate-800">udemy.com</span>
                </li>
                <li className="marker:text-[#00a3a4]">
                  <span className="font-bold text-slate-800">youtube.com</span>
                </li>
                <li className="marker:text-[#00a3a4]">
                  <span className="font-bold text-slate-800">chrome.exe</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Modal Footer with Resend Action */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
          <p className="text-[10px] text-slate-400 font-semibold">Around29 Tracking Engine Server</p>
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 border rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                alert('Daily summary report email re-dispatched to ' + emailRecipient);
                onClose();
              }}
              className="bg-[#00a3a4] hover:bg-[#00898a] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resend</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
