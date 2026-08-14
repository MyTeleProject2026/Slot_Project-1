import { useContext } from 'react';
import GameContext from '../contexts/GameContext';

export const useGames = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGames must be used within GameProvider');
  return context;
};

export default useGames;