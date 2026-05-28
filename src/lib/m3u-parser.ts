export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: string;
  group: string;
  playlistName: string;
}

export async function parseM3U(url: string, playlistName: string): Promise<Channel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const text = await response.text();
    
    const lines = text.split(String.fromCharCode(10));
    const channels: Channel[] = [];
    let currentChannel: any = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.indexOf('#EXTINF:') === 0) {
        const lastCommaIndex = line.lastIndexOf(',');
        const namePart = lastCommaIndex !== -1 ? line.substring(lastCommaIndex + 1).trim() : 'Unknown';
        
        let logo = '';
        const logoKey = 'tvg-logo=';
        const logoIdx = line.indexOf(logoKey);
        if (logoIdx !== -1) {
          const start = line.indexOf('"', logoIdx + logoKey.length) + 1;
          const end = line.indexOf('"', start);
          if (start > 0 && end > start) logo = line.substring(start, end);
        }

        let group = '';
        const groupKey = 'group-title=';
        const groupIdx = line.indexOf(groupKey);
        if (groupIdx !== -1) {
          const start = line.indexOf('"', groupIdx + groupKey.length) + 1;
          const end = line.indexOf('"', start);
          if (start > 0 && end > start) group = line.substring(start, end);
        }
        
        currentChannel = {
          name: namePart,
          logo: logo || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(namePart),
          category: group || 'General',
          playlistName: playlistName,
        };
      } else if (line.indexOf('http') === 0) {
        if (currentChannel.name) {
          currentChannel.url = line;
          currentChannel.id = playlistName + '-' + channels.length;
          channels.push(currentChannel);
          currentChannel = {};
        }
      }
    }
    return channels;
  } catch (e) {
    return [];
  }
}