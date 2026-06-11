import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FindingCard from '../components/FindingCard';
import ActionPlan from '../components/ActionPlan';
import ScoreMeter from '../components/ScoreMeter';

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/reports/${id}`)
      .then(r => setReport(r.data))
      .catch(e => setError(e.response?.data?.error || 'Report not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-gray-500">{error}</p>
      <Link to="/" className="text-indigo-600 text-sm hover:underline">← Back to home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={14} /> Back
      </Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">{report.regulation} · {new Date(report.generatedAt).toLocaleDateString()}</p>
          <h1 className="text-2xl font-semibold text-gray-900">Compliance Report</h1>
          <p className="text-sm text-gray-500 mt-1">{report.summary}</p>
        </div>
        <ScoreMeter score={report.overallScore} />
      </div>
      <div className="flex flex-col gap-4">
        {(report.findings || []).map((f, i) => <FindingCard key={i} finding={f} />)}
      </div>
      <div className="mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Action Plan</h2>
        <ActionPlan items={report.actionPlan || []} />
      </div>
    </div>
  );
}
