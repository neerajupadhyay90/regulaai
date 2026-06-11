import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const SEVERITY_STYLES = {
  critical: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-800', label: 'Critical' },
  high:     { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-800', label: 'High' },
  medium:   { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  low:      { border: 'border-l-green-500', badge: 'bg-green-100 text-green-800', label: 'Low' }
};

export default function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(finding.severity === 'critical');
  const style = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.medium;

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${style.border} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${style.badge}`}>
          {style.label}
        </span>
        <span className="text-sm font-medium text-gray-800 flex-1">{finding.title}</span>
        {finding.clauseId && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex-shrink-0">
            {finding.clauseId}
          </span>
        )}
        {expanded ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed mt-3 mb-3">{finding.description}</p>
          {finding.fineExposure && finding.fineExposure !== 'Unknown' && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
              ⚠️ Risk exposure: {finding.fineExposure}
            </p>
          )}
          <div className="flex items-start gap-2 bg-indigo-50 rounded-lg px-3 py-2.5">
            <ArrowRight size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">{finding.action}</p>
          </div>
          {finding.deadline && (
            <p className="text-xs text-gray-400 mt-2">⏱ Deadline: {finding.deadline}</p>
          )}
        </div>
      )}
    </div>
  );
}
