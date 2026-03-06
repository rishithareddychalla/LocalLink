const BASE_URL = `http://${window.location.hostname}:5000/api`;

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('llr_session_token');
    console.log(`[API] Request to ${endpoint}. Token found: ${!!token} (${token ? token.substring(0, 5) : 'none'}...)`);

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('llr_unauthorized'));
        const data = await response.json();
        throw new Error(data.error || 'Unauthorized');
    }

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

    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('llr_unauthorized'));
        const data = await response.json();
        throw new Error(data.error || 'Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
    }

    return data;
};
