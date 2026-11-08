import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DevConnectWelcome from '../components/devconnect/DevConnectWelcome';
import '../components/styles/DevConnect.css';

function DevConnect() {
    const { currentUser } = useAuth();

    const [showWelcome, setShowWelcome] = useState(true);

    const handleContinue = () => {
        setShowWelcome(false);
    };

    const username = currentUser?.username || currentUser?.fullName || 'Developer';

    return (
        <div className="devconnect-page">

            {showWelcome ? (
                <DevConnectWelcome
                    username={username}
                    onContinue={handleContinue}
                />
            ) : (
                <div className="devconnect-main">
                    <h1>Welcome to DevConnect!</h1>
                    <p>Connect with developers and build something extraordinary.</p>
                </div>
            )}

        </div>
    );
}

export default DevConnect;