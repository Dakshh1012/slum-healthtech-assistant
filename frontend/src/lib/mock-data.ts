
export interface RequestMedia {
    id: string;
    request_id: string;
    media_url: string;
    created_at: string;
  }
  
  export interface Request {
    id: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    severity: 'low' | 'medium' | 'high';
    address: string;
    created_at: string;
    media: RequestMedia[];
  }
  
  export const mockRequests: Request[] = [
    {
      id: "req-001",
      message: "Need urgent medical supplies for elderly residents in community center",
      status: "pending",
      severity: "high",
      address: "42 Maple Street, Westview, CA 94123",
      created_at: "2023-09-15T14:30:00Z",
      media: [
        {
          id: "media-001",
          request_id: "req-001",
          media_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          created_at: "2023-09-15T14:32:00Z"
        }
      ]
    },
    {
      id: "req-002",
      message: "Food and clean water needed for family of 5 after flash flooding",
      status: "accepted",
      severity: "high",
      address: "18 River Road, Eastbank, CA 94210",
      created_at: "2023-09-14T10:15:00Z",
      media: [
        {
          id: "media-002",
          request_id: "req-002",
          media_url: "https://images.unsplash.com/photo-1583197576930-4d3f1e2b0ef5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          created_at: "2023-09-14T10:18:00Z"
        },
        {
          id: "media-003",
          request_id: "req-002",
          media_url: "https://assets.mixkit.co/active_storage/sfx/2566/2566-preview.mp3",
          created_at: "2023-09-14T10:20:00Z"
        }
      ]
    },
    {
      id: "req-003",
      message: "Requesting temporary shelter for three displaced families",
      status: "pending",
      severity: "medium",
      address: "257 Oak Avenue, Northpoint, CA 94305",
      created_at: "2023-09-13T16:45:00Z",
      media: []
    },
    {
      id: "req-004",
      message: "Need volunteers for debris cleanup after storm",
      status: "rejected",
      severity: "low",
      address: "95 Beach Road, Shoreline, CA 94501",
      created_at: "2023-09-12T09:20:00Z",
      media: [
        {
          id: "media-004",
          request_id: "req-004",
          media_url: "https://images.unsplash.com/photo-1564419320461-6870880221ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          created_at: "2023-09-12T09:25:00Z"
        }
      ]
    },
    {
      id: "req-005",
      message: "Requesting educational supplies for children's shelter",
      status: "pending",
      severity: "medium",
      address: "120 School Lane, Centertown, CA 94110",
      created_at: "2023-09-11T13:10:00Z",
      media: [
        {
          id: "media-005",
          request_id: "req-005",
          media_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          created_at: "2023-09-11T13:15:00Z"
        },
        {
          id: "media-006",
          request_id: "req-005",
          media_url: "https://assets.mixkit.co/active_storage/sfx/2404/2404-preview.mp3",
          created_at: "2023-09-11T13:18:00Z"
        }
      ]
    }
  ];