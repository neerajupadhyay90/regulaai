import React from 'react';
import { Clock } from 'lucide-react';

export default function ActionPlan({ items }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
            {item.priority || i + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 mb-1">{item.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.detail}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1 text-indigo-600">
                <Clock size={11} /> {item.deadline}
              </span>
              {item.clauseRef && (
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{item.clauseRef}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
