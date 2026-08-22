import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaPalette } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AppearanceSettings = () => {
  const { getSettings, updateSettings } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    primary_color: '#f1c40f',
    secondary_color: '#e67e22',
    background_color: '#0f0f1a',
    text_color: '#ffffff',
    logo_url: '',
    favicon_url: '',
    theme: 'dark',
    layout: 'modern',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings('appearance');
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color, name) => {
    setSettings(prev => ({ ...prev, [name]: color }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('appearance', settings);
      toast.success('Appearance settings saved successfully!');
    } catch (error) {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-6">Appearance Settings</h1>

        <form onSubmit={handleSubmit} className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Theme</label>
            <select
              name="theme"
              value={settings.theme || 'dark'}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Layout Style</label>
            <select
              name="layout"
              value={settings.layout || 'modern'}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primary_color || '#f1c40f'}
                  onChange={(e) => handleColorChange(e.target.value, 'primary_color')}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-dark-600"
                />
                <input
                  type="text"
                  name="primary_color"
                  value={settings.primary_color || '#f1c40f'}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondary_color || '#e67e22'}
                  onChange={(e) => handleColorChange(e.target.value, 'secondary_color')}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-dark-600"
                />
                <input
                  type="text"
                  name="secondary_color"
                  value={settings.secondary_color || '#e67e22'}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.background_color || '#0f0f1a'}
                  onChange={(e) => handleColorChange(e.target.value, 'background_color')}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-dark-600"
                />
                <input
                  type="text"
                  name="background_color"
                  value={settings.background_color || '#0f0f1a'}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.text_color || '#ffffff'}
                  onChange={(e) => handleColorChange(e.target.value, 'text_color')}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-dark-600"
                />
                <input
                  type="text"
                  name="text_color"
                  value={settings.text_color || '#ffffff'}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Logo URL</label>
            <input
              type="url"
              name="logo_url"
              value={settings.logo_url || ''}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Appearance Settings'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AppearanceSettings;
