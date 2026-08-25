import { useContext } from 'react';
import GameContext from '../contexts/GameContext';

const EMPTY_CAPABILITIES = Object.freeze({
  reels: 0,
  rows: 0,
  lines: 0,
  symbols: 0,
  gameType: 'slot',
  rtp: [],
  features: Object.freeze({
    spin: true,
    bet: true,
    lines: false,
    autoplay: false,
    quickSpin: false,
    collect: false,
    doubleUp: false,
    freeSpins: false,
    cascade: false,
    multiplier: false,
  }),
  renderer: Object.freeze({ type: 'slot-reels', theme: 'n999bet-original' }),
});

const EMPTY_ACTION = async () => null;
const EMPTY_LIST = async () => [];

export const useGames = () => {
  const context = useContext(GameContext);
  if (!context) {
    return {
      games: [], providers: [], categories: [], loading: false, favorites: [],
      activeGame: null, error: null, capabilities: EMPTY_CAPABILITIES,
      gameCapabilities: EMPTY_CAPABILITIES, fetchGames: EMPTY_LIST,
      fetchProviders: EMPTY_LIST, searchGames: EMPTY_LIST,
      getGamesByProvider: EMPTY_LIST, getGamesByCategory: EMPTY_LIST,
      getGameCapabilities: async () => EMPTY_CAPABILITIES,
      startGame: EMPTY_ACTION, spin: EMPTY_ACTION, collectWin: EMPTY_ACTION,
      toggleFavorite: () => {}, isFavorite: () => false, setActiveGame: () => {},
    };
  }

  // Compatibility guard: an older GameContext must never make a game page
  // call Array/Object methods on undefined during its first render.
  const capabilities = context.capabilities || context.gameCapabilities || EMPTY_CAPABILITIES;

  return {
    ...context,
    capabilities,
    gameCapabilities: context.gameCapabilities || capabilities,
    getGameCapabilities: context.getGameCapabilities || (async () => capabilities),
    games: Array.isArray(context.games) ? context.games : [],
    providers: Array.isArray(context.providers) ? context.providers : [],
    categories: Array.isArray(context.categories) ? context.categories : [],
    favorites: Array.isArray(context.favorites) ? context.favorites : [],
  };
};

export default useGames;
