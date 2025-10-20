import React from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';

const ProcessingSteps = ({ steps, currentStep, isProcessing }) => {
  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return isProcessing ? 'processing' : 'current';
    return 'pending';
  };

  const getStepIcon = (step, status) => {
    const IconComponent = step.icon;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'processing':
        return (
          <div className="relative">
            <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        );
      case 'current':
        return <IconComponent className="w-6 h-6 text-blue-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 border-green-600 bg-green-50';
      case 'processing':
      case 'current':
        return 'text-blue-600 border-blue-600 bg-blue-50';
      default:
        return 'text-gray-400 border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Conversion Progress
      </h3>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center space-y-3 flex-1">
                {/* Step Circle */}
                <div 
                  className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 ${getStepColor(status)}
                  `}
                >
                  {getStepIcon(step, status)}
                </div>
                
                {/* Step Info */}
                <div className="text-center">
                  <h4 className={`font-medium text-sm ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'processing' || status === 'current' ? 'text-blue-700' :
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                  
                  {status === 'processing' && (
                    <div className="mt-2">
                      <div className="inline-flex items-center text-xs text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                        Processing...
                      </div>
                    </div>
                  )}
                  
                  {status === 'completed' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 px-4">
                  <div 
                    className={`h-0.5 transition-all duration-500 ${
                      status === 'completed' ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Overall Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingSteps;
