import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaGamepad, FaSearch } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GameList = () => {
  const navigate = useNavigate();
  const { getGames, deleteGame } = useAdmin();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await getGames({ search });
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(gameId);
        loadGames();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'provider_name', label: 'Provider' },
    { key: 'category', label: 'Category' },
    { key: 'rtp', label: 'RTP', render: (value) => `${value}%` },
    { key: 'max_multiplier', label: 'Max Multiplier', render: (value) => `${value}x` },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'active' ? 'bg-green-500/20 text-green-400' :
          value === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/games/${row.id}/edit`)}
            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
            title="Edit Game"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            onClick={() => navigate(`/games/${row.id}/control`)}
            className="p-1.5 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition"
            title="Game Control"
          >
            <FaGamepad className="text-xs" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            title="Delete Game"
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
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Games</h1>
            <p className="text-gray-400">Manage all games</p>
          </div>
          <button
            onClick={() => navigate('/games/add')}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2"
          >
            <FaPlus /> Add Game
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-dark-800/80 text-white rounded-xl px-4 py-3 pl-11 border border-dark-700/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Table */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
          <DataTable
            columns={columns}
            data={games}
            loading={loading}
            onRowClick={(row) => navigate(`/games/${row.id}/edit`)}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default GameList;
