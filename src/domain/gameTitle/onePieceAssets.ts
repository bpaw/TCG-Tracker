import { OnePieceColor } from './onePiece';

// Map leader names to their image assets
const LEADER_IMAGES: Record<string, any> = {
  'Monkey D. Luffy': require('../../../assets/leader_icons/luffy_leader.png'),
  'Reiju': require('../../../assets/leader_icons/reiju_leader.png'),
};

// Default image for unknown leaders
const DEFAULT_LEADER_IMAGE = require('../../../assets/icon.png'); // Using app icon as question mark placeholder

// Map One Piece colors to border color values
const COLOR_MAP: Record<string, string> = {
  [OnePieceColor.Red]: '#DC143C',      // Crimson
  [OnePieceColor.Green]: '#228B22',    // Forest Green
  [OnePieceColor.Blue]: '#4169E1',     // Royal Blue
  [OnePieceColor.Purple]: '#8B008B',   // Dark Magenta
  [OnePieceColor.Black]: '#2F2F2F',    // Dark Gray (pure black would be invisible on dark backgrounds)
  [OnePieceColor.Yellow]: '#FFD700',   // Gold
};

/**
 * Get the image asset for a leader
 */
export function getLeaderImage(leaderName: string | undefined): any {
  if (!leaderName) {
    return DEFAULT_LEADER_IMAGE;
  }
  return LEADER_IMAGES[leaderName] || DEFAULT_LEADER_IMAGE;
}

/**
 * Get the border color for a One Piece color
 */
export function getColorBorderColor(color: string | undefined): string {
  if (!color) {
    return '#8E8E93'; // Gray for unknown
  }
  return COLOR_MAP[color] || '#8E8E93';
}
