import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { calculatePerformance } from '../logic/performance';

const PerformanceChart = ({ history, activePortfolio }) => {
  const [range, setRange] = useState('ALL'); 
  const [method, setMethod] = useState('TWR'); 

  const filteredHistory = history.filter(h => h.portfolio === activePortfolio || activePortfolio === 'All');
  
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let displayData = filteredHistory;
  if (range === 'YTD') displayData = filteredHistory.filter(h => h.date >= yearStart);
  if (range === 'MTD') displayData = filteredHistory.filter(h => h.date >= monthStart);

  const chartData = calculatePerformance(displayData, method);

  const formatNum = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="card">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>PERFORMANCE ANALYTICS</span>
        <div className="btn-toggle-group" style={{ marginBottom: 0 }}>
          <button className={`btn-toggle ${range === 'ALL' ? 'active' : ''}`} onClick={() => setRange('ALL')}>ALL</button>
          <button className={`btn-toggle ${range === 'YTD' ? 'active' : ''}`} onClick={() => setRange('YTD')}>YTD</button>
          <button className={`btn-toggle ${range === 'MTD' ? 'active' : ''}`} onClick={() => setRange('MTD')}>MTD</button>
          <div style={{ width: '1px', background: '#ccc', margin: '0 0.5rem' }} />
          <button className={`btn-toggle ${method === 'TWR' ? 'active' : ''}`} onClick={() => setMethod('TWR')}>TWR (%)</button>
          <button className={`btn-toggle ${method === 'ROI' ? 'active' : ''}`} onClick={() => setMethod('ROI')}>ROI (%)</button>
        </div>
      </div>

      <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
                dataKey="date" 
                tickFormatter={(str) => format(parseISO(str), 'dd-MMM')}
                fontSize={10}
            />
            <YAxis fontSize={10} unit="%" />
            <Tooltip 
                labelFormatter={(label) => format(parseISO(label), 'dd-MMM-yyyy')}
                formatter={(value, name) => [
                    `${formatNum(value)}%`, 
                    name === 'fund' ? 'Fund' : 'VNI Benchmark'
                ]}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Line 
              type="monotone" 
              dataKey="fund" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              name="fund"
            />
            <Line 
              type="monotone" 
              dataKey="index" 
              stroke="#999" 
              strokeDasharray="5 5"
              dot={false}
              name="index"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SNAPSHOT HISTORY</label>
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '0.5rem' }}>
            <table style={{ fontSize: '0.8rem' }}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th className="mono">NAV (VND)</th>
                        <th className="mono">Unit Val</th>
                        <th className="mono">VNI</th>
                        <th className="mono">Performance (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {chartData.slice().reverse().map((point, idx) => (
                        <tr key={idx}>
                            <td>{format(parseISO(point.date), 'dd-MMM-yyyy')}</td>
                            <td className="mono">{new Intl.NumberFormat('en-US').format(Math.round(point.nav))}</td>
                            <td className="mono">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(point.unitValue)}</td>
                            <td className="mono">{point.index ? formatNum(point.index) : '0.00'} %</td>
                            <td className={`mono ${point.fund >= 0 ? 'positive' : 'negative'}`}>
                                {formatNum(point.fund)} %
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
