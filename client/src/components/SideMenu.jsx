import React from 'react'
import { LayoutDashboard, Ticket, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const SideMenu = () => {
    const { user, logout } = useAuthContext();

    const handleLogout = () => {
        logout();
    };

    // Get initials from user's name
    const getInitials = (name) => {
        if (!name) return "U";
        const names = name.split(" ");
        return names.length === 1
            ? names[0].charAt(0).toUpperCase()
            : names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    };

    // Badge color based on role
    const roleColor = {
        admin: 'bg-red-500',
        agent: 'bg-blue-500',
        user: 'bg-green-500'
    }[user.role] || 'bg-gray-500';

    return (
        <nav className='bg-white text-black rounded-tl-xl rounded-bl-xl flex flex-col gap-3 h-full pt-3 mr-1'>
            <h1 className='text-2xl poppins px-3'>HelpDesk</h1>

            <div className='text-3xl font-semibold px-3'>
                <p className='poppins'>Hello <span className='text-blue-600'>{user.fullname}</span> 👋</p>
            </div>

            <div className='mt-5 px-3'>
                <p className='ml-3 text-gray-400 poppins mb-2'>Menu</p>
                <ul className='flex flex-col text-gray-800'>
                    <Link to="/dashboard">
                        <li className='rounded-xl hover:bg-blue-500 hover:text-white pl-3 hover:pl-6 duration-300 py-3 flex gap-3 cursor-pointer'>
                            <LayoutDashboard />
                            <p className='poppins'>Dashboard</p>
                        </li>
                    </Link>

                    {user.role === 'user' && (
                        <>
                            <Link to="/ticket-lists">
                                <li className='rounded-xl hover:bg-blue-500 hover:text-white pl-3 hover:pl-6 duration-300 py-3 flex gap-3 cursor-pointer'>
                                    <Ticket />
                                    <p className='poppins'>My Tickets</p>
                                </li>
                            </Link>
                            <Link to="/add-ticket">
                                <li className='rounded-xl hover:bg-blue-500 hover:text-white pl-3 hover:pl-6 duration-300 py-3 flex gap-3 cursor-pointer'>
                                    <Plus />
                                    <p className='poppins'>Add Ticket</p>
                                </li>
                            </Link>
                        </>
                    )}

                    {user.role !== 'user' && (
                        <Link to="/ticket-lists">
                            <li className='rounded-xl hover:bg-blue-500 hover:text-white pl-3 hover:pl-6 duration-300 py-3 flex gap-3 cursor-pointer'>
                                <Ticket />
                                <p className='poppins'>All Tickets</p>
                            </li>
                        </Link>

                    )}
                    {user.role === 'agent' && (
                        <Link to="/assigned-tickets">
                            <li className='rounded-xl hover:bg-blue-500 hover:text-white pl-3 hover:pl-6 duration-300 py-3 flex gap-3 cursor-pointer'>
                                <Ticket />
                                <p className='poppins'>Assigned Tickets</p>
                            </li>
                        </Link>
                    )}

                    <Link to="/resolved-tickets">
                        <li className='rounded-xl hover:bg-blue-500 hover:text-white pl-3 hover:pl-6 duration-300 py-3 flex gap-3 cursor-pointer'>
                            <Ticket />
                            <p className='poppins'>Resolved Tickets</p>
                        </li>
                    </Link>
                </ul>
            </div>

            {/* Profile section */}
            <div className='mt-auto border-t-2 border-zinc-300'>
                <div className='w-full p-2 rounded-bl-xl flex flex-col items-center justify-between'>
                    <div className='flex gap-2 items-center'>
                        {user.image ? (
                            <img className='h-7 w-7 rounded-full' src={user.image} alt={user.fullname} />
                        ) : (
                            <div className='h-7 w-7 rounded-full bg-blue-400 text-white flex items-center justify-center text-xs font-semibold'>
                                {getInitials(user.fullname)}
                            </div>
                        )}
                        <div className='flex flex-col'>
                            <h3 className='flex items-center gap-2'>
                                {user.fullname}
                                <span className={`text-xs text-white px-2 py-0.5 rounded-full ${roleColor}`}>
                                    {user.role.toUpperCase()}
                                </span>
                            </h3>
                            <p className='text-sm text-zinc-600'>{user.email}</p>
                        </div>
                    </div>
                </div>

                <button
                    className='poppins w-full h-12 bg-gray-900 text-white hover:bg-gray-700 mt-2'
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default SideMenu;
