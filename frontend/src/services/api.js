const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response error' }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }
  return response.json();
}

export const api = {
  getHospitals: async () => {
    const res = await fetch(`${API_BASE_URL}/hospitals`);
    return handleResponse(res);
  },

  getDoctors: async (hospitalId) => {
    const url = hospitalId ? `${API_BASE_URL}/doctors?hospital_id=${hospitalId}` : `${API_BASE_URL}/doctors`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  registerPatient: async (patientData) => {
    const res = await fetch(`${API_BASE_URL}/patient/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    return handleResponse(res);
  },

  getQueueStatus: async (hospitalId, department) => {
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospital_id', hospitalId);
    if (department) params.append('department', department);
    const res = await fetch(`${API_BASE_URL}/queue/status?${params.toString()}`);
    return handleResponse(res);
  },

  getWaitingTime: async (tokenNumber) => {
    const res = await fetch(`${API_BASE_URL}/waiting-time/${encodeURIComponent(tokenNumber.trim())}`);
    return handleResponse(res);
  },

  doctorStart: async (doctorId, tokenId = null) => {
    const res = await fetch(`${API_BASE_URL}/doctor/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: doctorId, token_id: tokenId }),
    });
    return handleResponse(res);
  },

  doctorEnd: async (doctorId) => {
    const res = await fetch(`${API_BASE_URL}/doctor/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: doctorId }),
    });
    return handleResponse(res);
  },

  doctorStatus: async (doctorId, status) => {
    const res = await fetch(`${API_BASE_URL}/doctor/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: doctorId, status: status }),
    });
    return handleResponse(res);
  },

  sendNotification: async (tokenNumber, channel, phone, message) => {
    const res = await fetch(`${API_BASE_URL}/notifications/send-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token_number: tokenNumber,
        channel: channel,
        phone: phone,
        message: message
      }),
    });
    return handleResponse(res);
  },

  getAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`);
    return handleResponse(res);
  },

  seedDemo: async () => {
    const res = await fetch(`${API_BASE_URL}/seed-demo`, {
      method: 'POST',
    });
    return handleResponse(res);
  }
};
