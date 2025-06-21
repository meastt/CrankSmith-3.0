// app/components/CompatibilityIndicator.tsx
'use client';

import React from 'react';
import { CompatibilityCheck, CompatibilityWarning } from '../types/components';

interface CompatibilityIndicatorProps {
  compatibility: CompatibilityCheck | null;
  loading?: boolean;
}

export function CompatibilityIndicator({ compatibility, loading = false }: CompatibilityIndicatorProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!compatibility) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Compatibility Check
        </h3>
        <p className="text-gray-500">
          Select components to check compatibility
        </p>
      </div>
    );
  }

  const getOverallStatus = () => {
    if (compatibility.compatible) {
      return {
        color: 'green',
        icon: '✅',
        title: 'Compatible Setup',
        description: 'All components work together'
      };
    } else {
      return {
        color: 'red',
        icon: '❌',
        title: 'Compatibility Issues',
        description: 'Critical issues found'
      };
    }
  };

  const status = getOverallStatus();

  const getWarningColor = (type: CompatibilityWarning['type']) => {
    switch (type) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getWarningBg = (type: CompatibilityWarning['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getWarningIcon = (type: CompatibilityWarning['type']) => {
    switch (type) {
      case 'critical':
        return '🚫';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b bg-${status.color}-50 border-${status.color}-200`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{status.icon}</span>
          <div>
            <h3 className={`text-lg font-medium text-${status.color}-900`}>
              {status.title}
            </h3>
            <p className={`text-sm text-${status.color}-700`}>
              {status.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary Stats */}
        {compatibility.warnings.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {compatibility.warnings.filter(w => w.type === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {compatibility.warnings.filter(w => w.type === 'warning').length}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {compatibility.warnings.filter(w => w.type === 'info').length}
              </div>
              <div className="text-sm text-gray-600">Info</div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {compatibility.warnings.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Issues & Recommendations
            </h4>
            <div className="space-y-3">
              {compatibility.warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md border ${getWarningBg(warning.type)}`}
                >
                  <div className="flex items-start">
                    <span className="text-lg mr-3 flex-shrink-0">
                      {getWarningIcon(warning.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium text-${getWarningColor(warning.type)}-900`}>
                            {warning.component}: {warning.issue}
                          </p>
                          {warning.suggestion && (
                            <p className={`text-sm text-${getWarningColor(warning.type)}-700 mt-1`}>
                              💡 {warning.suggestion}
                            </p>
                          )}
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium bg-${getWarningColor(warning.type)}-100 text-${getWarningColor(warning.type)}-800 rounded-full flex-shrink-0`}>
                          {warning.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {compatibility.notes.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Technical Notes
            </h4>
            <div className="bg-gray-50 rounded-md p-4">
              <ul className="space-y-1">
                {compatibility.notes.map((note, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Success message */}
        {compatibility.compatible && compatibility.warnings.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-lg font-medium text-green-900 mb-2">
              Perfect Compatibility!
            </h4>
            <p className="text-green-700">
              All components work together seamlessly with no issues detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}