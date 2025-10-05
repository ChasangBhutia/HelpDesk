// src/pages/AuthPage.jsx
import React, { useEffect, useState } from "react";
import RoleSelect from "../components/Auth/RoleSelect";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import { useParams } from "react-router-dom";
import AuthNavbar from "../components/Auth/AuthNavbar";

const AuthPage = () => {

    const { type } = useParams();
    const [authType, setAuthType] = useState(type || 'login');
    useEffect(()=>{
        setAuthType(type);
    },[type])
    const [selectedRole, setSelectedRole] = useState("user");
    const [openForm, setOpenForm] = useState(false);
    
    return (
        <div>

            <AuthNavbar />
            <div className="flex flex-col items-center justify-center bg-gray-50">
                {!openForm && <RoleSelect setOpenForm={setOpenForm} authType={authType} role={authType} setAuthType={setAuthType} selectedRole={selectedRole} setSelectedRole={setSelectedRole} />}

                {(openForm && authType === 'login') && (
                    <LoginForm role={selectedRole} />
                )}
                {(openForm && authType === 'register') && (
                    <RegisterForm role={selectedRole} />
                )}

            </div>
        </div>
    );
};

export default AuthPage;
