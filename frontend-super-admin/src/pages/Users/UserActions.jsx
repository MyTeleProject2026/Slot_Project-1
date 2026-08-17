import React from 'react';
import { FaBan, FaCheck, FaTrash } from 'react-icons/fa';

const UserActions = ({ user, onStatusChange, onDelete }) => {
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onStatusChange(user.id, user.status)}
        className={`p-2 rounded-lg transition ${
          user.status === 'active'
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
        }`}
        title={user.status === 'active' ? 'Block User' : 'Activate User'}
      >
        {user.status === 'active' ? <FaBan /> : <FaCheck />}
      </button>
      <button
        onClick={() => onDelete(user.id)}
        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
        title="Delete User"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default UserActions;
