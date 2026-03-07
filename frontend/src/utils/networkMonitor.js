/**
 * Simple network monitor that pings the backend health endpoint.
 * Dispatches 'llr_network_offline' and 'llr_network_online' events.
 */

let monitorInterval = null;
let isOffline = false;

export const startNetworkMonitor = (intervalMs = 5000) => {
    if (monitorInterval) return;

    const checkHealth = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/health`, {
                cache: 'no-store'
            });

            if (response.ok) {
                if (isOffline) {
                    isOffline = false;
                    window.dispatchEvent(new CustomEvent('llr_network_online'));
                }
            } else {
                handleFailure();
            }
        } catch (error) {
            handleFailure();
        }
    };

    const handleFailure = () => {
        if (!isOffline) {
            isOffline = true;
            window.dispatchEvent(new CustomEvent('llr_network_offline'));
        }
    };

    // Initial check
    checkHealth();

    monitorInterval = setInterval(checkHealth, intervalMs);
};

export const stopNetworkMonitor = () => {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
    }
};
