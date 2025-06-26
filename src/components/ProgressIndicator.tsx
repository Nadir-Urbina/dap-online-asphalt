'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: 'order_form' | 'auth' | 'payment' | 'confirmation';
}

const steps = [
  { id: 'order_form', name: 'Order', shortName: 'Order' },
  { id: 'auth', name: 'Authentication', shortName: 'Auth' },
  { id: 'payment', name: 'Payment', shortName: 'Pay' },
  { id: 'confirmation', name: 'Confirmation', shortName: 'Done' },
];

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 px-4 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between">
            {steps.map((step, stepIdx) => {
              const isCompleted = stepIdx < currentStepIndex;
              const isCurrent = stepIdx === currentStepIndex;
              
              return (
                <li key={step.id} className="relative flex-1">
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-full w-full h-0.5 bg-gray-200 -ml-px">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                  
                  <div className="relative flex flex-col items-center group">
                    <span 
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{stepIdx + 1}</span>
                      )}
                    </span>
                    
                    {/* Desktop labels */}
                    <span className={`hidden sm:block mt-2 text-xs font-medium transition-colors duration-200 ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                    
                    {/* Mobile labels */}
                    <span className={`sm:hidden mt-1 text-xs font-medium transition-colors duration-200 ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.shortName}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
} 