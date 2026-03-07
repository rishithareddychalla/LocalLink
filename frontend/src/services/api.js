const BASE_URL = `http://${window.location.hostname}:5000/api`;

let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3;

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('llr_session_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
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
            if (response.status === 500) {
                window.dispatchEvent(new CustomEvent('llr_system_error', {
                    detail: {
                        errorCode: '500 INTERNAL SERVER ERROR',
                        trace: `API_FAILURE: ${endpoint}`
                    }
                }));
            }
            throw new Error(data.error || 'API Request failed');
        }

        // Reset failures on success
        consecutiveFailures = 0;
        return data;
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            consecutiveFailures++;
            if (consecutiveFailures >= FAILURE_THRESHOLD) {
                window.dispatchEvent(new CustomEvent('llr_network_offline'));
            }
        }
        throw error;
    }
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
        if (response.status === 500) {
            window.dispatchEvent(new CustomEvent('llr_system_error', {
                detail: {
                    errorCode: '500 INTERNAL SERVER ERROR',
                    trace: `UPLOAD_FAILURE: ${endpoint}`
                }
            }));
        }
        throw new Error(data.error || 'Upload failed');
    }

    return data;
};
