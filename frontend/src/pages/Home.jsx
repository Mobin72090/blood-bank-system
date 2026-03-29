import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Users, ShieldAlert, HeartPulse, ArrowRight } from 'lucide-react';

export default function Home({ user }) {
  return (
    <div className="animate-fade-in mt-4">
      <div className="flex items-center justify-between mb-8 pb-8 gap-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ flex: 1 }}>
          <div className="badge badge-red mb-4">Lifeline Blood Bank</div>
          <h1 className="text-4xl mb-4" style={{ lineHeight: 1.2 }}>
            Every Drop Counts.<br/>
            <span className="text-gradient">Save Lives Today.</span>
          </h1>
          <p className="text-muted mb-8 text-lg" style={{ maxWidth: '500px' }}>
            Connect directly with local hospitals, track your donations, and respond to emergency requests in real-time. Experience the most modern way to become a hero in your community.
          </p>

          {!user ? (
            <div className="flex gap-4">
              <Link to="/auth?mode=register" className="btn btn-primary text-lg px-8">
                Register as Donor <ArrowRight size={20} />
              </Link>
              <Link to="/auth?mode=login" className="btn btn-outline text-lg px-8">
                Hospital Login
              </Link>
            </div>
          ) : (
            <div className="flex gap-4">
               <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div className="glass p-8" style={{ borderRadius: '40px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary-light)', borderRadius: '50%', filter: 'blur(40px)', zIndex: -1 }}></div>
             <HeartPulse color="var(--primary)" size={160} style={{ filter: 'drop-shadow(0 20px 30px rgba(225,29,72,0.3))' }} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 mt-8">
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <div className="mb-6 flex justify-center">
             <div className="glass" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <Droplet className="text-primary" size={40} />
             </div>
          </div>
          <h3 className="text-xl font-bold mb-3">Donate Blood</h3>
          <p className="text-muted text-sm">
            Easily register your specific blood type and manage your availability so hospitals can locate you smoothly when needed.
          </p>
        </div>
        
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <div className="mb-6 flex justify-center">
             <div className="glass" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <ShieldAlert color="#eab308" size={40} />
             </div>
          </div>
          <h3 className="text-xl font-bold mb-3">Emergency Requests</h3>
          <p className="text-muted text-sm">
            Critical infrastructure allowing hospitals to instantly broadcast urgent emergency blood needs to available local donors.
          </p>
        </div>

        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <div className="mb-6 flex justify-center">
             <div className="glass" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <Users color="#3b82f6" size={40} />
             </div>
          </div>
          <h3 className="text-xl font-bold mb-3">Track Inventory</h3>
          <p className="text-muted text-sm">
            A state-of-the-art centralized dashboard to monitor currently available blood units and find matching donors by location.
          </p>
        </div>
      </div>
    </div>
  );
}
