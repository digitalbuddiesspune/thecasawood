import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onSuccess, onError, text = "Continue with Google" }) => {
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => onSuccess(tokenResponse),
        onError: (error) => {
            console.error('Login Failed:', error);
            if (onError) onError(error);
        },
        // We request 'auth-code' flow usually for backend verification, usually obtaining an 'access_token' or 'id_token' is simpler for implicit.
        // However, @react-oauth/google by default returns an access token if flow is implicit (default).
        // For backend verification, we often want the 'credential' (id_token) which comes from the GoogleLogin component, OR we can fetch user info using access token.
        // The GoogleLogin component returns a credential string (JWT). useGoogleLogin returns an access_token.
        // To verify in backend easily with google-auth-library, passing the id_token (credential) is preferred.
        // BUT useGoogleLogin does NOT return an id_token unless 'flow' is 'auth-code' (returns code) or we use the GoogleLogin component.
        // Actually, let's use the standard component wrapper to keep it standard, OR just fetch the user profile in frontend and send to backend.
        // Better: Send access_token to backend, backend uses it to fetch user info from Google UserInfo endpoint.
    });

    return (
        <button
            type="button"
            onClick={() => login()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all mt-4"
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
            {text}
        </button>
    );
};

export default GoogleLoginButton;
