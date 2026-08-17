import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaSearch } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TranslationEditor = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { getLanguages, updateLanguage } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState(null);
  const [translations, setTranslations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLanguage();
  }, [code]);

  const loadLanguage = async () => {
    setLoading(true);
    try {
      const data = await getLanguages();
      const found = data.languages?.find(l => l.code === code);
      if (found) {
        setLanguage(found);
        setTranslations(found.translations || {});
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (key, value) => {
    setTranslations(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLanguage(code, translations);
      toast.success('Translations saved successfully!');
    } catch (error) {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  const filteredKeys = Object.keys(translations).filter(key =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translations[key]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (!language) return <div className="text-center text-gray-400 py-12">Language not found</div>;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/languages')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <FaArrowLeft /> Back to Languages
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Edit Translations: {language.name}
            </h1>
            <p className="text-gray-400">Code: {language.code}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search translations..."
            className="w-full bg-dark-800/80 text-white rounded-xl px-4 py-3 pl-11 border border-dark-700/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Translation List */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
          <div className="divide-y divide-dark-700/50 max-h-[500px] overflow-y-auto">
            {filteredKeys.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No translations found</div>
            ) : (
              filteredKeys.map((key) => (
                <div key={key} className="p-4 flex items-center gap-4 hover:bg-dark-700/30 transition">
                  <div className="w-1/3">
                    <p className="text-sm font-medium text-gray-300">{key}</p>
                  </div>
                  <div className="w-2/3">
                    <input
                      type="text"
                      value={translations[key] || ''}
                      onChange={(e) => handleTranslationChange(key, e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TranslationEditor;
