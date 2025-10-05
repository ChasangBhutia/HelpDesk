// src/components/Auth/RoleSelect.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelect = ({ setOpenForm, authType, setAuthType, selectedRole, setSelectedRole }) => {
    console.log(authType);
    
    const navigate = useNavigate();
    const roles = [
        { label: "Agent", value: "agent", description: "Manage tickets, assign tickets, and resolve customer issues" },
        { label: "User", value: "user", description: "Access your tickets, submit requests, and track status" },
    ];

    const handleAuthChange = () => {
        if (authType === 'login') setAuthType('register');
        else setAuthType('login');
    }

    

    return (
        <div className="h-[92vh] w-full flex flex-col items-center p-2 gap-3">
            <div className="flex flex-col items-center md:gap-5 md:flex-row md:justify-center md:mt-20 w-full md:w-[80%] md:mx-auto">
                {
                    roles.map(r => (
                        <div key={r.label} className="flex flex-col gap-3 text-center w-[80%] md:w-[350px] mt-10 lg:w-[500px] lg:mt-10">
                            {r.label === "Agent" && <p className="bg-black w-20 m-auto text-white rounded-xl text-sm py-1 text-center">Agent</p>}
                            <h2 className="text-2xl md:text-3xl">{authType === 'login' ? "Login" : "Register"} as {r.label}</h2>
                            <p className="lg:text-lg">{r.description}</p>

                            <button onClick={() => { setOpenForm(true); setSelectedRole(r.value); navigate(`/auth/${authType === 'login' ? 'login' : 'register'}`) }} className="bg-zinc-800 text-white p-2 w-50 m-auto rounded-xl">{authType === 'login' ? 'Login' : 'Register'}</button>

                        </div>
                    ))
                }
            </div>
            <div className="text-center md:mt-20 lg:mt-30">
                <p>{authType === 'login' ? "Don't have" : "Have"} an account?</p>
                <button className="text-blue-700" onClick={handleAuthChange}>{authType === 'login' ? "Signup" : "Login"}</button>
            </div>
        </div>
    );
};

export default RoleSelect;
