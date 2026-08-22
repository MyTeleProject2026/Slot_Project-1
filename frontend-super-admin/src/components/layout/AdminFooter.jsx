import React from 'react';

const AdminFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-dark-800/50 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {year} FattBet Super Admin. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
