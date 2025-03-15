export interface NGO {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
}

export interface Request {
  id: string;
  user_id: string;
  ngo_id: string;
  message: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected';
  severity: 'low' | 'moderate' | 'high';
  created_at: string;
}

export interface RequestMedia {
  id: string;
  request_id: string;
  media_url: string;
  uploaded_at: string;
} 