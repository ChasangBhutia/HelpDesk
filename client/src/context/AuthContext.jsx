import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/me');
                localStorage.setItem("userId",response.data.data.user._id)
                setUser(response.data.data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [refresh])

    const registerUser = async (userData) => {
        try {
            setError("");
            const response = await api.post('auth/register', userData, {
                headers: { "Idempotency-Key": crypto.randomUUID() }
            })
            setUser(response.data.data.user);
            if(response.data.success){
                setRefresh(refresh+1);
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || "Registration Failed");
            throw err;
        }
    }
    
    const loginUser = async (userData) => {
        try {
            setError("");
            const response = await api.post("/auth/login", userData);
            if(response.data.success) {
                setRefresh(refresh+1);
                navigate('/dashboard')
            };
            setUser(response.data.data.user);
        } catch (err) {
            setError(err.response?.data?.error?.message || "Login Failed");
            throw err;
        }
    }

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, error, loading, registerUser, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    return useContext(AuthContext);
} 