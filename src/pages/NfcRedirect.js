import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function NfcRedirect() {
  const { standeeId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/s/${standeeId}`)
      .then(r => {
        const data = r.data;
        if (data.redirect === 'portal') {
          navigate(`/portal/${data.client_id}`);
        } else if (data.redirect === 'suspended') {
          setError(`${data.message || 'Service Suspended'}`);
        }
      })
      .catch(() => {
        setError('Invalid NFC link');
      });
  }, [standeeId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6" data-testid="nfc-error">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-sm bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-2xl font-medium text-[#09090B] mb-2">Service Suspended</h1>
          <p className="text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" data-testid="nfc-loading">
      <Loader2 className="w-8 h-8 animate-spin text-[#002FA7]" />
    </div>
  );
}
