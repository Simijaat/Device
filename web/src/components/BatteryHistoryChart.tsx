import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { BatteryCharging, Battery, Activity } from 'lucide-react';
import type { Device, BatteryDataPoint } from '../types';
import { getDeviceBatteryHistory } from '../services/apiClient';

interface BatteryHistoryChartProps {
  device?: Device;
  allDevices: Device[];
  onSelectDevice?: (deviceId: string) => void;
}

type TimeRange = '6h' | '12h' | '24h';

export const BatteryHistoryChart: React.FC<BatteryHistoryChartProps> = ({
  device,
  allDevices,
  onSelectDevice
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const historyData = useMemo(() => {
    if (!device) return [];
    const hours = timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : 24;
    return getDeviceBatteryHistory(device, hours);
  }, [device, timeRange]);

  if (!device) {
    return (
      <div className="liquid-card p-8 text-center flex flex-col items-center justify-center my-6">
        <Battery className="w-10 h-10 text-slate-700 mb-2 stroke-[2.2]" />
        <h3 className="text-base font-bold text-slate-900">No Device Selected</h3>
        <p className="text-slate-600 text-xs mt-1">Select a paired Android device to inspect its live battery telemetry history.</p>
      </div>
    );
  }

  const currentLevel = device.batteryLevel ?? 0;
  const isCharging = Boolean(device.isCharging);

  const minLevel = historyData.length ? Math.min(...historyData.map(d => d.batteryLevel)) : currentLevel;
  const maxLevel = historyData.length ? Math.max(...historyData.map(d => d.batteryLevel)) : currentLevel;
  const avgLevel = historyData.length ? Math.round(historyData.reduce((acc, d) => acc + d.batteryLevel, 0) / historyData.length) : currentLevel;

  const isLow = currentLevel <= 20;
  const primaryColor = isLow ? '#EF4444' : isCharging ? '#10B981' : '#4F46E5';
  const secondaryColor = isLow ? '#F59E0B' : isCharging ? '#06B6D4' : '#7C3AED';

  return (
    <div className="liquid-card p-5 sm:p-6 mb-8 transition-all duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl liquid-glass-droplet flex items-center justify-center text-slate-900 shrink-0">
            {isCharging ? (
              <BatteryCharging className="w-6 h-6 text-emerald-700 stroke-[2.3]" />
            ) : (
              <Battery className="w-6 h-6 text-slate-900 stroke-[2.3]" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Battery Telemetry &amp; History
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isCharging
                  ? 'bg-emerald-500/20 text-emerald-950 border-emerald-400/60'
                  : isLow
                  ? 'bg-red-500/20 text-red-950 border-red-400/60'
                  : 'bg-white/60 text-slate-900 border-white/80'
              }`}>
                {isCharging ? 'Charging' : isLow ? 'Low Battery' : 'Discharging'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Device: <strong className="text-slate-900">{device.name}</strong> ({device.model || 'Android Device'})
            </p>
          </div>
        </div>

        {/* Device Switcher & Time Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {allDevices.length > 1 && onSelectDevice && (
            <select
              value={device.id}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="text-xs font-bold px-3.5 py-2 rounded-full liquid-glass-input text-slate-900 focus:outline-none"
              aria-label="Select device for battery graph"
            >
              {allDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.batteryLevel ?? 0}%)
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center p-1 rounded-full liquid-glass-input">
            {(['6h', '12h', '24h'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                  timeRange === range
                    ? 'liquid-glass-droplet text-slate-950 shadow-sm'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real Telemetry Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-white/45 border border-white/75 backdrop-blur-md">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Current Level</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{currentLevel}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/45 border border-white/75 backdrop-blur-md">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Average ({timeRange})</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{avgLevel}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/45 border border-white/75 backdrop-blur-md">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Min / Max Recorded</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-slate-900">{minLevel}%</span>
            <span className="text-xs text-slate-500">/</span>
            <span className="text-lg font-black text-slate-900">{maxLevel}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/45 border border-white/75 backdrop-blur-md">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Recorded Syncs</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Activity className="w-4 h-4 text-indigo-700" />
            <span className="text-lg font-black text-slate-900">
              {historyData.length} {historyData.length === 1 ? 'Sample' : 'Samples'}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-64 sm:h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={historyData}
            margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="batteryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.45} />
                <stop offset="60%" stopColor={secondaryColor} stopOpacity={0.18} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(15, 23, 42, 0.1)"
              vertical={false}
            />

            <XAxis
              dataKey="timeLabel"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(15, 23, 42, 0.15)', strokeWidth: 1 }}
              tickMargin={8}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />

            <ReferenceLine
              y={20}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: '20% Low Limit',
                position: 'insideBottomRight',
                fill: '#DC2626',
                fontSize: 10,
                fontWeight: 'bold',
                offset: 5,
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as BatteryDataPoint;
                  return (
                    <div className="liquid-glass-droplet p-3.5 rounded-2xl text-xs space-y-1.5 min-w-[180px]">
                      <div className="flex justify-between items-center text-slate-700 font-bold border-b border-slate-900/10 pb-1">
                        <span>{data.timeLabel}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-slate-900">
                          {data.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-slate-700 font-medium">Battery Level:</span>
                        <span className="font-black text-sm text-slate-950">{data.batteryLevel}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-600">
                        <span>Power State:</span>
                        <span className="font-bold text-slate-900">
                          {data.isCharging ? 'Charging' : 'On Battery'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="batteryLevel"
              stroke={primaryColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#batteryAreaGrad)"
              dot={{
                r: 4,
                fill: primaryColor,
                stroke: '#FFFFFF',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: primaryColor,
                stroke: '#FFFFFF',
                strokeWidth: 2.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 pt-3 border-t border-white/50 text-[11px] text-slate-600 gap-2 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }}></span>
            Live Recorded Device Telemetry
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-red-500 border border-red-500"></span>
            Low Battery Threshold (20%)
          </span>
        </div>
        <div className="text-slate-700 font-semibold">
          Last verified sync: {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Live'}
        </div>
      </div>
    </div>
  );
};
