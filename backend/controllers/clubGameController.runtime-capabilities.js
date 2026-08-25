const getRuntimeCapabilities = (game) => {
  const reels = Number(game?.sx ?? game?.reels ?? 0);
  const rows = Number(game?.sy ?? game?.rows ?? 0);
  const lines = Number(game?.ln ?? game?.lnum ?? game?.lines ?? 0);
  const symbolCount = Number(game?.sn ?? game?.symbolCount ?? 0);
  const gameType = Number(game?.gt ?? game?.gameType ?? 1);
  const rtpOptions = Array.isArray(game?.rtp) ? game.rtp : (game?.rtp == null ? [] : [game.rtp]);
  return { gameType, reels, rows, lines, symbolCount, rtpOptions, serverAuthoritative:true, operations:{createSession:true,spin:true,bet:true,collect:true,doubleUp:true,selection:true,mode:true}, renderer:{dynamicGrid:reels>0&&rows>0,provider:String(game?.prov||game?.provider||''),gameId:String(game?.game_id||game?.id||'')} };
};
module.exports = { getRuntimeCapabilities };
