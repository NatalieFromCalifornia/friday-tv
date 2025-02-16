// Import required dependencies
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Play, Pause, SkipForward, Volume1, Volume2, Meh, Cat, Clapperboard } from 'lucide-react';

// Interface for shadow styles
interface ShadowStyle extends React.CSSProperties {
  boxShadow?: string;
  textShadow?: string;
  zIndex: number;
}

// Main VideoPlayer component
const VideoPlayer: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // YouTube playlist ID - replace with your own
  const PLAYLIST_ID = 'PLGuEiIpCwgO1N8uHEq-v88e0_PPDhQJEu';
  
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(5.0);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [playedVideos, setPlayedVideos] = useState<string[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string>('BRAINROT')

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

    // Create new player instance
    new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
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
    <div className="leading-none flex flex-col h-screen p-4 font-[Zector] overflow-hidden transition-colors" 
         style={styles.container}>
      <div className="w-full max-w-[1440px] min-w-[640px] pb-8 mx-auto h-full flex flex-col">
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
        <div className="w-full mb-4 overflow-hidden">
          <h1 
            className="w-full font-[Zector] text-center mx-auto px-2"
            style={{
              ...titleShadowStyle,
              fontSize: 'clamp(1rem, 3vw, 2.5rem)',
              letterSpacing: 'clamp(0.1em, 0.8vw, 0.3em)',
              transform: 'scale(0.95)', // Slightly reduce the text to prevent edge cases
              maxWidth: '100%',
              display: 'inline-block'
            }}
          >
            FRIDAYS INTERDIMENSIONAL CABLE
          </h1>
        </div>

        {/* Video container */}
        <div className="flex-1 min-h-0">
          <div 
            ref={containerRef}
            className="relative bg-black rounded-lg overflow-hidden h-full"
            style={playerShadowStyle}
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
        </div>

        {/* Controls section */}
        <div 
          className="mt-8 font-bold"
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

            {/* Dummy button - spans remaining columns */}
            <div
              className="col-span-5 p-3 rounded-lg flex items-center justify-end gap-3"
              style={{
                ...styles.control,
                ...controlShadowStyle
              }}
            />

            {/* Channel controls */}
            <div
              className="col-span-3 p-2 sm:p-3 rounded-lg flex items-center justify-center"
              style={{
                ...styles.control,
                ...controlShadowStyle
              }}
            >
              <div className="flex-1 text-center text-lg items-center justify-center mr-2 truncate">
                {currentChannel && `${currentChannel} TV`}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={()=> setCurrentChannel('BRAINROT')}
                  className="w-10 h-10 rounded-lg transition-colors hover:brightness-95 active:brightness-90 flex items-center justify-center"
                  style={styles.control}
                >
                  <Meh className="w-5 h-5" />
                </button>

                <button
                  onClick={()=> setCurrentChannel('FURRY')}
                  className="w-10 h-10 rounded-lg transition-colors hover:brightness-95 active:brightness-90 flex items-center justify-center"
                  style={styles.control}
                >
                  <Cat className="w-5 h-5" />
                </button>

                <button
                  onClick={()=> setCurrentChannel('MEALTIME')}
                  className="w-10 h-10 rounded-lg transition-colors hover:brightness-95 active:brightness-90 flex items-center justify-center"
                  style={styles.control}
                >
                  <Clapperboard className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Volume controls */}
            <div 
              className="col-span-2 px-4 py-2 rounded-lg flex items-center justify-between"
              style={{
                ...styles.control,
                ...controlShadowStyle
              }}
            >
              <button
                onClick={() => adjustVolume(-1)}
                className="w-10 h-10 flex justify-center items-center transition-colors rounded-lg hover:brightness-95 active:brightness-90"                
                aria-label="Decrease volume"
                style={styles.control}
              >
                <Volume1 className="w-6 h-5" />
              </button>
              
              <span className="w-14 text-center text-lg flex items-center justify-center" aria-label="Current volume">
                {volume}
              </span>
              
              <button
                onClick={() => adjustVolume(1)}
                className="w-10 h-10 flex justify-center items-center transition-colors rounded-lg hover:brightness-95 active:brightness-90"
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
  );
};

export default VideoPlayer;