import { useContext } from 'react';
import GameContext from '../contexts/GameContext';

export const useGames = () => {
  const context = useContext(GameContext);
  if (!context) {
    return {
      games: [],
      providers: [],
      categories: [],
      loading: false,
      favorites: [],
      activeGame: null,
      error: null,
      fetchGames: async () => [],
      fetchProviders: async () => [],
      searchGames: async () => [],
      getGamesByProvider: async () => [],
      getGamesByCategory: async () => [],
      startGame: async () => null,
      spin: async () => null,
      collectWin: async () => null,
      toggleFavorite: () => {},
      isFavorite: () => false,
      setActiveGame: () => {},
    };
  }
  return context;
};

export default useGames;
