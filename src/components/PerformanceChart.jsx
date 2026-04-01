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
                tickFormatter={(str) => format(parseISO(str), 'dd-MMM-yyyy')}
                fontSize={9}
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
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '0.5rem', border: '1px solid #eee', borderRadius: '4px' }}>
            <table style={{ fontSize: '0.8rem', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1, textAlign: 'left' }}>
                    <tr>
                        <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Date</th>
                        <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Input Time</th>
                        <th className="mono" style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>NAV (VND)</th>
                        <th className="mono" style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Unit Val</th>
                        <th className="mono" style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>VNI Value</th>
                        <th className="mono" style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Performance (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {chartData.slice().reverse().map((point, idx) => {
                        // Find original history point for absolute VNI value and Input Time
                        const originalPoint = filteredHistory.find(h => h.date === point.date);
                        const vniVal = originalPoint ? originalPoint.vnindex : 0;
                        const inputTime = point.date ? format(parseISO(point.date), 'HH:mm dd/MM') : '-';

                        return (
                          <tr key={idx}>
                              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{format(parseISO(point.date), 'dd-MMM-yyyy')}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '0.75rem', color: '#666' }}>{inputTime}</td>
                              <td className="mono" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{new Intl.NumberFormat('en-US').format(Math.round(point.nav))}</td>
                              <td className="mono" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(point.unitValue)}</td>
                              <td className="mono" style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{vniVal ? new Intl.NumberFormat('en-US').format(vniVal) : '0.00'}</td>
                              <td className={`mono ${point.fund >= 0 ? 'positive' : 'negative'}`} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                  {formatNum(point.fund)} %
                              </td>
                          </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
