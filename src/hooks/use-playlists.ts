import { useState, useEffect, useCallback } from 'react';
import { parseM3U, Channel } from '../lib/m3u-parser';

const PLAYLISTS = {
  roku: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/refs/heads/main/playlists/roku_all.m3u',
  tubi: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/refs/heads/main/playlists/tubi_all.m3u',
  free: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8'
};

export function usePlaylists() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<keyof typeof PLAYLISTS>('roku');

  const fetchPlaylist = useCallback(async (key: keyof typeof PLAYLISTS) => {
    setLoading(true);
    setError(null);
    try {
      const data = await parseM3U(PLAYLISTS[key], key.toUpperCase());
      setChannels(data);
    } catch (err) {
      setError('Failed to load channels. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylist(activePlaylist);
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(() => {
      fetchPlaylist(activePlaylist);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activePlaylist, fetchPlaylist]);

  return { channels, loading, error, activePlaylist, setActivePlaylist, refresh: () => fetchPlaylist(activePlaylist) };
}