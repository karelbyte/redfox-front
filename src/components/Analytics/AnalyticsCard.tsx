'use client';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  themeColors: {
    primary: string;
    light: string;
    dark: string;
    veryLight: string;
    border: string;
  };
}

export default function AnalyticsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  themeColors 
}: AnalyticsCardProps) {
  return (
    <div 
      className="p-6 rounded-lg"
      style={{
        backgroundColor: themeColors.veryLight,
        border: `1px solid ${themeColors.border}`
      }}
    >
      <div className="flex items-center">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
          style={{
            backgroundColor: themeColors.light,
            color: themeColors.primary
          }}
        >
          <div className="w-6 h-6">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg 
                  className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 17l9.2-9.2M17 17V7H7" 
                  />
                </svg>
                {Math.abs(trend.value).toFixed(1)}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}