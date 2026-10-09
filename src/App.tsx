import React, { useState } from 'react';
import { AuthProvider, useAuth } from './client/context/AuthContext.tsx';
import { Navbar } from './client/components/Navbar.tsx';
import { LandingPage } from './client/components/LandingPage.tsx';
import { MissionCatalogue } from './client/components/MissionCatalogue.tsx';
import { MissionWorkspace } from './client/components/MissionWorkspace.tsx';
import { StudentDashboard } from './client/components/StudentDashboard.tsx';
import { InstructorDashboard } from './client/components/InstructorDashboard.tsx';
import { AdminDashboard } from './client/components/AdminDashboard.tsx';
import { Leaderboard } from './client/components/Leaderboard.tsx';
import { CertificateModal } from './client/components/CertificateModal.tsx';
import { PolicyModal } from './client/components/PolicyModal.tsx';
import { AuthModal } from './client/components/AuthModal.tsx';
import { Footer } from './client/components/Footer.tsx';
import { Certificate } from './shared/types.ts';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  const handleSelectMission = (missionId: string) => {
    setSelectedMissionId(missionId);
    setActiveTab('mission-workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'mission-workspace') setSelectedMissionId(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={handleOpenAuth}
        openPolicyModal={() => setPolicyModalOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            onStartTraining={() => {
              if (user) setActiveTab('dashboard');
              else setActiveTab('missions');
            }}
            onExploreMissions={() => setActiveTab('missions')}
            openPolicyModal={() => setPolicyModalOpen(true)}
          />
        )}

        {activeTab === 'missions' && (
          <MissionCatalogue onSelectMission={handleSelectMission} />
        )}

        {activeTab === 'mission-workspace' && selectedMissionId && (
          <MissionWorkspace
            missionId={selectedMissionId}
            onBack={() => {
              setSelectedMissionId(null);
              setActiveTab('missions');
            }}
            onComplete={() => {
              // Optionally trigger celebration or refresh
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard
            onSelectMission={handleSelectMission}
            onOpenCertificate={(cert) => setActiveCertificate(cert)}
          />
        )}

        {activeTab === 'instructor' && (
          <InstructorDashboard />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard />
        )}
      </main>

      <Footer openPolicyModal={() => setPolicyModalOpen(true)} />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <PolicyModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
      />

      <CertificateModal
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
