// Import required dependencies
// React is our main framework
// useState lets us manage state in our component
// useEffect lets us perform side effects (like loading YouTube API)
import React, { useState, useEffect } from 'react';

// Import icons from lucide-react library
// These will be our UI icons for controls
import { Moon, Sun, Play, Pause, SkipForward } from 'lucide-react';

// Define what props our volume icons will accept
// '?' means the prop is optional
interface VolumeIconProps {
  className?: string;  // Optional CSS class name
}

// Custom SVG icon for volume up button
// We use React.FC (Function Component) with our props interface
const VolumeUpIcon: React.FC<VolumeIconProps> = ({ className }) => (
  // SVG element with inherited className and current text color
  <svg viewBox="0 0 512 512" className={className} fill="currentColor">
    <g>
      {/* Speaker shape - the main speaker icon */}
      <path d="M272,0h-48L80,160H32c-17.672,0-32,14.326-32,32v128c0,17.672,14.328,32,32,32h48l144,160h48c8.836,0,16-7.164,16-16V16
        C288,7.164,280.836,0,272,0z"/>
      {/* Plus symbol - indicates volume increase */}
      <path d="M480,224h-32v-32c0-17.672-14.328-32-32-32s-32,14.328-32,32v32h-32c-17.672,0-32,14.328-32,32s14.328,32,32,32h32v32
        c0,17.672,14.328,32,32,32s32-14.328,32-32v-32h32c17.672,0,32-14.328,32-32S497.672,224,480,224z"/>
    </g>
  </svg>
);

// Custom SVG icon for volume down button
// Similar to VolumeUpIcon but with a minus instead of plus
const VolumeDownIcon: React.FC<VolumeIconProps> = ({ className }) => (
  <svg viewBox="0 0 512 512" className={className} fill="currentColor">
    <g>
      {/* Speaker shape - identical to VolumeUpIcon */}
      <path d="M272,0h-48L80,160H32c-17.672,0-32,14.326-32,32v128c0,17.672,14.328,32,32,32h48l144,160h48c8.836,0,16-7.164,16-16V16
        C288,7.164,280.836,0,272,0z"/>
      {/* Minus symbol - indicates volume decrease */}
      <path d="M480,224H352c-17.672,0-32,14.328-32,32s14.328,32,32,32h128c17.672,0,32-14.328,32-32S497.672,224,480,224z"/>
    </g>
  </svg>
);

// Interface for shadow styles
// Extends React's CSS Properties type
interface ShadowStyle extends React.CSSProperties {
  boxShadow?: string;     // CSS box shadow property
  textShadow?: string;    // CSS text shadow property
  zIndex: number;         // Layer ordering
}

// Interface for YouTube video metadata
// Used when checking video dimensions
interface VideoMetadata {
  height: number;
  width: number;
}

