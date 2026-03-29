import React, { useState, useEffect } from 'react';
import { Search, MapPin, Droplet, Phone, Copy, CheckCircle } from 'lucide-react';
import { api } from '../api';

export default function SearchDonors({ user }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    blood_group: '',
    location: ''
  });

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const data = await api.getDonors(filters);
      setDonors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleMarkDonated = async (id) => {
    if (window.confirm("Mark this user as having donated today? This will trigger a 90-day cooldown.")) {
      try {
        await api.markAsDonated(id);
        fetchDonors();
      } catch (err) {
        alert("Error updating donation date.");
      }
    }
  };

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    alert("Phone number copied to clipboard!");
  };

  if (user?.role !== 'admin') {
    return <div className="text-center mt-8 text-primary font-bold">Access Denied. Hospital staff only.</div>;
  }

  return (
    <div className="animate-fade-in mt-4">
      <h1 className="text-2xl font-bold mb-6">Find Donors Directory</h1>

      <div className="card glass mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="form-label" style={{ display: 'none' }}>Blood Group</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
               <Droplet color="var(--primary)" size={18} style={{ position: 'absolute', left: '1rem' }} />
               <select 
                 className="form-select" 
                 style={{ paddingLeft: '2.5rem' }}
                 value={filters.blood_group}
                 onChange={(e) => setFilters({ ...filters, blood_group: e.target.value })}
               >
                 <option value="">Any Blood Group</option>
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
          </div>
          
          <div className="flex-1">
            <label className="form-label" style={{ display: 'none' }}>Location</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
               <MapPin color="var(--text-muted)" size={18} style={{ position: 'absolute', left: '1rem' }} />
               <input 
                 type="text" 
                 placeholder="Search by city or area..." 
                 className="form-input" 
                 style={{ paddingLeft: '2.5rem' }}
                 value={filters.location}
                 onChange={(e) => setFilters({ ...filters, location: e.target.value })}
               />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            <Search size={18} /> Search
          </button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center text-muted py-8">Searching donors...</p>
        ) : donors.length === 0 ? (
          <p className="text-center text-muted py-8">No donors found matching criteria.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Age/Gender</th>
                  <th>Location</th>
                  <th>Contact Actions</th>
                  <th>Status</th>
                  <th>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(donor => (
                  <tr key={donor.id}>
                    <td className="font-bold">{donor.name}</td>
                    <td><span className="badge badge-red">{donor.blood_group}</span></td>
                    <td className="text-muted text-sm">{donor.age} / {donor.gender}</td>
                    <td className="text-sm">{donor.location}</td>
                    <td>
                      <div className="flex gap-2">
                        <a href={`tel:${donor.phone}`} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Call Donor">
                           <Phone size={14} /> Call
                        </a>
                        <button onClick={() => handleCopyPhone(donor.phone)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Copy Number">
                           <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      {donor.is_eligible ? (
                        <span className="badge badge-green">Eligible</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>Not Eligible<br/><small>(90-day cooldown)</small></span>
                      )}
                    </td>
                    <td>
                       {donor.is_eligible && (
                         <button onClick={() => handleMarkDonated(donor.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                            <CheckCircle size={14} /> Mark Donated
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
