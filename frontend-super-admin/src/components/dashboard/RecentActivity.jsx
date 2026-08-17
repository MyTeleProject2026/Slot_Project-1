import React from 'react';
import { FaUser, FaGamepad, FaMoneyBillWave } from 'react-icons/fa';

const RecentActivity = ({ activities }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'user':
        return <FaUser className="text-primary-500" />;
      case 'game':
        return <FaGamepad className="text-blue-500" />;
      case 'transaction':
        return <FaMoneyBillWave className="text-green-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
        <h3 className="text-white font-medium mb-4">Recent Activity</h3>
        <p className="text-gray-400 text-center">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
      <h3 className="text-white font-medium mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-dark-700/30 rounded-xl">
            <div className="mt-1">{getIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="text-sm text-white">{activity.message}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
