import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Brain, Upload, FileText, X, AlertTriangle,
  AlertCircle, Info, CheckCircle, ChevronRight, Download,
  Loader2, ArrowRight, Building2, Lock, Heart, Flag, Award
} from 'lucide-react';
import FindingCard from '../components/FindingCard';
import ActionPlan from '../components/ActionPlan';
import ScoreMeter from '../components/ScoreMeter';
import StepIndicator from '../components/StepIndicator';

const REGULATIONS = [
  { id: 'GDPR', name: 'GDPR', desc: 'EU Data Protection', icon: ShieldCheck, color: 'blue' },
  { id: 'HIPAA', name: 'HIPAA', desc: 'US Health Data', icon: Heart, color: 'red' },
  { id: 'SOC2', name: 'SOC 2 Type II', desc: 'Security Controls', icon: Lock, color: 'purple' },
  { id: 'ISO27001', name: 'ISO 27001', desc: 'Info Security Mgmt', icon: Award, color: 'green' },
  { id: 'DPDP', name: 'DPDP Act 2023', desc: 'India Data Privacy', icon: Flag, color: 'orange' }
];

export default function App() {
  const [selectedReg, setSelectedReg] = useState('GDPR');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [contextText, setContextText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const steps = [
    'Parsing policy document',
    'Retrieving regulation clauses',
    'Reasoning compliance gaps',
    'Scoring findings',
    'Generating action plan'
  ];

  function handleFile(file) {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Unsupported file type. Please upload PDF, DOCX, or TXT.');
      return;
    }
    setUploadedFile(file);
    setError('');
  }

  async function runAnalysis() {
    if (!uploadedFile && !contextText.trim()) {
      setError('Please upload a document or describe your company setup.');
      return;
    }

    setIsAnalyzing(true);
    setReport(null);
    setError('');
    setCurrentStep(0);

    // Simulate step progression
    const stepTimer = setInterval(() => {
      setCurrentStep(s => s < steps.length - 1 ? s + 1 : s);
    }, 1200);

    try {
      const formData = new FormData();
      formData.append('regulation', selectedReg);
      if (uploadedFile) formData.append('document', uploadedFile);
      if (contextText) formData.append('companyContext', contextText);

      const { data } = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000
      });

      clearInterval(stepTimer);
      setCurrentStep(steps.length);
      setReport(data);
    } catch (err) {
      clearInterval(stepTimer);
      setError(err.response?.data?.message || err.message || 'Analysis failed. Please try again.');
    }

    setIsAnalyzing(false);
  }

  function exportReport() {
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulaai-${report.regulation}-${report.reportId?.slice(0, 8)}.json`;
    a.click();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">RegulaAI</span>
        <span className="text-xs bg-gray-800 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full">
          Reasoning Agent
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full">
            ⚡ Foundry IQ + Fabric IQ
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto scrollbar-thin">

          {/* Regulation selector */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Regulation Framework
            </p>
            <div className="flex flex-col gap-2">
              {REGULATIONS.map(reg => {
                const Icon = reg.icon;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedReg(reg.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedReg === reg.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={selectedReg === reg.id ? 'text-indigo-600' : 'text-gray-400'} />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{reg.name}</div>
                      <div className="text-xs text-gray-400">{reg.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* File upload */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Policy Document
            </p>
            {!uploadedFile ? (
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Drop your policy doc here</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT</p>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                <FileText size={18} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Context text */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Or Describe Your Setup
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-indigo-400 min-h-[100px]"
              placeholder="e.g. We store user emails and purchase history in AWS S3. We use third-party analytics tools. Our users are EU-based. We have no DPO appointed..."
              value={contextText}
              onChange={e => setContextText(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-all"
          >
            {isAnalyzing ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Brain size={16} /> Analyze Compliance</>
            )}
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">

          {/* Loading state */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center min-h-96 gap-6">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-base font-medium text-gray-700 mb-4">
                  Running compliance reasoning pipeline...
                </p>
                <StepIndicator steps={steps} currentStep={currentStep} />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isAnalyzing && !report && (
            <div className="flex flex-col items-center justify-center min-h-96 text-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={32} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to audit your compliance</h2>
                <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                  Select a regulation framework, upload your policy document or describe your setup,
                  then click Analyze to get a step-by-step compliance gap report powered by Azure AI Foundry.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                {['Multi-step reasoning', 'Clause-by-clause analysis', 'Severity scoring'].map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Report */}
          {!isAnalyzing && report && (
            <div className="max-w-4xl flex flex-col gap-6">

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{report.regulation} Compliance Report</p>
                  <h1 className="text-2xl font-semibold text-gray-900">Compliance Gap Analysis</h1>
                  <p className="text-sm text-gray-500 mt-2 max-w-xl leading-relaxed">{report.summary}</p>
                </div>
                <div className="flex-shrink-0">
                  <ScoreMeter score={report.overallScore} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Critical', value: report.stats?.critical || 0, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                  { label: 'High Risk', value: report.stats?.high || 0, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
                  { label: 'Medium Risk', value: report.stats?.medium || 0, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
                  { label: 'Passed', value: report.stats?.passed || 0, color: 'text-green-600', bg: 'bg-green-50 border-green-100' }
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Findings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-indigo-600" />
                  <h2 className="text-base font-semibold text-gray-800">Compliance Findings</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {report.findings?.length || 0} gaps identified
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {(report.findings || []).map((f, i) => (
                    <FindingCard key={i} finding={f} />
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight size={18} className="text-indigo-600" />
                  <h2 className="text-base font-semibold text-gray-800">Prioritized Action Plan</h2>
                </div>
                <ActionPlan items={report.actionPlan || []} />
              </div>

              {/* Export */}
              <div className="flex gap-3">
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
                >
                  <Download size={15} className="text-indigo-600" /> Export JSON Report
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
                >
                  <FileText size={15} className="text-indigo-600" /> Print Report
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
