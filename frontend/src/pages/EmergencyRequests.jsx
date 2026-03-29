import React, { useState, useEffect } from 'react';
import { AlertCircle, PlusCircle, Check } from 'lucide-react';
import { api } from '../api';

export default function EmergencyRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    hospital_name: user?.role === 'admin' ? user?.name : '',
    blood_group_needed: 'O-',
    units_needed: 1,
    urgency: 'Urgent',
    location: user?.location || '',
    contact_phone: user?.phone || ''
  });

  const fetchRequests = async () => {
    try {
      const data = await api.getRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRequest(formData);
      // Basic Notification Feature
      alert(`DOMESTIC ALERT POSTED: \nEmergency: ${formData.blood_group_needed} needed at ${formData.location}`);
      
      setShowForm(false);
      fetchRequests(); // refresh list
    } catch (error) {
      alert("Error creating request");
    }
  };

  const markFulfilled = async (id) => {
    if(window.confirm("Are you sure you want to mark this request as Fulfilled?")) {
      try {
        await api.updateRequestStatus(id, 'Fulfilled');
        fetchRequests();
      } catch (err) {
        alert("Error updating status");
      }
    }
  };

  // Helper for colors
  const getUrgencyColor = (urgency) => {
    if (urgency === 'Critical') return 'var(--primary)';
    if (urgency === 'Urgent') return '#eab308'; // Orange/Yellow
    return 'var(--success)'; // Normal
  };

  return (
    <div className="animate-fade-in mt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
          <AlertCircle /> Emergency Blood Requests
        </h1>
        {user?.role === 'admin' && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            <PlusCircle size={18} /> New Request
          </button>
        )}
      </div>

      {showForm && (
        <div className="card glass mb-8 animate-fade-in">
          <h2 className="font-bold mb-4">Post Emergency Request</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Blood Group Needed</label>
              <select className="form-select" value={formData.blood_group_needed} onChange={(e) => setFormData({...formData, blood_group_needed: e.target.value})}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Units Needed</label>
              <input type="number" min="1" className="form-input" required value={formData.units_needed} onChange={(e) => setFormData({...formData, units_needed: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Urgency</label>
              <select className="form-select" value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})}>
                <option value="Critical">Critical (Immediately)</option>
                <option value="Urgent">Urgent (Within 24 Hours)</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location/Address</label>
              <input type="text" className="form-input" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="tel" className="form-input" required value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
            </div>
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                Broadcast Request
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center text-muted">Loading requests...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {requests.length === 0 ? (
             <p className="text-muted col-span-2">No emergency requests at this time.</p>
          ) : (
            requests.map(req => (
              <div key={req.id} className="card" style={{ 
                borderLeft: req.status === 'Pending' ? `6px solid ${getUrgencyColor(req.urgency)}` : '6px solid var(--border)',
                opacity: req.status === 'Pending' ? 1 : 0.6
              }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{req.hospital_name}</h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(req.created_at).toLocaleString()}</p>
                    {req.status === 'Fulfilled' && <div className="badge mt-2" style={{ background: 'var(--border)' }}>Fulfilled</div>}
                  </div>
                  <div className="text-right">
                    <span className="badge badge-red text-xl py-1 px-3 mb-1" style={{ display: 'inline-block' }}>
                      {req.blood_group_needed}
                    </span>
                    <div className="text-xs font-bold text-uppercase mt-1" style={{ color: getUrgencyColor(req.urgency) }}>
                      {req.units_needed} STRIP(S) • {req.urgency.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="mb-4" style={{ fontSize: '0.9rem' }}>
                  <div className="flex justify-between border-bottom border py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                     <span className="text-muted">Location:</span>
                     <span className="font-bold text-right">{req.location}</span>
                  </div>
                  <div className="flex justify-between py-2">
                     <span className="text-muted">Contact:</span>
                     <div className="flex gap-2 items-center">
                        <span className="font-bold">{req.contact_phone}</span>
                        <a href={`tel:${req.contact_phone}`} className="badge badge-green">Call</a>
                     </div>
                  </div>
                </div>

                {req.status === 'Pending' && user?.role === 'donor' && req.blood_group_needed === user?.blood_group && (
                  <div className="bg-success-light p-3 rounded text-center mt-2" style={{ background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '8px', fontWeight: 'bold' }}>
                    ✔ You are a match! Please contact the hospital immediately.
                  </div>
                )}
                
                {req.status === 'Pending' && user?.role === 'admin' && (
                  <button 
                    className="btn btn-secondary w-full" 
                    onClick={() => markFulfilled(req.id)}
                  >
                    <Check size={18} /> Mark as Fulfilled
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
