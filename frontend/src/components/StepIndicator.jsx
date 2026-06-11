import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex flex-col gap-2 text-left">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDone ? 'bg-green-100' : isActive ? 'bg-indigo-100' : 'bg-gray-100'
            }`}>
              {isDone
                ? <Check size={12} className="text-green-600" />
                : isActive
                  ? <Loader2 size={12} className="text-indigo-600 animate-spin" />
                  : <Circle size={12} className="text-gray-400" />}
            </div>
            <span className={`text-sm ${isDone ? 'text-green-600' : isActive ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
