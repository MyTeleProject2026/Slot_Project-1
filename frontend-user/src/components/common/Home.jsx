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
  const { games, loading, fetchGames } = useGames();
  const [featured, setFeatured] = useState([]);
  const [hot, setHot] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        await fetchGames();
      } catch (err) {
        console.error('Failed to load games:', err);
        setError('Unable to load games. Please try again later.');
      }
    };
    loadGames();
  }, [fetchGames]);

  useEffect(() => {
    if (games && games.length) {
      setFeatured(games.filter(g => g.is_popular).slice(0, 10));
      setHot(games.filter(g => g.is_hot).slice(0, 8));
    }
  }, [games]);

  const banners = [
    { 
      id: 1, 
      title: 'Welcome Bonus', 
      subtitle: 'Get 100% up to 5,000 THB', 
      color: 'from-purple-600 via-pink-600 to-red-600', 
      link: '/promotions',
      buttonText: 'Claim Now'
    },
    { 
      id: 2, 
      title: 'Daily Cashback', 
      subtitle: 'Get 5% cashback every day', 
      color: 'from-blue-600 via-cyan-600 to-teal-600', 
      link: '/promotions',
      buttonText: 'Learn More'
    },
    { 
      id: 3, 
      title: 'Slot Tournament', 
      subtitle: 'Win up to 100,000 THB', 
      color: 'from-orange-600 via-yellow-600 to-red-600', 
      link: '/games/slots',
      buttonText: 'Join Now'
    },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto px-3 py-4 pb-20 md:pb-10">
      {/* Banner Carousel */}
      <motion.div 
        className="mb-6 -mx-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Swiper 
          modules={[Autoplay, Pagination, EffectFade]} 
          autoplay={{ delay: 4000, disableOnInteraction: false }} 
          pagination={{ clickable: true }} 
          effect="fade" 
          className="h-44 md:h-60 rounded-2xl overflow-hidden shadow-2xl"
        >
          {banners.map((b) => (
            <SwiperSlide key={b.id}>
              <div className={`w-full h-full bg-gradient-to-r ${b.color} p-6 md:p-8 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h2 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg">{b.title}</h2>
                  <p className="text-white/90 text-sm md:text-base mt-1 drop-shadow">{b.subtitle}</p>
                </div>
                <Link 
                  to={b.link} 
                  className="self-start px-6 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all shadow-lg flex items-center gap-2 relative z-10"
                >
                  {b.buttonText} <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* Quick Categories */}
      <motion.div 
        className="grid grid-cols-4 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {[
          { icon: FaFire, label: 'Hot Games', color: 'text-red-500', bg: 'bg-red-500/10', link: '/games?filter=hot' },
          { icon: FaCrown, label: 'VIP', color: 'text-yellow-500', bg: 'bg-yellow-500/10', link: '/vip' },
          { icon: FaGamepad, label: 'Slots', color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/games/slots' },
          { icon: FaGift, label: 'Bonuses', color: 'text-green-500', bg: 'bg-green-500/10', link: '/promotions' },
        ].map((item, idx) => (
          <Link 
            key={idx} 
            to={item.link} 
            className={`flex flex-col items-center gap-1 p-3 bg-dark-800/80 backdrop-blur-sm rounded-xl hover:bg-dark-700/80 transition-all hover:scale-105 hover:shadow-xl border border-dark-700/30`}
          >
            <div className={`p-2 rounded-full ${item.bg}`}>
              <item.icon className={`text-2xl ${item.color}`} />
            </div>
            <span className="text-xs font-medium text-gray-300">{item.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* Hot Games */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-white">
            <FaFire className="text-red-500 animate-pulse" /> 
            Hot Games
          </h2>
          <Link to="/games" className="text-sm text-primary-500 hover:text-primary-400 transition-all flex items-center gap-1">
            View All <FaArrowRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {hot.length > 0 ? 
            hot.slice(0, 6).map(game => <GameCard key={game.id} game={game} />) : 
            <p className="text-gray-400 col-span-full text-center py-4">No hot games available</p>
          }
        </div>
      </motion.div>

      {/* Featured */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-white">
            <FaCrown className="text-yellow-500" /> 
            Featured Games
          </h2>
          <Link to="/games" className="text-sm text-primary-500 hover:text-primary-400 transition-all flex items-center gap-1">
            View All <FaArrowRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {featured.length > 0 ? 
            featured.slice(0, 6).map(game => <GameCard key={game.id} game={game} />) : 
            <p className="text-gray-400 col-span-full text-center py-4">No featured games available</p>
          }
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