// Main VideoPlayer component
const VideoPlayer: React.FC = () => {
  // YouTube playlist ID - replace with your own
  const PLAYLIST_ID = 'PLGuEiIpCwgO1N8uHEq-v88e0_PPDhQJEu';
  
  // State management using useState hooks
  // Each state variable is defined with its type
  const [darkMode, setDarkMode] = useState<boolean>(false);      // Dark/light theme toggle
  const [isPlaying, setIsPlaying] = useState<boolean>(false);    // Playing state
  const [volume, setVolume] = useState<number>(5.0);             // Volume level (0-10)
  const [isVertical, setIsVertical] = useState<boolean>(false);  // Video orientation
  const [player, setPlayer] = useState<YT.Player | null>(null);  // YouTube player instance

  // useEffect hook for initialization
  // Runs once when component mounts (empty dependency array)
  useEffect(() => {
    // Check if YouTube API is already loaded
    if (window.YT) {
      initializePlayer();
    } else {
      // If not loaded, add the YouTube API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      // Insert script before first existing script
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      // Set up callback for when API is ready
      window.onYouTubeIframeAPIReady = initializePlayer;
    }
  }, []);

  // Initialize YouTube player
  const initializePlayer = (): void => {
    // Create new player instance
    new window.YT.Player('youtube-player', {
      height: '360',
      width: '640',
      playerVars: {
        listType: 'playlist',
        list: PLAYLIST_ID,    // Your playlist ID
        controls: 0,          // Hide default controls
        modestbranding: 1,    // Minimal YouTube branding
        rel: 0               // Don't show related videos
      },
      events: {
        // Called when player is ready
        onReady: (event: YT.PlayerEvent) => {
          setPlayer(event.target);              // Store player reference
          event.target.setVolume(volume * 10);  // Set initial volume
        },
        // Called when video state changes
        onStateChange: (event: YT.OnStateChangeEvent) => {
          // Update playing state
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          // Check video orientation when playing starts
          if (event.data === window.YT.PlayerState.PLAYING) {
            checkVideoOrientation(event.target);
          }
        }
      }
    });
  };

  // Check if video is vertical (shorts) or horizontal
  const checkVideoOrientation = async (player: YT.Player): Promise<void> => {
    try {
      // Get current video ID
      const videoData = player.getVideoData();
      const videoId = videoData.video_id;
      // Fetch video metadata from YouTube
      const response = await fetch(
        `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const data: VideoMetadata = await response.json();
      // Set vertical if height > width
      setIsVertical(data.height > data.width);
    } catch (error) {
      console.error('Error checking video orientation:', error);
    }
  };

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
    // Calculate new volume and restrict to 0-10 range
    const newVolume = parseFloat((volume + amount).toFixed(1));
    const clampedVolume = Math.min(Math.max(newVolume, 0), 10);
    // Update state
    setVolume(clampedVolume);
    // Update player volume (YouTube uses 0-100)
    if (player) {
      player.setVolume(clampedVolume * 10);
    }
  };

  // Play random video from playlist
  const playRandomVideo = (): void => {
    if (player) {
      const playlist = player.getPlaylist();
      if (playlist) {
        // Generate random index
        const randomIndex = Math.floor(Math.random() * playlist.length);
        // Play video at that index
        player.playVideoAt(randomIndex);
      }
    }
  };

  // Define shadow styles for different elements
  const titleShadowStyle: ShadowStyle = {
    textShadow: '0 8px 30px rgba(0,0,0,0.35)',
    zIndex: 2
  };

  const playerShadowStyle: ShadowStyle = {
    boxShadow: '0 12px 50px 0 rgba(0,0,0,0.45)',
    zIndex: 1
  };

  const controlShadowStyle: ShadowStyle = {
    boxShadow: '0 12px 50px 0 rgba(0,0,0,0.45)',
    zIndex: 2
  };

  // Component render
  return (
    // Main container - applies dark mode classes
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} font-[Miracode]`}>
      <div className="container mx-auto px-4 py-8">
        {/* Theme toggle button */}
        <div className="flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Title */}
        <h1 
          className="max-w-4xl mx-auto mb-8 text-5xl font-[Miracode] tracking-[1.5em] text-center"
          style={titleShadowStyle}
        >
          F R I D A Y   T V
        </h1>

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Video container - adjusts size based on orientation */}
          <div 
            className={`relative bg-black rounded-lg overflow-hidden transition-all duration-500 ease-in-out ${
              isVertical ? 'w-[360px]' : 'w-full'
            }`}
            style={{
              aspectRatio: isVertical ? '9/16' : '16/9',
              ...playerShadowStyle
            }}
          >
            {/* YouTube player will be inserted here */}
            <div id="youtube-player" className="absolute inset-0 w-full h-full" />
          </div>

          {/* Controls section */}
          <div 
            className={`mt-8 transition-all duration-500 ease-in-out ${
              isVertical ? 'w-[360px]' : 'w-full'
            }`}
            style={{ position: 'relative', zIndex: 2 }}
          >
            {/* Control buttons grid */}
            <div className="grid grid-cols-3 gap-8">
              {/* Play/Pause button */}
              <div 
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex justify-center items-center`}
                style={controlShadowStyle}
              >
                <button
                  onClick={togglePlayPause}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>

              {/* Skip button */}
              <div 
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex justify-center items-center`}
                style={controlShadowStyle}
              >
                <button
                  onClick={playRandomVideo}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Skip to random video"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {/* Volume controls */}
              <div 
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center gap-3`}
                style={controlShadowStyle}
              >
                {/* Volume down button */}
                <button
                  onClick={() => adjustVolume(-0.1)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Decrease volume"
                >
                  <VolumeDownIcon className="w-5 h-5" />
                </button>
                
                {/* Volume display */}
                <span className="w-14 text-center text-lg" aria-label="Current volume">
                  {volume.toFixed(1)}
                </span>
                
                {/* Volume up button */}
                <button
                  onClick={() => adjustVolume(0.1)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Increase volume"
                >
                  <VolumeUpIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component for use in other files
export default VideoPlayer;