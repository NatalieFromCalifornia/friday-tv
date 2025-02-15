// Import required dependencies
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Play, Pause, SkipForward, Volume1, Volume2 } from 'lucide-react';

// Interface for shadow styles
interface ShadowStyle extends React.CSSProperties {
  boxShadow?: string;
  textShadow?: string;
  zIndex: number;
}

// Main VideoPlayer component
const VideoPlayer: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Update container width on mount and window resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // YouTube playlist ID - replace with your own
  const PLAYLIST_ID = 'PLGuEiIpCwgO1N8uHEq-v88e0_PPDhQJEu';
  
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(5.0);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [playedVideos, setPlayedVideos] = useState<string[]>([]);

  // Initialize YouTube API
  useEffect(() => {
    if (window.YT) {
      initializePlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initializePlayer;
    }
  }, []);

  // Initialize YouTube player
  const initializePlayer = (): void => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    const height = (width * 9) / 16;

    // Create new player instance
    new window.YT.Player('youtube-player', {
      height: String(height),
      width: String(width),
      playerVars: {
        listType: 'playlist',
        list: PLAYLIST_ID,
        controls: 0,
        showinfo: 0, 
        rel: 0,
        fs: 0,
        disablekb: 1,
        playsinline: 1,
        autoplay: 0,
        cc_load_policy: 0,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          setPlayer(event.target);
          event.target.setVolume(volume * 10);
          playRandomVideo(event.target)
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
        }
      }
    });
  };

  const playRandomVideo = (playerInstance: YT.Player | null = player): void => {
    if(playerInstance){
      const playlist = playerInstance.getPlaylist();
      if(playlist){
        let availableVideos = playlist.filter(videoId => !playedVideos.includes(videoId));

        //reset playedVideos array once all had been played
        if(availableVideos.length === 0){
          setPlayedVideos([]);
          availableVideos = playlist;
        }

        //select random vid from available vids
        const randomIndex = Math.floor(Math.random() * availableVideos.length);
        const selectedVideoId = availableVideos[randomIndex];

        const playlistIndex = playlist.indexOf(selectedVideoId)
        playerInstance.playVideoAt(playlistIndex);
        setPlayedVideos(prev => [...prev, selectedVideoId]);
      }
    }
  }

  // Toggle video play/pause
  const togglePlayPause = (): void => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  // Adjust volume level
  const adjustVolume = (amount: number): void => {
    const newVolume = parseFloat((volume + amount).toFixed(1));
    const clampedVolume = Math.min(Math.max(newVolume, 0), 10);
    setVolume(clampedVolume);
    if (player) {
      player.setVolume(clampedVolume * 10);
    }
  };

  // Define shadow styles
  const titleShadowStyle: ShadowStyle = {
    textShadow: '0 8px 30px var(--color-shadow-strong)',
    zIndex: 2
  };

  const playerShadowStyle: ShadowStyle = {
    boxShadow: '0 4px 20px 0 var(--color-shadow)',
    zIndex: 1
  };

  const controlShadowStyle: ShadowStyle = {
    boxShadow: '0 4px 20px 0 var(--color-shadow)',
    zIndex: 2
  };

  // Dynamic styles based on theme
  const getThemeStyles = () => ({
    container: {
      backgroundColor: darkMode ? 'var(--color-bg-primary-dark)' : 'var(--color-bg-primary-light)',
      color: darkMode ? 'var(--color-text-primary-dark)' : 'var(--color-text-primary-light)',
    },
    control: {
      backgroundColor: darkMode ? 'var(--color-bg-secondary-dark)' : 'var(--color-bg-secondary-light)',
    },
  });

  const styles = getThemeStyles();

  return (
    <div className="flex justify-center items-center w-full h-screen font-[Miracode] overflow-hidden" 
         style={styles.container}>
      <div className="w-full min-w-[640px] px-4 sm:px-6 lg:px-8">
        {/* Theme toggle button */}
        <div className="flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full transition-colors hover:brightness-95 active:brightness-90"
            style={styles.control}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Title */}
        <h1 
          className="w-full mb-8 text-4xl sm:text-5xl font-[Zector] tracking-[0.5em] text-center whitespace-nowrap"
          style={titleShadowStyle}
        >
          FRIDAY TV
        </h1>

        <div className="w-full mx-auto flex flex-col items-center">
          <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
            {/* Video container */}
            <div 
              ref={containerRef}
              className="relative bg-black rounded-lg overflow-hidden"
              style={{
                height: `${(containerWidth * 9) / 16}px`,
                ...playerShadowStyle
              }}
            >
              <div 
                id="youtube-player" 
                className="absolute inset-0 w-full h-full"
              />
              <div 
                className="absolute inset-0 z-10" 
                style={{ pointerEvents: 'auto' }}
                onClick={togglePlayPause}
              />
            </div>

            {/* Controls section */}
            <div 
              className="mt-8"
              style={{ 
                position: 'relative', 
                zIndex: 2,
              }}
            >
              <div className="grid grid-cols-12 gap-4">
                {/* Play/Pause button */}
                <button
                  onClick={togglePlayPause}
                  className="col-span-1 p-3 rounded-lg flex justify-center items-center w-full transition-colors hover:brightness-95 active:brightness-90"
                  style={{
                    ...styles.control,
                    ...controlShadowStyle,
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <div className="p-2">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </div>
                </button>

                {/* Skip button */}
                <button 
                  onClick={() => playRandomVideo()}
                  className="col-span-1 p-3 rounded-lg flex justify-center items-center w-full transition-colors hover:brightness-95 active:brightness-90"
                  style={{
                    ...styles.control,
                    ...controlShadowStyle,
                  }}
                  aria-label="Skip to random video"
                >
                  <div className="p-2">
                    <SkipForward size={24} />
                  </div>
                </button>

                {/* Dummy button - spans 8 columns */}
                <div
                  className="col-span-8 p-3 rounded-lg"
                  style={{
                    ...styles.control,
                    ...controlShadowStyle
                  }}
                />

                {/* Volume controls */}
                <div 
                  className="col-span-2 p-2 rounded-lg flex items-center justify-between"
                  style={{
                    ...styles.control,
                    ...controlShadowStyle
                  }}
                >
                  <button
                    onClick={() => adjustVolume(-1)}
                    className="p-1 flex justify-center items-center transition-colors rounded-lg hover:brightness-95 active:brightness-90"                
                    aria-label="Decrease volume"
                    style={styles.control}
                  >
                    <Volume1 className="w-6 h-5" />
                  </button>
                  
                  <span className="w-14 text-center text-lg" aria-label="Current volume">
                    {volume}
                  </span>
                  
                  <button
                    onClick={() => adjustVolume(1)}
                    className="p-1 flex justify-center items-center transition-colors rounded-lg hover:brightness-95 active:brightness-90"
                    aria-label="Increase volume"
                    style={styles.control}
                  >
                    <Volume2 className="w-6 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;