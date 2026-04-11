import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fileUrl } from '@/lib/api';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function IntentPortal() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/portal/${clientId}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => { setError('Unable to load portal'); setLoading(false); });
  }, [clientId]);

  const handleSelectMember = async (member) => {
    try {
      await axios.post(`${API}/intent/log`, {
        client_id: clientId,
        member_id: member.id,
        member_name: member.name
      });
    } catch {}
    // Navigate to review page
    navigate(`/portal/${clientId}/review?member=${encodeURIComponent(member.name)}&member_id=${member.id}&category=${encodeURIComponent(data?.category || 'General')}&redirect=${encodeURIComponent(data?.redirect_url || '')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#002FA7]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-lg font-medium text-[#09090B]">Portal Unavailable</p>
          <p className="text-sm text-zinc-500 mt-1">{error || 'This link is invalid'}</p>
        </div>
      </div>
    );
  }

  if (data.suspended) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6" data-testid="portal-suspended">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-sm bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-2xl font-medium text-[#09090B] mb-2">Service Suspended</h1>
          <p className="text-sm text-zinc-500">{data.business_name}'s account is currently inactive.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="intent-portal">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/d2ed1487-14a4-4fc1-8e2b-3d8f6aaf654d/images/a3e0b2130b485bc9bbe242cae0bab2b7c522b549d1955c31a2b1627d78900940.png"
              alt="Tellvy"
              className="w-6 h-6"
            />
            <span className="text-sm text-zinc-400">Powered by Tellvy</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B] mb-2">
            {data.business_name}
          </h1>
          <p className="text-base text-zinc-500">Who helped you today?</p>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-2 gap-4">
          {data.members?.map(member => (
            <button
              key={member.id}
              onClick={() => handleSelectMember(member)}
              className="group flex flex-col items-center gap-3 p-5 bg-white border border-zinc-200 rounded-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              data-testid={`portal-member-${member.id}`}
            >
              <div className="w-20 h-20 rounded-sm bg-[#002FA7]/10 overflow-hidden">
                {member.photo_path ? (
                  <img src={fileUrl(member.photo_path)} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-[#002FA7]">
                    {member.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#09090B] group-hover:text-[#002FA7] transition-colors">{member.name}</p>
                {member.role_title && <p className="text-xs text-zinc-400">{member.role_title}</p>}
              </div>
            </button>
          ))}
        </div>

        {data.members?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500">No team members available</p>
          </div>
        )}
      </div>
    </div>
  );
}
