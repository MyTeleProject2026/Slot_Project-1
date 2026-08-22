import React, { useState, useEffect } from 'react';
import { useCountry } from '../contexts/CountryContext';
import { motion } from 'framer-motion';
import { FaCopy, FaCheck, FaShare, FaUsers } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { copyToClipboard } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Referral = () => {
  const { currency } = useCountry();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralData, setReferralData] = useState({
    totalReferrals: 0,
    earned: 0,
    referralLink: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setReferralData({
        totalReferrals: 0,
        earned: 0,
        referralLink: `${window.location.origin}/register?ref=${user.referralCode || user.id}`,
      });
    }
  }, [isAuthenticated, user]);

  const handleCopy = async () => {
    const success = await copyToClipboard(referralData.referralLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-dark-700/50 text-center">
          <FaUsers className="text-5xl md:text-6xl text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('referral.title')}</h2>
          <p className="text-gray-400 mb-6">{t('profile.loginRequired')}</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all inline-block">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <FaUsers className="text-2xl text-primary-500" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">{t('referral.title')}</h1>
        </div>
        <p className="text-gray-400 mb-4 md:mb-6">{t('referral.subtitle')}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-4 border border-dark-700/30 text-center">
            <p className="text-gray-400 text-sm">{t('referral.totalReferrals')}</p>
            <p className="text-2xl font-bold text-white">{referralData.totalReferrals}</p>
          </div>
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-4 border border-dark-700/30 text-center">
            <p className="text-gray-400 text-sm">{t('referral.earned')}</p>
            <p className="text-2xl font-bold text-primary-500">{referralData.earned} {currency}</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-dark-700/30">
          <p className="text-sm font-medium text-gray-300 mb-2">{t('referral.yourLink')}</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralData.referralLink}
              readOnly
              className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white text-sm focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              {copied ? t('referral.copied') : t('referral.copyLink')}
            </button>
          </div>
        </div>

        {/* Share Button */}
        <button className="mt-4 w-full py-3 bg-dark-800/80 backdrop-blur-sm border border-dark-700/30 rounded-xl text-white hover:bg-dark-700/80 transition-all flex items-center justify-center gap-2">
          <FaShare /> {t('referral.share')}
        </button>

        {referralData.totalReferrals === 0 && (
          <p className="text-center text-gray-400 text-sm mt-4">{t('referral.noReferrals')}</p>
        )}
      </motion.div>
    </div>
  );
};

export default Referral;