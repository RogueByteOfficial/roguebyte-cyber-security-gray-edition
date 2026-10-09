import React from 'react';
import { Certificate } from '../../shared/types.ts';
import { Shield, Award, CheckCircle, X, Download, Printer } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-[#0a0d12] border-2 border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] p-8 sm:p-12 text-center text-zinc-100 overflow-hidden font-sans">
        
        {/* Background Watermark Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <Shield className="w-96 h-96 text-emerald-400" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Frame */}
        <div className="border border-emerald-500/30 p-6 sm:p-10 rounded-xl relative space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
              ROGUEBYTE CYBER LAB &bull; BLACK GRAY EDITION
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif uppercase">
              Certificate of Competency
            </h2>
          </div>

          <div className="text-xs text-zinc-400">
            This credential is officially conferred upon
          </div>

          {/* Student Name */}
          <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 border-b border-zinc-800 pb-4 max-w-md mx-auto">
            {certificate.username}
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
            Having demonstrated verified proficiency in isolated lab systems hardening, network traffic packet analysis, web vulnerability remediation, and SOC threat intelligence triage.
          </p>

          <div className="text-xs font-semibold text-amber-400 font-mono">
            {certificate.title}
          </div>

          {/* Verification Metadata & Signature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/80 text-left rtl:text-right text-xs">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Certificate Identifier</div>
              <div className="font-mono text-zinc-200 font-bold text-sm">{certificate.certificateNumber}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono mt-2">Issued Date</div>
              <div className="text-zinc-300 font-mono">{new Date(certificate.issuedAt).toLocaleDateString()}</div>
              <div className="text-[9px] text-zinc-500 font-mono mt-1 break-all">
                Hash: {certificate.verificationHash}
              </div>
            </div>

            <div className="sm:text-right rtl:sm:text-left flex flex-col justify-end">
              <div className="font-serif italic text-base text-emerald-400 font-bold">
                SidoDev-Dz
              </div>
              <div className="h-px bg-zinc-700 w-36 ml-auto rtl:ml-0 rtl:mr-auto my-1"></div>
              <div className="text-[11px] text-zinc-300 font-medium">{certificate.signature}</div>
              <div className="text-[10px] text-emerald-500/80 font-mono flex items-center sm:justify-end rtl:sm:justify-start space-x-1 rtl:space-x-reverse mt-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Cryptographically Validated</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-center space-x-3 rtl:space-x-reverse text-xs">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 flex items-center space-x-1.5 rtl:space-x-reverse transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Credential</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
