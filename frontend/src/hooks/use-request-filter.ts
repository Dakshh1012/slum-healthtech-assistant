
import { useState, useMemo } from 'react';
import type { Request } from '@/lib/mock-data';

export function useRequestFilter(requests: Request[]) {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return requests;
    }
    
    return requests.filter(request => 
      request.status.toLowerCase() === filter.toLowerCase()
    );
  }, [requests, filter]);
  
  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }, [requests]);
  
  return {
    filter,
    setFilter,
    filteredRequests,
    counts,
  };
}