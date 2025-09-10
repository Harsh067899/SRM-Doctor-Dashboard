import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Recharts types can be loose; we import PieLabelRenderProps for guidance
import type { PieLabelRenderProps } from 'recharts/types/polar/Pie';

interface VideoPerformanceChartProps {
  data: {
    videoId: string;
    views: number;
    approvals: number;
    disapprovals: number;
    engagementRate: number;
  }[];
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

export default function VideoPerformanceChart({ data }: VideoPerformanceChartProps) {
  // Prepare data for charts
  const barChartData = data.slice(0, 10).map((item, index) => ({
    name: `Video ${index + 1}`,
    videoId: item.videoId.slice(0, 8),
    Views: item.views,
    Approvals: item.approvals,
    Concerns: item.disapprovals,
  }));

  const pieChartData = [
    {
      name: 'Total Views',
      value: data.reduce((sum, item) => sum + item.views, 0),
      color: COLORS[0]
    },
    {
      name: 'Total Approvals',
      value: data.reduce((sum, item) => sum + item.approvals, 0),
      color: COLORS[1]
    },
    {
      name: 'Total Concerns',
      value: data.reduce((sum, item) => sum + item.disapprovals, 0),
      color: COLORS[2]
    }
  ];

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: { dataKey: string; value: number; color: string }, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (rawProps: unknown) => {
    const p = (rawProps ?? {}) as Partial<PieLabelRenderProps> & Record<string, unknown>;
    const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);
    const cx = num(p.cx);
    const cy = num(p.cy);
    const midAngle = num((p as Record<string, unknown>).midAngle);
    const innerRadius = num(p.innerRadius);
    const outerRadius = num(p.outerRadius);
    const percent = num((p as Record<string, unknown>).percent);

    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Video Performance Comparison</h3>
          <p className="card-description">Views, approvals, and concerns by video</p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Views" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Approvals" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Concerns" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Overall Engagement Distribution</h3>
          <p className="card-description">Total engagement across all videos</p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry: { color: string }, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {pieChartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">
                {item.name}: {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


