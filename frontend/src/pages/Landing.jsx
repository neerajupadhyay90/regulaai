import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Brain, Zap, FileText, CheckCircle, ArrowRight, Globe, Lock, Heart, Award, Flag } from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: 'Multi-step reasoning', desc: 'Not a simple chatbot. The agent plans, retrieves regulation clauses from Fabric, reasons clause-by-clause, and scores every gap.' },
  { icon: Zap, title: '60-second audits', desc: 'What takes a law firm 4 weeks and $50,000 takes RegulaAI under a minute — with full clause references and fine exposure estimates.' },
  { icon: FileText, title: 'Actionable reports', desc: 'Every finding comes with a specific remediation step, deadline, and regulatory article reference — ready to hand to your engineering or legal team.' },
  { icon: Globe, title: '5 frameworks', desc: 'GDPR, HIPAA, SOC 2 Type II, ISO 27001, and India\'s DPDP Act 2023 — with more coming.' },
];

const REGULATIONS = [
  { id: 'GDPR', icon: Globe, color: 'text-blue-600 bg-blue-50', region: 'European Union' },
  { id: 'HIPAA', icon: Heart, color: 'text-red-600 bg-red-50', region: 'United States' },
  { id: 'SOC 2', icon: Lock, color: 'text-purple-600 bg-purple-50', region: 'Global' },
  { id: 'ISO 27001', icon: Award, color: 'text-green-600 bg-green-50', region: 'Global' },
  { id: 'DPDP Act', icon: Flag, color: 'text-orange-600 bg-orange-50', region: 'India' },
];

const STEPS = [
  { step: '01', title: 'Upload your policy', desc: 'Drop a PDF, DOCX, or TXT — or just describe your setup in plain text.' },
  { step: '02', title: 'Agent reasons', desc: 'The 5-step pipeline: parse → retrieve clauses from Fabric → reason → score → report.' },
  { step: '03', title: 'Get your report', desc: 'Severity-scored findings, clause references, fine exposure estimates, and a prioritized action plan.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">RegulaAI</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full">
            Built for Microsoft Agents League 2026
          </span>
          <Link to="/app"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-1">
            Try it free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Brain size={12} /> Powered by Azure AI Foundry + Microsoft Fabric IQ
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Upload your policy.<br />
          <span className="text-indigo-600">Know your risk.</span><br />
          Fix it before the fine.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
          RegulaAI is an autonomous compliance reasoning agent that reads your policy documents
          and performs clause-by-clause analysis against GDPR, HIPAA, SOC 2, ISO 27001, and India's DPDP Act.
          In 60 seconds. For free.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/app"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 text-base">
            Analyze my compliance <ArrowRight size={16} />
          </Link>
          <a href="https://github.com/your-username/regulaai" target="_blank" rel="noopener"
            className="border border-gray-200 hover:border-gray-300 text-gray-700 font-medium px-6 py-3.5 rounded-xl transition-all text-base">
            View on GitHub
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          No signup required · No confidential data stored · Built for Agents League Hackathon 2026
        </p>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '$50,000', label: 'average law firm audit cost' },
            { value: '< 60s', label: 'RegulaAI analysis time' },
            { value: '5', label: 'regulatory frameworks covered' }
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How it works</h2>
        <p className="text-gray-500 text-center mb-12 text-sm">A 5-step reasoning pipeline — not a chatbot</p>
        <div className="grid grid-cols-3 gap-6">
          {STEPS.map(s => (
            <div key={s.step} className="bg-gray-50 rounded-2xl p-6">
              <div className="text-xs font-bold text-indigo-600 mb-3 tracking-widest">{s.step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Regulations */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Frameworks covered</h2>
          <p className="text-gray-500 text-center mb-10 text-sm">Analyze against the world's major data protection regulations</p>
          <div className="grid grid-cols-5 gap-4">
            {REGULATIONS.map(r => {
              const Icon = r.icon;
              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${r.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="font-semibold text-gray-800 text-sm">{r.id}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.region}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Why RegulaAI?</h2>
        <div className="grid grid-cols-2 gap-6">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to know your compliance risk?</h2>
        <p className="text-indigo-200 mb-8 text-base">Upload your policy document and get a full audit in under 60 seconds.</p>
        <Link to="/app"
          className="bg-white text-indigo-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-2">
          Start free audit <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <ShieldCheck size={13} className="text-white" />
          </div>
          <span className="font-semibold text-gray-700">RegulaAI</span>
        </div>
        <p className="text-xs text-gray-400">
          Built for Microsoft Agents League Hackathon 2026 · Reasoning Agents Track · Powered by Foundry IQ + Fabric IQ
        </p>
      </footer>
    </div>
  );
}
