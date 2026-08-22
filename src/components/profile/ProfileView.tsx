import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Profile } from '../../types';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, users } = useApp();

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
  const [avatarSeed, setAvatarSeed] = useState(currentUser.profile.avatarUrl.split('seed=')[1] || 'Liam');

  // Corporate fields (Admin-only editable)
  const [employeeId, setEmployeeId] = useState(currentUser.employeeId);
  const [department, setDepartment] = useState(currentUser.profile.department);
  const [designation, setDesignation] = useState(currentUser.profile.designation);
  const [dateOfJoining, setDateOfJoining] = useState(currentUser.profile.dateOfJoining);

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
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
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
              <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-extrabold text-[10px]">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser.profile.designation} • {currentUser.profile.department}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {currentUser.employeeId}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {currentUser.isVerified ? (
            <span className="badge badge-present py-1 px-3 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
              <FileCheck className="w-3.5 h-3.5" /> Verified Profile
            </span>
          ) : (
            <span className="badge badge-pending py-1 px-3 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5" /> Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'personal'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Personal Information
        </button>
        <button
          onClick={() => setActiveTab('job')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'job'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Job Details
        </button>
        <button
          onClick={() => setActiveTab('salary')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'salary'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <IndianRupee className="w-4 h-4" /> Compensation
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'docs'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Documents ({currentUser.profile.documents.length})
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        {activeTab === 'personal' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Contact & Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAdminOrHR ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">First Name (Read-Only)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.profile.firstName}
                      className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Last Name (Read-Only)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.profile.lastName}
                      className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Contact className="w-3.5 h-3.5 text-slate-400" /> Emergency Contact
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Spouse Name (+1 555-000-0000)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Home Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, City, State, ZIP"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Professional Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="React, Next.js, Node.js, Project Management"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Press comma to separate skills tags</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avatar Character Seed</label>
                <input
                  type="text"
                  value={avatarSeed}
                  onChange={(e) => setAvatarSeed(e.target.value)}
                  placeholder="e.g. Liam, Elena, Jack"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Changes your DiceBear avatar layout dynamically</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'job' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Corporate Job Designation</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Managed by corporate G-Suite directory</p>
              </div>

              {isAdminOrHR ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Designation Title</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Joining</label>
                    <input
                      type="date"
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Employee ID (Read-Only)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.employeeId}
                      className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Department (Read-Only)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.profile.department}
                      className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Designation Title (Read-Only)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.profile.designation}
                      className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">Date of Joining (Read-Only)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.profile.dateOfJoining}
                      className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Salary & Direct Deposit Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Gross Monthly CTC (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${(
                    currentUser.salary.basicSalary +
                    currentUser.salary.hra +
                    currentUser.salary.allowances
                  ).toLocaleString('en-IN')}`}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Net Monthly Take-Home (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${currentUser.salary.netSalary.toLocaleString('en-IN')}`}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-emerald-600 font-black cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Bank & Branch (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.salary.bankName}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Bank Account / IFSC (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.salary.bankAccount} (${currentUser.salary.ifscCode || 'HDFC0000128'})`}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>
            
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-[10px] font-medium leading-relaxed">
              <strong>Note:</strong> Financial and statutory records are audited under EPFO & Income Tax guidelines. If you need to revise bank account details, submit an authorization request to Pooja Iyer (HR Operations).
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Verified Credentials & Files</h3>
              <button
                type="button"
                className="btn-secondary py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1"
                onClick={() => alert('Mock document upload triggered! File scanner active.')}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentUser.profile.documents.length === 0 ? (
                <div className="col-span-2 p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  No personnel documents uploaded yet.
                </div>
              ) : (
                currentUser.profile.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold font-mono text-[9px] flex-shrink-0">
                        {doc.type}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate text-xs">{doc.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">
                          Size: {doc.size} • Uploaded: {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-present text-[8px] py-0.5 px-2">Verified</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        {activeTab === 'personal' && (
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button type="submit" className="btn-primary py-2.5 px-6 text-xs font-bold">
              Save Profile Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
