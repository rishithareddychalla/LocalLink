const BASE_URL = 'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('llr_session_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API Request failed');
    }

    return data;
};

export const apiUpload = async (endpoint, formData) => {
    const token = localStorage.getItem('llr_session_token');

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
    }

    return data;
};
