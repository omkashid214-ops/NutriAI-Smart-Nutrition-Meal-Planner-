import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  LogOut,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { UserProfile } from '../types/nutrition';
import { ProfileForm } from './ProfileForm';
import { FLUTTER_PROJECT_FILES } from '../data/flutterProjectExport';

interface SettingsViewProps {
  profile: UserProfile;
  isDemoMode: boolean;
  onSaveProfile: (updated: UserProfile) => Promise<void> | void;
  savingProfile: boolean;
  onLogout: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  isDemoMode,
  onSaveProfile,
  savingProfile,
  onLogout,
}) => {
  const [showFlutterExport, setShowFlutterExport] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const activeFile = FLUTTER_PROJECT_FILES[activeFileIndex] ?? FLUTTER_PROJECT_FILES[0];

  const handleCopyFile = async (path: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.split('/').pop() || 'file.dart';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14231A] tracking-tight">
            Settings &amp; Profile
          </h1>
          <p className="text-sm text-[#526458] mt-1">
            Update biometrics, dietary preferences, fitness goals, or export the Android Flutter
            source code.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#E2CBCB] bg-white text-[#991B1B] text-sm font-medium hover:bg-[#FEF2F2] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>{isDemoMode ? 'Exit Demo Mode' : 'Sign Out'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Editor */}
        <section className="lg:col-span-8 bg-white border border-[#E2E8DF] rounded-3xl p-6 sm:p-7">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-[#14231A]">
              Profile &amp; Nutrition Preferences
            </h2>
            <p className="text-xs text-[#526458] mt-1">
              Changes automatically recalculate your BMI, daily calorie budget, and personalized
              meal rankings.
            </p>
          </div>
          <ProfileForm
            initialProfile={profile}
            submitLabel="Update Profile & Preferences"
            onSave={onSaveProfile}
            saving={savingProfile}
          />
        </section>

        {/* Account & Flutter Android Project Card */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white border border-[#E2E8DF] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F4EC] text-[#1B6B40] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#14231A]">Account Storage</h2>
                <p className="text-xs text-[#526458]">
                  {isDemoMode ? 'Local Demo Mode (Device Storage)' : 'Firebase Auth & Cloud Firestore'}
                </p>
              </div>
            </div>
            <div className="text-xs text-[#526458] space-y-1.5 pt-3 border-t border-[#EDF2EB]">
              <p>
                Signed in as <span className="font-medium text-[#14231A]">{profile.email}</span>
              </p>
              <p>
                {isDemoMode
                  ? 'Sign out and continue with Google on the welcome screen to sync profiles and meal logs to Firebase Firestore.'
                  : 'Your profile and daily meal logs are secured in Firestore with owner-only security rules.'}
              </p>
            </div>
          </section>

          <section className="bg-white border border-[#E2E8DF] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14532D] text-white flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#14231A]">
                  Flutter Android Project
                </h2>
                <p className="text-xs text-[#526458]">
                  Complete Dart source code &amp; APK build guide
                </p>
              </div>
            </div>

            <p className="text-xs text-[#526458] leading-relaxed">
              Inspect, copy, or download all Flutter Material 3 Dart source files (
              <span className="font-mono">lib/main.dart</span>, models, services, screens,
              widgets, <span className="font-mono">pubspec.yaml</span>, and Android Studio APK
              instructions) generated in <span className="font-mono">flutter_nutriai/</span>.
            </p>

            <button
              type="button"
              onClick={() => setShowFlutterExport((prev) => !prev)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F2F7F2] text-[#14532D] text-sm font-medium hover:bg-[#1B6B40] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              <span>
                {showFlutterExport ? 'Hide Flutter Source Explorer' : 'Open Flutter Source Explorer'}
              </span>
            </button>
          </section>
        </div>
      </div>

      {/* Expandable Flutter Source & APK Build Guide Explorer */}
      {showFlutterExport && (
        <section className="bg-white border border-[#E2E8DF] rounded-3xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#E6ECE3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#14231A]">
                NutriAI Flutter / Dart Source Files ({FLUTTER_PROJECT_FILES.length} files)
              </h2>
              <p className="text-xs text-[#526458] mt-0.5">
                Ready for Android Studio · Material Design 3 · Firebase + Local Demo Mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyFile(activeFile.path, activeFile.content)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-[#D8E1D5] text-xs font-medium text-[#14231A] hover:bg-[#F2F7F2]"
              >
                {copiedPath === activeFile.path ? (
                  <Check className="w-3.5 h-3.5 text-[#1B6B40]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedPath === activeFile.path ? 'Copied' : 'Copy File'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFile(activeFile.path, activeFile.content)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1B6B40] text-white text-xs font-medium hover:bg-[#14532D]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* File Tree */}
            <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E6ECE3] bg-[#FAFBF9] p-3 max-h-80 lg:max-h-[540px] overflow-y-auto">
              <ul className="space-y-1">
                {FLUTTER_PROJECT_FILES.map((file, idx) => (
                  <li key={file.path}>
                    <button
                      type="button"
                      onClick={() => setActiveFileIndex(idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-colors ${
                        idx === activeFileIndex
                          ? 'bg-[#E6F4EC] text-[#14532D] font-semibold'
                          : 'text-[#374B3E] hover:bg-[#EEF3EC]'
                      }`}
                    >
                      {file.path}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Code Viewer */}
            <div className="lg:col-span-8 bg-[#121D16] text-[#E4F0E7] p-4 sm:p-5 max-h-[540px] overflow-auto">
              <div className="text-xs font-mono text-[#9CC2A8] mb-3 pb-2 border-b border-white/10">
                {activeFile.path}
              </div>
              <pre className="text-xs font-mono leading-relaxed whitespace-pre">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
