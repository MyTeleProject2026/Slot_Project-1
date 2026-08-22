import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', prefix = '' }) => {
  const colorClasses = {
    primary: 'bg-primary-500/10 border-primary-500/30 text-primary-500',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
    green: 'bg-green-500/10 border-green-500/30 text-green-500',
    red: 'bg-red-500/10 border-red-500/30 text-red-500',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-500',
  };

  return (
    <motion.div
      className={`rounded-xl p-4 border ${colorClasses[color]} backdrop-blur-sm`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
        <Icon className="text-3xl opacity-50" />
      </div>
    </motion.div>
  );
};

export default StatsCard;
