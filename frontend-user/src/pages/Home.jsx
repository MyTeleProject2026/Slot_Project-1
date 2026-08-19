import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaCrown, FaGamepad, FaGift, FaArrowRight } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { motion } from 'framer-motion';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const { games, loading, fetchGames, error } = useGames();
  const [hotGames, setHotGames] = useState([]);
  const [vipGames, setVipGames] = useState([]);
  const [slotGames, setSlotGames] = useState([]);
  const [bonusGames, setBonusGames] = useState([]);
  const [activeTab, setActiveTab] = useState('hot');

  useEffect(() => {
    const loadGames = async () => {
      try {
        await fetchGames();
      } catch (err) {
        console.error('Failed to load games:', err);
      }
    };
    loadGames();
  }, [fetchGames]);

  useEffect(() => {
    if (!games || games.length === 0) return;

    // Hot: first 8 games or high RTP
    const sorted = [...games].sort((a, b) => {
      const aRtp = a.rtp && a.rtp.length > 0 ? a.rtp[a.rtp.length - 1] : 0;
      const bRtp = b.rtp && b.rtp.length > 0 ? b.rtp[b.rtp.length - 1] : 0;
      return bRtp - aRtp;
    });
    setHotGames(sorted.slice(0, 8));

    // VIP: games with high RTP (>97%)
    const vip = games.filter(g => {
      const rtp = g.rtp && g.rtp.length > 0 ? g.rtp[g.rtp.length - 1] : 0;
      return rtp > 97;
    }).slice(0, 8);
    setVipGames(vip);

    // Slots: category = slots
    const slots = games.filter(g => g.category === 'slots').slice(0, 8);
    setSlotGames(slots);

    // Bonus: games with multiple aliases (bonus features)
    const bonus = games.filter(g => g.aliases && g.aliases.length > 1).slice(0, 8);
    setBonusGames(bonus);
  }, [games]);

  const renderGames = () => {
    let displayGames = [];
    switch (activeTab) {
      case 'hot': displayGames = hotGames; break;
      case 'vip': displayGames = vipGames; break;
      case 'slots': displayGames = slotGames; break;
      case 'bonus': displayGames = bonusGames; break;
      default: displayGames = hotGames;
    }
    return displayGames;
  };

  const tabs = [
    { id: 'hot', label: '🔥 Hot Games' },
    { id: 'vip', label: '👑 VIP' },
    { id: 'slots', label: '🎰 Slots' },
    { id: 'bonus', label: '🎁 Bonuses' },
  ];

  const banners = [
    { id: 1, title: 'Welcome Bonus', subtitle: 'Get 100% up to 5,000 THB', color: 'from-purple-600 via-pink-600 to-red-600', link: '/promotions', buttonText: 'Claim Now' },
    { id: 2, title: 'Daily Cashback', subtitle: 'Get 5% cashback every day', color: 'from-blue-600 via-cyan-600 to-teal-600', link: '/promotions', buttonText: 'Learn More' },
    { id: 3, title: 'Slot Tournament', subtitle: 'Win up to 100,000 THB', color: 'from-orange-600 via-yellow-600 to-red-600', link: '/games', buttonText: 'Join Now' },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-400 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayGames = renderGames();

  return (
    <div className="w-full">
      {/* Banner Carousel */}
      <motion.div className="w-full mb-6 -mx-4 px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Swiper modules={[Autoplay, Pagination, EffectFade]} autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }} effect="fade" className="banner-height rounded-2xl overflow-hidden shadow-2xl">
          {banners.map((b) => (
            <SwiperSlide key={b.id}>
              <div className={`w-full h-full bg-gradient-to-r ${b.color} p-6 md:p-8 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h2 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg">{b.title}</h2>
                  <p className="text-white/90 text-sm md:text-base mt-1 drop-shadow">{b.subtitle}</p>
                </div>
                <Link to={b.link} className="self-start px-6 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all shadow-lg flex items-center gap-2 relative z-10">
                  {b.buttonText} <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* Quick Categories */}
      <motion.div className="grid grid-cols-4 gap-3 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        {[
          { icon: FaFire, label: 'Hot Games', link: '#', tab: 'hot' },
          { icon: FaCrown, label: 'VIP', link: '#', tab: 'vip' },
          { icon: FaGamepad, label: 'Slots', link: '#', tab: 'slots' },
          { icon: FaGift, label: 'Bonuses', link: '#', tab: 'bonus' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-105 border ${
              activeTab === item.tab
                ? 'bg-primary-500/20 border-primary-500/50 shadow-lg shadow-primary-500/25'
                : 'bg-dark-800/80 backdrop-blur-sm hover:bg-dark-700/80 border-dark-700/30'
            }`}
          >
            <div className={`p-2 rounded-full ${activeTab === item.tab ? 'bg-primary-500/30' : 'bg-dark-700/50'}`}>
              <item.icon className={`text-2xl ${activeTab === item.tab ? 'text-primary-500' : 'text-gray-400'}`} />
            </div>
            <span className={`text-xs font-medium ${activeTab === item.tab ? 'text-primary-500' : 'text-gray-300'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Tab Games Grid */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold text-white">
            {tabs.find(t => t.id === activeTab)?.label || 'Games'}
          </h2>
          <Link to="/games" className="text-sm text-primary-500 hover:text-primary-400 transition-all flex items-center gap-1">
            View All <FaArrowRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayGames.length > 0 ? (
            displayGames.map(game => <GameCard key={game.id} game={game} />)
          ) : (
            <p className="text-gray-400 col-span-full text-center py-4">No games available in this category</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
