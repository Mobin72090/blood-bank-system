import React, { useState, useEffect } from 'react';
import { Users, Droplets, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../api';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({ donors: 0, availableDonors: 0, inventory: [], requests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const donorsData = await api.getDonors();
        const inventoryData = await api.getInventory();
        const requestsData = await api.getRequests(); // get all to split by status

        setStats({
          donors: donorsData.length,
          availableDonors: donorsData.filter(d => d.is_eligible).length, // using updated V2 logic
          inventory: inventoryData,
          requests: requestsData
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center mt-8 text-muted">Loading metrics...</div>;

  const totalUnits = stats.inventory.reduce((acc, curr) => acc + curr.units_available, 0);
  const pendingRequests = stats.requests.filter(r => r.status === 'Pending');
  const fulfilledRequests = stats.requests.filter(r => r.status === 'Fulfilled');

  return (
    <div className="animate-fade-in mt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">System Dashboard</h1>
      </div>

      <div className="grid grid-cols-4 mb-8">
        <div className="card glass" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="flex items-center gap-4 mb-3">
            <Users color="var(--primary)" size={28} />
            <span className="font-bold text-lg text-muted">Total Donors</span>
          </div>
          <div className="text-4xl font-bold">{stats.donors}</div>
          <div className="text-success mt-2 font-bold text-sm">
            {stats.availableDonors} eligible today
          </div>
        </div>

        <div className="card glass" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="flex items-center gap-4 mb-3">
            <Droplets color="#3b82f6" size={28} />
            <span className="font-bold text-lg text-muted">Blood Stock</span>
          </div>
          <div className="text-4xl font-bold">{totalUnits}</div>
          <div className="text-muted mt-2 font-bold text-sm">
            Units across network
          </div>
        </div>

        <div className="card glass" style={{ borderTop: '4px solid #eab308' }}>
          <div className="flex items-center gap-4 mb-3">
            <AlertTriangle color="#eab308" size={28} />
            <span className="font-bold text-lg text-muted">Active Needs</span>
          </div>
          <div className="text-4xl font-bold">{pendingRequests.length}</div>
          <div className="text-muted mt-2 font-bold text-sm">
            Pending requests
          </div>
        </div>

        <div className="card glass" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="flex items-center gap-4 mb-3">
            <CheckCircle color="var(--success)" size={28} />
            <span className="font-bold text-lg text-muted">Lives Saved</span>
          </div>
          <div className="text-4xl font-bold">{fulfilledRequests.length}</div>
          <div className="text-success mt-2 font-bold text-sm">
            Requests fulfilled
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="card">
          <h2 className="font-bold text-2xl mb-6 text-secondary">Inventory by Blood Group</h2>
          <div className="grid grid-cols-4 gap-4" style={{ textAlign: 'center' }}>
            {stats.inventory.map(inv => (
              <div key={inv.blood_group} style={{
                padding: '1.5rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: inv.units_available < 10 ? 'var(--primary-light)' : 'var(--success-bg)',
                color: inv.units_available < 10 ? 'var(--primary)' : 'var(--success)',
                transition: 'var(--transition)'
              }} className="hover:shadow-md">
                <div className="font-bold text-2xl mb-1">{inv.blood_group}</div>
                <div className="font-bold text-sm opacity-80">{inv.units_available} UNITS</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-2xl mb-6 text-secondary">Recent Pending Requests</h2>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-light rounded text-muted">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50 text-success" />
              <p className="font-bold text-lg">All caught up!</p>
              <p>No active emergency requests.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingRequests.slice(0, 5).map(req => (
                <div key={req.id} style={{ 
                  border: '1px solid var(--border)', 
                  padding: '1rem',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${req.urgency === 'Critical' ? 'var(--primary)' : req.urgency === 'Urgent' ? '#eab308' : 'var(--success)'}` 
                }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{req.hospital_name}</span>
                    <span className="badge badge-red">{req.urgency}</span>
                  </div>
                  <div className="text-muted text-sm flex justify-between">
                    <span>Needs {req.units_needed} units of <strong className="text-primary">{req.blood_group_needed}</strong></span>
                    <span>{req.contact_phone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
