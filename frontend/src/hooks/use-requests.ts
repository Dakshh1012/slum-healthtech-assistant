import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Request {
  id: string;
  user_id: string;
  ngo_id: string;
  message: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected';
  severity: 'low' | 'moderate' | 'high';
  created_at: string;
  media: {
    id: string;
    media_url: string;
    uploaded_at: string;
  }[];
}

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRequests() {
    try {
      setLoading(true);
      
      // Fetch requests with their associated media
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          media:request_media(
            id,
            media_url,
            uploaded_at
          )
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      setRequests(requestsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching requests');
    } finally {
      setLoading(false);
    }
  }

  async function updateRequestStatus(requestId: string, newStatus: 'accepted' | 'rejected') {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating request');
      return false;
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    updateRequestStatus,
    refreshRequests: fetchRequests
  };
} 