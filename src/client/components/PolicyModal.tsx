import React from 'react';
import { Shield, CheckCircle, X, Lock, AlertTriangle } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-[#0a0d12] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-zinc-200 space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 rtl:space-x-reverse border-b border-zinc-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Acceptable Use & Ethical Hacking Agreement</h2>
            <div className="text-xs text-zinc-500 font-mono">RogueByte Cyber Lab &bull; SidoDev-Dz</div>
          </div>
        </div>

        <div className="space-y-4 text-xs text-zinc-400 leading-relaxed max-h-96 overflow-y-auto pr-2">
          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-amber-300 flex items-start space-x-2 rtl:space-x-reverse">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Strict Educational Purpose:</strong> All offensive techniques, exploit demonstrations, packet inspection, and permission alterations are restricted exclusively to designated isolated lab containers within this environment.
            </div>
          </div>

          <h3 className="text-zinc-200 font-bold text-sm">1. Non-Malicious Conduct</h3>
          <p>
            Users are explicitly prohibited from targeting, probing, or attacking external networks, cloud metadata services (e.g. 169.254.169.254), or non-consenting systems. All training exercises are self-contained within approved virtual environments.
          </p>

          <h3 className="text-zinc-200 font-bold text-sm">2. Data Privacy & Audit Telemetry</h3>
          <p>
            Platform commands, authentication attempts, and grading verifications are recorded in the security audit event log to ensure educational accountability, integrity of awards, and container stability.
          </p>

          <h3 className="text-zinc-200 font-bold text-sm">3. Attribution and Responsible Disclosure</h3>
          <p>
            RogueByte Cyber Lab is developed by <strong>SidoDev-Dz</strong>. Any newly discovered software vulnerabilities in the platform infrastructure should be reported directly to the official project repository or contact channels.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition"
          >
            I Acknowledge & Agree
          </button>
        </div>

      </div>
    </div>
  );
};
