import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaCrown, FaGamepad, FaGift } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
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
    { id: 1, title: 'Welcome Bonus', subtitle: 'Get 100% up to 5,000 THB', color: 'from-purple-600 to-pink-600', link: '/promotions' },
    { id: 2, title: 'Daily Cashback', subtitle: 'Get 5% cashback every day', color: 'from-blue-600 to-cyan-600', link: '/promotions' },
    { id: 3, title: 'Slot Tournament', subtitle: 'Win up to 100,000 THB', color: 'from-orange-600 to-red-600', link: '/games/slots' },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  // Ensure games is an array even if empty
  const safeGames = games || [];

  return (
    <div className="container mx-auto px-3 py-4 pb-20 md:pb-10">
      {/* Banner Carousel */}
      <div className="mb-6 -mx-3">
        <Swiper modules={[Autoplay, Pagination, EffectFade]} autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }} effect="fade" className="h-40 md:h-56 rounded-lg overflow-hidden">
          {banners.map(b => (
            <SwiperSlide key={b.id}>
              <div className={`w-full h-full bg-gradient-to-r ${b.color} p-6 flex flex-col justify-between`}>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{b.title}</h2>
                  <p className="text-white/90 text-sm md:text-base mt-1">{b.subtitle}</p>
                </div>
                <Link to={b.link} className="self-start px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition">
                  Claim Now
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Quick Categories */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: FaFire, label: 'Hot Games', color: 'text-red-500', link: '/games?filter=hot' },
          { icon: FaCrown, label: 'VIP', color: 'text-yellow-500', link: '/vip' },
          { icon: FaGamepad, label: 'Slots', color: 'text-blue-500', link: '/games/slots' },
          { icon: FaGift, label: 'Bonuses', color: 'text-green-500', link: '/promotions' },
        ].map((item, idx) => (
          <Link key={idx} to={item.link} className="flex flex-col items-center gap-1 p-3 bg-dark-800 rounded-xl hover:bg-dark-700 transition">
            <item.icon className={`text-2xl ${item.color}`} />
            <span className="text-xs font-medium text-gray-300">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Hot Games */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2"><FaFire className="text-red-500" /> Hot Games</h2>
          <Link to="/games" className="text-sm text-primary-500 hover:text-primary-400">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {hot.length > 0 ? hot.slice(0, 6).map(game => <GameCard key={game.id} game={game} />) : <p className="text-gray-400 col-span-full">No hot games available</p>}
        </div>
      </div>

      {/* Featured */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2"><FaCrown className="text-yellow-500" /> Featured Games</h2>
          <Link to="/games" className="text-sm text-primary-500 hover:text-primary-400">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {featured.length > 0 ? featured.slice(0, 6).map(game => <GameCard key={game.id} game={game} />) : <p className="text-gray-400 col-span-full">No featured games available</p>}
        </div>
      </div>
    </div>
  );
};

export default Home;
