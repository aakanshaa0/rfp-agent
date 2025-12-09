const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

export const api = {
  //Auth endpoints
  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  getProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  //RFP endpoints
  uploadRfp: async (file: File) => {
    const token = getAuthToken();
    console.log('uploadRfp called with file:', file.name, 'size:', file.size);
    console.log('Auth token:', token ? 'Present' : 'Missing');
    
    const formData = new FormData();
    formData.append('rfp', file);

    console.log('Sending request to:', `${API_URL}/api/rfp/upload`);
    
    const response = await fetch(`${API_URL}/api/rfp/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Upload failed:', error);
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  },

  getRfps: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/rfp/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch RFPs');
    return response.json();
  },

  getRfpById: async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/rfp/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch RFP');
    return response.json();
  },

  deleteRfp: async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/rfp/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete RFP');
    return response.json();
  },

  //Product endpoints
  getProducts: async () => {
    const response = await fetch(`${API_URL}/api/products/`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  matchProducts: async (rfpId: string, extractedText: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/products/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rfpId, extractedText }),
    });
    if (!response.ok) throw new Error('Failed to match products');
    return response.json();
  },

  getMatches: async (rfpId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/products/matches/${rfpId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch matches');
    return response.json();
  },

  //Proposal endpoints
  calculatePrice: async (rfpId: string, matches: any[], quantities?: Record<string, number>) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/proposals/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rfpId, matches, quantities }),
    });
    if (!response.ok) throw new Error('Failed to calculate price');
    return response.json();
  },

  createProposal: async (rfpId: string, matchedProducts: any, priceBreakdown: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/proposals/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rfpId, matchedProducts, priceBreakdown }),
    });
    if (!response.ok) throw new Error('Failed to create proposal');
    return response.json();
  },

  getProposals: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/proposals/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch proposals');
    return response.json();
  },

  getProposalById: async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/proposals/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch proposal');
    return response.json();
  },

  updateProposalStatus: async (id: string, status: 'draft' | 'submitted' | 'approved' | 'rejected') => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/proposals/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update proposal status');
    return response.json();
  },
};
