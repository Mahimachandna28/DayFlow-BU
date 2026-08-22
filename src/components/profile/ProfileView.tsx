import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Lock,
  FileCheck,
  Award,
  Contact,
  IndianRupee,
  Upload,
  Download,
  Plus,
  Trash2,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Profile, DocumentItem } from '../../types';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, users, addToast } = useApp();

  const isAdminOrHR = currentUser.role === 'ADMIN' || currentUser.role === 'HR_OFFICER';

  // Tabs state
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'salary' | 'docs'>('personal');

  // Form edit states
  const [firstName, setFirstName] = useState(currentUser.profile.firstName);
  const [lastName, setLastName] = useState(currentUser.profile.lastName);
  const [phone, setPhone] = useState(currentUser.profile.phone || '');
  const [address, setAddress] = useState(currentUser.profile.address || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser.profile.emergencyContact || '');
  const [skillsStr, setSkillsStr] = useState(currentUser.profile.skills?.join(', ') || '');

  // Corporate fields (Admin-only editable)
  const [employeeId, setEmployeeId] = useState(currentUser.employeeId);
  const [department, setDepartment] = useState(currentUser.profile.department);
  const [designation, setDesignation] = useState(currentUser.profile.designation);
  const [dateOfJoining, setDateOfJoining] = useState(currentUser.profile.dateOfJoining);

  // New Document modal/state
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('PDF');

  // Sync state whenever currentUser switches
  useEffect(() => {
    setFirstName(currentUser.profile.firstName);
    setLastName(currentUser.profile.lastName);
    setPhone(currentUser.profile.phone || '');
    setAddress(currentUser.profile.address || '');
    setEmergencyContact(currentUser.profile.emergencyContact || '');
    setSkillsStr(currentUser.profile.skills?.join(', ') || '');
    setEmployeeId(currentUser.employeeId);
    setDepartment(currentUser.profile.department);
    setDesignation(currentUser.profile.designation);
    setDateOfJoining(currentUser.profile.dateOfJoining);
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updates: Partial<Profile> = {
      phone,
      address,
      emergencyContact,
      skills,
    };

    if (isAdminOrHR) {
      updates.firstName = firstName;
      updates.lastName = lastName;
      updates.employeeId = employeeId;
      updates.department = department;
      updates.designation = designation;
      updates.dateOfJoining = dateOfJoining;
    }

    updateProfile(currentUser.id, updates);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      addToast('Validation', 'Please enter a document title', 'error');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      type: newDocType,
      size: '1.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
    };

    const currentDocs = currentUser.profile.documents || [];
    updateProfile(currentUser.id, {
      documents: [newDoc, ...currentDocs],
    });

    setNewDocName('');
    addToast('Document Uploaded', `${newDoc.name} added to verified credentials vault.`, 'success');
  };

  const handleDeleteDoc = (docId: string) => {
    const updated = (currentUser.profile.documents || []).filter((d) => d.id !== docId);
    updateProfile(currentUser.id, { documents: updated });
    addToast('Document Removed', 'File deleted from vault.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Summary banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4.5 z-10">
          <img
            src={currentUser.profile.avatarUrl}
            alt={currentUser.profile.firstName}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                {currentUser.profile.firstName} {currentUser.profile.lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-extrabold text-[10px]">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser.profile.designation} • {currentUser.profile.department}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Employee ID: {currentUser.employeeId}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {currentUser.isVerified ? (
            <span className="badge badge-present py-1 px-3 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
              <FileCheck className="w-3.5 h-3.5" /> Verified Corporate Profile
            </span>
          ) : (
            <span className="badge badge-pending py-1 px-3 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5" /> Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Personal Information
        </button>
        <button
          onClick={() => setActiveTab('job')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'job'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Job Details
        </button>
        <button
          onClick={() => setActiveTab('salary')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'salary'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <IndianRupee className="w-4 h-4" /> Compensation & Statutory
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'docs'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Verified Documents ({currentUser.profile.documents?.length || 0})
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        {/* Tab 1: Personal Information */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Personal & Contact Profile</h3>
                <p className="text-slate-400 text-xs">Update your phone, permanent residential address, and emergency contact details</p>
              </div>
              <button
                type="submit"
                className="btn-primary text-xs py-2 px-5 bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  disabled={!isAdminOrHR}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    isAdminOrHR
                      ? 'border-slate-200 bg-white focus:ring-2 focus:ring-brand-500'
                      : 'border-slate-200 bg-slate-100/60 text-slate-500 cursor-not-allowed font-semibold'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  disabled={!isAdminOrHR}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    isAdminOrHR
                      ? 'border-slate-200 bg-white focus:ring-2 focus:ring-brand-500'
                      : 'border-slate-200 bg-slate-100/60 text-slate-500 cursor-not-allowed font-semibold'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-600" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Contact className="w-3.5 h-3.5 text-brand-600" /> Emergency Contact
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 98XXX XXXXX (Relation)"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> Residential Address (India)
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House No., Street, City, State, PIN"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-600" /> Skills & Domain Expertise (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="React, TypeScript, Cloud Architecture, Statutory Payroll, Design Systems"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Job Details */}
        {activeTab === 'job' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Employment & Organizational Assignment</h3>
                <p className="text-slate-400 text-xs">Job assignment parameters and corporate organizational placement</p>
              </div>
              {isAdminOrHR && (
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 bg-brand-600 hover:bg-brand-700 shadow-sm"
                >
                  Save Corporate Data
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Employee ID</label>
                <input
                  type="text"
                  disabled={!isAdminOrHR}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-100/60 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.email}
                  className="w-full p-2.5 bg-slate-100/60 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  disabled={!isAdminOrHR}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl font-bold ${
                    isAdminOrHR ? 'border-slate-200 bg-white' : 'bg-slate-100/60 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Designation</label>
                <input
                  type="text"
                  disabled={!isAdminOrHR}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl font-bold ${
                    isAdminOrHR ? 'border-slate-200 bg-white' : 'bg-slate-100/60 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" /> Date of Joining
                </label>
                <input
                  type="date"
                  disabled={!isAdminOrHR}
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl font-mono ${
                    isAdminOrHR ? 'border-slate-200 bg-white' : 'bg-slate-100/60 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate System Role</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.role}
                  className="w-full p-2.5 bg-slate-100/60 border border-slate-200 rounded-xl font-mono font-bold text-brand-700 cursor-not-allowed"
                />
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Salary & Statutory */}
        {activeTab === 'salary' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Monthly Compensation & Statutory Breakup</h3>
                <p className="text-slate-400 text-xs">EPF, Professional Tax, and Income Tax (TDS Section 192) details</p>
              </div>
              <span className="badge badge-present">Currency: INR (₹)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Gross Monthly Compensation (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${(
                    currentUser.salary.basicSalary +
                    currentUser.salary.hra +
                    currentUser.salary.allowances
                  ).toLocaleString('en-IN')}`}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Net Take-Home Disbursal (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${currentUser.salary.netSalary.toLocaleString('en-IN')}`}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-emerald-600 font-black cursor-not-allowed font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Disbursal Bank & Branch</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.salary.bankName}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Bank Account & IFSC</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.salary.bankAccount} (${currentUser.salary.ifscCode || 'HDFC0000128'})`}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-600 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.salary.panOrTaxId || 'AAAPM1234F'}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-600 font-mono cursor-not-allowed font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">EPFO Universal Account Number (UAN)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.salary.uanNumber || '100982341029'}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-600 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Statutory Lock Policy
              </p>
              <p className="text-[11px] leading-relaxed">
                Compensation scale revisions are governed by the HR Governance Committee. To request CTC restructuring or update Form 12BB tax regime preferences, contact your HR business partner.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Verified Documents Vault */}
        {activeTab === 'docs' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Verified Credentials & Documents Vault</h3>
                <p className="text-slate-400 text-xs">Official appointment letters, signed contracts, Form 16, and identity proofs</p>
              </div>
            </div>

            {/* Quick Upload Form */}
            <form onSubmit={handleAddDocument} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Document Title (e.g. Form16_FY2025_26, Aadhaar_Verified)"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="PDF">PDF Document</option>
                <option value="ID_CARD">Identity Proof</option>
                <option value="TAX_FORM">Tax Certificate</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add File
              </button>
            </form>

            {/* Documents List */}
            <div className="space-y-3">
              {(currentUser.profile.documents || []).length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No verified files in this profile vault yet.
                </div>
              ) : (
                (currentUser.profile.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{doc.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {doc.type} • {doc.size} • Uploaded {doc.uploadDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToast('Opening Document', `Accessing encrypted file ${doc.name}...`, 'info')}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {isAdminOrHR && (
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
