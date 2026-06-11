import React from 'react';

export default function ScoreMeter({ score }) {
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#dc2626';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'At Risk' : 'Critical';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center min-w-32">
      <div className="text-4xl font-bold" style={{ color }}>{score}</div>
      <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">/ 100</div>
      <div className="text-xs font-semibold mt-2" style={{ color }}>{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">Compliance Score</div>
    </div>
  );
}
