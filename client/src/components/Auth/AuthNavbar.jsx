import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const AuthNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthContext();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="border-b border-zinc-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-2">
        <div className="flex justify-between h-[8vh] items-center">
          {/* Logo */}
          <Link to="/dashboard" className="text-xl font-bold">
            HelpDesk
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>

            {user?.role === "agent" || user?.role === "admin" ? (
              <Link to="/assignments" className="hover:underline">
                Assignments
              </Link>
            ) : null}

            {user?.role === "admin" ? (
              <Link to="/users" className="hover:underline">
                Users
              </Link>
            ) : null}

            {user ? (
              <>
                <span className="px-3 py-1 rounded">{user.fullname}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
                <Link to="/register" className="hover:underline">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="focus:outline-none">
              {isOpen ? (
                <span className="text-2xl">&#10005;</span> // X icon
              ) : (
                <span className="text-2xl">&#9776;</span> // Hamburger icon
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 py-2 space-y-2">
          <Link to="/tickets" className="block hover:underline" onClick={toggleMenu}>
            Tickets
          </Link>

          {user?.role === "agent" || user?.role === "admin" ? (
            <Link to="/assignments" className="block hover:underline" onClick={toggleMenu}>
              Assignments
            </Link>
          ) : null}

          {user?.role === "admin" ? (
            <Link to="/users" className="block hover:underline" onClick={toggleMenu}>
              Users
            </Link>
          ) : null}

          {user ? (
            <>
              <span className="block px-3 py-1 bg-blue-800 rounded">{user.fullname}</span>
              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="block w-full text-left bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block hover:underline" onClick={toggleMenu}>
                Login
              </Link>
              <Link to="/register" className="block hover:underline" onClick={toggleMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default AuthNavbar;
