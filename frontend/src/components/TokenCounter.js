import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Calendar } from 'lucide-react';

const TokenCounter = ({ refreshTrigger = 0 }) => {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchTokenUsage();
  }, [refreshTrigger]);

  const fetchTokenUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/token_usage/');
      if (response.ok) {
        const data = await response.json();
        setTokenData(data);
      }
    } catch (error) {
      console.error('Error fetching token usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !tokenData) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4">
        <div className="text-sm text-gray-600">Loading token data...</div>
      </div>
    );
  }

  const today = tokenData.today;
  const percentage = Math.min((today.total_tokens / tokenData.daily_limit) * 100, 100);

  const getStatusColor = () => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusTextColor = () => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (percentage < 50) return 'bg-green-50';
    if (percentage < 80) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg p-4 max-w-sm ${getStatusBgColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${getStatusTextColor()}`} />
          <span className="text-sm font-semibold text-gray-700">Today's Token Usage</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusTextColor()} bg-white`}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded-full h-2.5 mb-3">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getStatusColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Token Count */}
      <div className="text-xs text-gray-600 mb-3 text-center">
        <span className="font-semibold">{today.total_tokens.toLocaleString()}</span>
        <span> / </span>
        <span className="font-semibold">{tokenData.daily_limit.toLocaleString()}</span>
        <span> tokens used today</span>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-white bg-opacity-50 rounded p-2">
          <div className="text-gray-600">Input</div>
          <div className="font-semibold text-gray-800">{today.input_tokens.toLocaleString()}</div>
        </div>
        <div className="bg-white bg-opacity-50 rounded p-2">
          <div className="text-gray-600">Output</div>
          <div className="font-semibold text-gray-800">{today.output_tokens.toLocaleString()}</div>
        </div>
      </div>

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-center gap-1 px-2 py-1 text-xs bg-white bg-opacity-50 text-gray-700 rounded hover:bg-opacity-75 transition-all"
      >
        <Calendar className="w-3 h-3" />
        {showHistory ? 'Hide History' : 'Show History'}
      </button>

      {/* History */}
      {showHistory && tokenData.history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-300 max-h-48 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Last 7 Days
          </div>
          <div className="space-y-1">
            {tokenData.history.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs bg-white bg-opacity-50 rounded p-1.5">
                <span className="text-gray-700 font-medium">{item.date}</span>
                <span className="text-gray-600">
                  {item.total_tokens.toLocaleString()} tokens
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limit Info */}
      <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Remaining today:</span>
          <span className="font-semibold">{Math.max(0, (tokenData.daily_limit - today.total_tokens)).toLocaleString()} tokens</span>
        </div>
      </div>
    </div>
  );
};

export default TokenCounter;
