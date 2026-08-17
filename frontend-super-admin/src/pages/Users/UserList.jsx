import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaBan, FaCheck } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const UserList = () => {
  const navigate = useNavigate();
  const { getUsers, updateUserStatus, deleteUser } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers({ search });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'block'} this user?`)) {
      try {
        await updateUserStatus(userId, newStatus);
        loadUsers();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        loadUsers();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'full_name', label: 'Full Name' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'active' ? 'bg-green-500/20 text-green-400' :
          value === 'blocked' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (value) => `฿${value?.toFixed(2) || '0.00'}`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/users/${row.id}`)}
            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
            title="View Details"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            onClick={() => handleStatusToggle(row.id, row.status)}
            className={`p-1.5 rounded-lg transition ${
              row.status === 'active'
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
            title={row.status === 'active' ? 'Block User' : 'Activate User'}
          >
            {row.status === 'active' ? <FaBan className="text-xs" /> : <FaCheck className="text-xs" />}
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            title="Delete User"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Users</h1>
            <p className="text-gray-400">Manage all users</p>
          </div>
          <button
            onClick={() => navigate('/users/add')}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2"
          >
            <FaUserPlus /> Add User
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-dark-800/80 text-white rounded-xl px-4 py-3 pl-11 border border-dark-700/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </form>

        {/* Table */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            onRowClick={(row) => navigate(`/users/${row.id}`)}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default UserList;
