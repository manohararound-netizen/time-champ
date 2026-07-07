import React, { useState } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { UserPlus, Sparkles, DollarSign, Briefcase, Mail, Trash2, Sliders, CheckCircle2, Upload, Link, Image as ImageIcon, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120',
];

interface EmployeeRosterProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id' | 'totalHoursTracked'>) => void;
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeeRoster({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeeRosterProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [hourlyRate, setHourlyRate] = useState('80');
  const [productivityScore, setProductivityScore] = useState(85);
  const [status, setStatus] = useState<EmployeeStatus>('Active');

  // Avatar selector states for new employee
  const [avatarSourceType, setAvatarSourceType] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // States for updating an existing employee's image
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [editSourceType, setEditSourceType] = useState<'preset' | 'upload' | 'url'>('preset');
  const [editSelectedPreset, setEditSelectedPreset] = useState(PRESET_AVATARS[0]);
  const [editCustomUrl, setEditCustomUrl] = useState('');
  const [editUploadedBase64, setEditUploadedBase64] = useState('');
  const [editDragActive, setEditDragActive] = useState(false);

  const [activeSandboxId, setActiveSandboxId] = useState<string | null>(null);

  const handleFileChange = (file: File, isEdit: boolean = false) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (png, jpeg, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      if (isEdit) {
        setEditUploadedBase64(resultStr);
      } else {
        setUploadedBase64(resultStr);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent, isEdit: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (isEdit) setEditDragActive(true);
      else setDragActive(true);
    } else if (e.type === "dragleave") {
      if (isEdit) setEditDragActive(false);
      else setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, isEdit: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      setEditDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files[0], true);
      }
    } else {
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files[0], false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    let avatarUrl = PRESET_AVATARS[0];
    if (avatarSourceType === 'preset') {
      avatarUrl = selectedPreset;
    } else if (avatarSourceType === 'url') {
      avatarUrl = customAvatarUrl.trim() || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=120&h=120`;
    } else if (avatarSourceType === 'upload') {
      avatarUrl = uploadedBase64 || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=120&h=120`;
    }

    onAddEmployee({
      name,
      email,
      role,
      hourlyRate: parseFloat(hourlyRate) || 80,
      productivityScore: productivityScore,
      status: status,
      avatar: avatarUrl,
    });

    // Reset Form
    setName('');
    setEmail('');
    setRole('');
    setHourlyRate('80');
    setProductivityScore(85);
    setStatus('Active');
    setCustomAvatarUrl('');
    setUploadedBase64('');
    setShowAddForm(false);
  };

  const getStatusBadge = (empStatus: EmployeeStatus) => {
    switch (empStatus) {
      case 'Active':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active</span>;
      case 'Idle':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Idle</span>;
      case 'Break':
        return <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> On Break</span>;
      case 'Meeting':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> In Meeting</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50/50 border-emerald-100';
    if (score >= 75) return 'text-amber-600 bg-amber-50/50 border-amber-100';
    return 'text-red-600 bg-red-50/50 border-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-display">Employee Productivity Roster</h3>
          <p className="text-xs text-slate-400">Live directory with high-contrast performance gauges and sandbox simulators</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-xs text-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
          id="toggle-add-emp-btn"
        >
          <UserPlus className="w-4 h-4" /> {showAddForm ? 'Close panel' : 'Onboard Employee'}
        </button>
      </div>

      {/* Onboard Employee Slide Panel */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white border border-slate-100 rounded-xl p-6 shadow-sm"
            id="add-employee-panel"
          >
            <h4 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-indigo-500" /> New Employee Credentials
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. liam@timechamp.io"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job Role / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Backend Architect"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Productivity Score ({productivityScore}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={productivityScore}
                    onChange={(e) => setProductivityScore(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer mt-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Default Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Idle">Idle</option>
                    <option value="Break">Break</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
              </div>

              {/* Profile Photo Upload and Selection Section */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150 space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Employee Profile Photo
                </label>
                
                {/* Source Selection Tabs */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setAvatarSourceType('preset')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                      avatarSourceType === 'preset'
                        ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs font-bold'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Preset Avatars
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarSourceType('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                      avatarSourceType === 'upload'
                        ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs font-bold'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarSourceType('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                      avatarSourceType === 'url'
                        ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs font-bold'
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" /> Web Image URL
                  </button>
                </div>

                {/* Tab Contents */}
                {avatarSourceType === 'preset' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">Select a modern, high-quality professional profile preset:</p>
                    <div className="flex flex-wrap gap-2.5">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPreset(url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer hover:scale-105 ${
                            selectedPreset === url ? 'border-indigo-600 shadow-xs scale-105' : 'border-transparent'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx + 1}`} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          {selectedPreset === url && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {avatarSourceType === 'upload' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-3">
                      <div
                        onDragEnter={(e) => handleDrag(e, false)}
                        onDragLeave={(e) => handleDrag(e, false)}
                        onDragOver={(e) => handleDrag(e, false)}
                        onDrop={(e) => handleDrop(e, false)}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? 'border-indigo-500 bg-indigo-50/40' 
                            : 'border-slate-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <input
                          id="file-upload-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileChange(e.target.files[0], false);
                            }
                          }}
                        />
                        <label htmlFor="file-upload-input" className="cursor-pointer space-y-1 block">
                          <Upload className="w-5 h-5 text-indigo-500 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">Drag & drop photo here, or <span className="text-indigo-600 hover:underline">browse files</span></p>
                          <p className="text-[10px] text-slate-400 font-mono">Supports PNG, JPG, or WEBP</p>
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-150 h-full min-h-[84px]">
                      {uploadedBase64 ? (
                        <div className="relative">
                          <img src={uploadedBase64} alt="Uploaded preview" className="w-12 h-12 rounded-xl object-cover border" />
                          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" title="Image loaded successfully">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        </div>
                      ) : (
                        <div className="text-center text-slate-300">
                          <Camera className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-[9px] font-semibold text-slate-400">No photo selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {avatarSourceType === 'url' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <div className="md:col-span-3">
                      <input
                        type="url"
                        placeholder="Paste web image link, e.g., https://images.unsplash.com/..."
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex items-center justify-center p-1 bg-white rounded-xl border border-slate-150 h-10">
                      {customAvatarUrl.trim() ? (
                        <img 
                          src={customAvatarUrl} 
                          alt="URL Preview" 
                          className="w-8 h-8 rounded-lg object-cover border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80';
                          }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No URL</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-xs text-sm transition-all cursor-pointer w-full md:w-auto"
                >
                  Add Employee to Directory
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="roster-grid">
        {employees.map(emp => (
          <div 
            key={emp.id} 
            className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between"
            id={`emp-card-${emp.id}`}
          >
            <div className="flex justify-between items-start">
              {/* Profile Bio */}
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <img 
                    src={emp.avatar} 
                    alt={emp.name} 
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  {/* Hover edit overlay */}
                  <button
                    onClick={() => {
                      if (editingAvatarId === emp.id) {
                        setEditingAvatarId(null);
                      } else {
                        setEditingAvatarId(emp.id);
                        setEditSelectedPreset(emp.avatar);
                        setEditUploadedBase64('');
                        setEditCustomUrl('');
                      }
                    }}
                    className="absolute inset-0 bg-indigo-900/60 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[10px] font-bold"
                    title="Change employee image"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Edit</span>
                  </button>
                  {/* Status dot in image */}
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    emp.status === 'Active' ? 'bg-emerald-500' :
                    emp.status === 'Idle' ? 'bg-amber-500' :
                    emp.status === 'Break' ? 'bg-red-500' : 'bg-indigo-500'
                  }`} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
                    {emp.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-400" /> {emp.role}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Mail className="w-3 h-3" /> {emp.email}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(emp.status)}
              </div>
            </div>

            {/* Inline Avatar Edit Panel */}
            <AnimatePresence>
              {editingAvatarId === emp.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3 p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-3"
                  id={`avatar-edit-panel-${emp.id}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Update Profile Image
                    </span>
                    <button
                      onClick={() => setEditingAvatarId(null)}
                      className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {/* Sources tabs */}
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setEditSourceType('preset')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                        editSourceType === 'preset'
                          ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs font-bold'
                          : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSourceType('upload')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                        editSourceType === 'upload'
                          ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs font-bold'
                          : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSourceType('url')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                        editSourceType === 'url'
                          ? 'bg-white border-indigo-200 text-indigo-700 shadow-xs font-bold'
                          : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>

                  {/* Presets Tab */}
                  {editSourceType === 'preset' && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400">Select an instant profile preset:</p>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_AVATARS.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setEditSelectedPreset(url);
                              onUpdateEmployee(emp.id, { avatar: url });
                            }}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all p-0.5 cursor-pointer hover:scale-105 ${
                              emp.avatar === url ? 'border-indigo-600 shadow-xs scale-105' : 'border-transparent'
                            }`}
                          >
                            <img src={url} alt={`Preset ${idx + 1}`} className="w-8 h-8 rounded-md object-cover" referrerPolicy="no-referrer" />
                            {emp.avatar === url && (
                              <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white drop-shadow-md stroke-[3]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Tab */}
                  {editSourceType === 'upload' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <div
                          onDragEnter={(e) => handleDrag(e, true)}
                          onDragLeave={(e) => handleDrag(e, true)}
                          onDragOver={(e) => handleDrag(e, true)}
                          onDrop={(e) => handleDrop(e, true)}
                          className={`border border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-all ${
                            editDragActive 
                              ? 'border-indigo-500 bg-indigo-50/40' 
                              : 'border-slate-200 bg-white hover:border-indigo-300'
                          }`}
                        >
                          <input
                            id={`edit-file-input-${emp.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileChange(e.target.files[0], true);
                              }
                            }}
                          />
                          <label htmlFor={`edit-file-input-${emp.id}`} className="cursor-pointer space-y-0.5 block">
                            <Upload className="w-4 h-4 text-indigo-500 mx-auto" />
                            <p className="text-[10px] font-semibold text-slate-700">Drop photo or <span className="text-indigo-600 hover:underline">browse</span></p>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-xl border border-slate-150 min-h-[56px]">
                        {editUploadedBase64 ? (
                          <div className="text-center space-y-1">
                            <img src={editUploadedBase64} alt="Uploaded" className="w-8 h-8 rounded-lg object-cover border mx-auto" />
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateEmployee(emp.id, { avatar: editUploadedBase64 });
                                setEditUploadedBase64('');
                                setEditingAvatarId(null);
                              }}
                              className="bg-indigo-600 text-[9px] font-bold text-white px-2 py-0.5 rounded-md hover:bg-indigo-700 cursor-pointer"
                            >
                              Save Photo
                            </button>
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-400 font-semibold uppercase text-center">No upload yet</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Web URL Tab */}
                  {editSourceType === 'url' && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="Paste web image link..."
                        value={editCustomUrl}
                        onChange={(e) => setEditCustomUrl(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editCustomUrl.trim()) {
                            onUpdateEmployee(emp.id, { avatar: editCustomUrl.trim() });
                            setEditCustomUrl('');
                            setEditingAvatarId(null);
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated Live Task banner if Active */}
            {emp.status === 'Active' && emp.activeProjectName && (
              <div className="mt-4 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/50 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">Working on:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{emp.activeProjectName} &rsaquo; {emp.activeTaskName}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              </div>
            )}

            {/* Stats section */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${getScoreColor(emp.productivityScore)} text-center`}>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider scale-90">Score</p>
                  <p className="text-xl font-black mt-0.5 font-display">{emp.productivityScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Productivity</p>
                  <div className="w-24 bg-slate-150 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full ${
                        emp.productivityScore >= 90 ? 'bg-emerald-500' :
                        emp.productivityScore >= 75 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${emp.productivityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Tracked Hours</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5 font-mono">{emp.totalHoursTracked.toFixed(1)} hrs</p>
                <p className="text-[10px] text-slate-400">Lifetime logged hours</p>
              </div>
            </div>

            {/* Sandbox details toggle */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => setActiveSandboxId(activeSandboxId === emp.id ? null : emp.id)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                id={`sandbox-toggle-${emp.id}`}
              >
                <Sliders className="w-3.5 h-3.5" /> 
                {activeSandboxId === emp.id ? 'Hide Sandbox Simulator' : 'Simulate Status & Productivity'}
              </button>

              {/* Delete employee */}
              <button
                onClick={() => onDeleteEmployee(emp.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                title="Delete Employee"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expanded Simulator Controls */}
            <AnimatePresence>
              {activeSandboxId === emp.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-3"
                  id={`sandbox-controls-${emp.id}`}
                >
                  <p className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> State Sandbox (Simulating live inputs)
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Status Simulator */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Live Status</label>
                      <select
                        value={emp.status}
                        onChange={(e) => onUpdateEmployee(emp.id, { status: e.target.value as EmployeeStatus })}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-800 focus:outline-hidden"
                      >
                        <option value="Active">Active</option>
                        <option value="Idle">Idle</option>
                        <option value="Break">Break</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>

                    {/* Productivity Score Simulator */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-semibold text-slate-500">Live Score</label>
                        <span className="text-[10px] font-mono text-indigo-700 font-bold">{emp.productivityScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={emp.productivityScore}
                        onChange={(e) => onUpdateEmployee(emp.id, { productivityScore: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {emp.status === 'Active' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Simulated Project</label>
                        <input
                          type="text"
                          value={emp.activeProjectName || ''}
                          onChange={(e) => onUpdateEmployee(emp.id, { activeProjectName: e.target.value })}
                          placeholder="Project name"
                          className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Simulated Task</label>
                        <input
                          type="text"
                          value={emp.activeTaskName || ''}
                          onChange={(e) => onUpdateEmployee(emp.id, { activeTaskName: e.target.value })}
                          placeholder="Task name"
                          className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-[9px] text-indigo-500 italic flex items-center gap-1 font-mono pt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Changes apply to real-time analytics instantly.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
