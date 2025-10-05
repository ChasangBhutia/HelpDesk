import React, { useEffect, useState } from "react";
import { useTicketContext } from "../../context/TicketContext";

const AllUsersList = () => {
  const {
    users,
    fetchUsers,
    userOffset,
    userNextOffset,
    usersLoading,
  } = useTicketContext();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers(0);
    setPage(1);
  }, [fetchUsers]);

  const handleNext = () => {
    if (userNextOffset !== null) {
      fetchUsers(userNextOffset);
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    const prevOffset = Math.max(userOffset - 10, 0);
    fetchUsers(prevOffset);
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.length === 1
      ? names[0].charAt(0).toUpperCase()
      : names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  };

  // Filter by search query
  const filteredUsers = users.filter((user) =>
    user.fullname.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">S.No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user._id}>
                  <td className="px-4 py-3">{userOffset + index + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullname}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-400 text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(user.fullname)}
                      </div>
                    )}
                    {user.fullname}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">user</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">Page {page}</span>
        <button
          onClick={handleNext}
          disabled={userNextOffset === null}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllUsersList;
