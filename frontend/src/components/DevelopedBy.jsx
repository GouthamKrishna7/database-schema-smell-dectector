import React, { useState } from 'react';
import {
  User,
  Users,
  Award,
  GraduationCap,
  Camera,
} from 'lucide-react';

export default function DevelopedBy() {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Gouthamkrishna S V',
      regNo: '25BCE5410',
      photo: null,
    },
    {
      id: 2,
      name: 'Ananya Krishna',
      regNo: '25BCE5333',
      photo: null,
    },
    {
      id: 3,
      name: 'Sneha Sahu',
      regNo: '25BCE5319',
      photo: null,
    },
  ]);

  const handlePhotoUpload = (e, id) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, photo: dataUrl } : m))
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">
          <Users className="w-4 h-4" />
          <span>Section B • Project Credentials</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Project Developers & Mentorship
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Developed as part of the Database Management Systems (DBMS) Laboratory Curriculum.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Team Members (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-teal-500" />
              Student Team Details ({teamMembers.length})
            </h2>
          </div>

          {/* Members Cards */}
          <div className="space-y-3.5">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Photo / Avatar with upload option */}
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-md">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{member.name.charAt(0)}</span>
                      )}
                    </div>
                    {/* Optional Photo Upload Trigger */}
                    <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[9px]">
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, member.id)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Student Details */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </h3>

                    <div className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      <p>
                        Register No:{' '}
                        <strong className="text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {member.regNo}
                        </strong>
                      </p>
                      <p className="text-[11px] text-slate-500 font-sans pt-0.5">
                        School of Computer Science and Engineering
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Guided By Faculty Section (1 Column) */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Faculty Mentorship
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/40 rounded-2xl p-6 shadow-md relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-4">
              <GraduationCap className="w-4 h-4" />
              <span>Project Supervisor</span>
            </div>

            {/* Guide Avatar & Details */}
            <div className="flex flex-col items-center text-center space-y-3 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-teal-500/20">
                <GraduationCap className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
                  Guided By
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Dr. Swaminathan A
                </h3>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                  Assistant Professor
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  School of Computer Science and Engineering
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Course: <strong className="text-slate-700 dark:text-slate-200">Database Management Systems</strong> (DBMS)
              <br />
              Academic Year 2026–27
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}