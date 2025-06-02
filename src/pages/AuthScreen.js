// src/components/AuthScreen.js
import { useState, useEffect, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AuthScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleAuth0Success, currentUser } = useAuth();
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        if (currentUser && location.pathname === '/auth') {
            navigate('/', { replace: true });
            return;
        }

        if (processed) return;

        const processAuth = async () => {
            const params = new URLSearchParams(location.search);
            const queryToken = params.get('token');
            const error = params.get('error');
            
            if (!queryToken && !error && location.pathname === '/') {
                window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth/login?redirectTo=${encodeURIComponent(window.location.origin)}`;
                return;
            }
            
            if (error) {
                window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth/login?redirectTo=${encodeURIComponent(window.location.origin)}`;
                return;
            }
            
            if (queryToken) {
                setProcessed(true);
                
                try {
                    localStorage.setItem('token', queryToken);
                    const response = await getCurrentUser();
                    const userData = response.data.user || response.data;
                    
                    handleAuth0Success(queryToken, userData);
                    window.location.href = '/';
                    
                } catch (error) {
                    localStorage.removeItem('token');
                    setProcessed(false);
                    window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth/login?redirectTo=${encodeURIComponent(window.location.origin)}`;
                }
            } else {
                window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth/login?redirectTo=${encodeURIComponent(window.location.origin)}`;
            }
        };
        
        processAuth();
    }, [location.search, location.pathname, navigate, handleAuth0Success, currentUser, processed]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-60"></div>
                <div className="text-xl text-blue-700 font-medium">
                    {currentUser ? 'Redirecting to dashboard...' : 'Authenticating...'}<span className="animate-pulse">...</span>
                </div>
            </div>
        </div>
    );
};

export default memo(AuthScreen);