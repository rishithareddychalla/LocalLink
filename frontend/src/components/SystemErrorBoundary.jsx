import React from 'react';
import SystemError from '../pages/SystemError';

class SystemErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("System crash detected by Boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <SystemError
                    errorCode="FE-RUNTIME-CRASH"
                    trace={this.state.error?.message || "Unexpected frontend exception"}
                />
            );
        }

        return this.props.children;
    }
}

export default SystemErrorBoundary;
