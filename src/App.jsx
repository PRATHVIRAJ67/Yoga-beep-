import { useState, useEffect, useCallback } from 'react';

export default function App() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [beepsPlayed, setBeepsPlayed] = useState([]);
  const [isBeeping, setIsBeeping] = useState(false);
  
  const beepTimes = [2 * 60, 4 * 60, 10 * 60, 17 * 60, 27 * 60]; // seconds

  
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  
  useEffect(() => {
    if (beepTimes.includes(time) && !beepsPlayed.includes(time)) {
      playLoudBeep();
      setBeepsPlayed(prev => [...prev, time]);
      triggerBeepAnimation();
    }
  }, [time, beepsPlayed]);

  const playLoudBeep = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const frequencies = [800, 1000, 1200];
      const duration = 4.5;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
          
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
          
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + duration);
        }, index * 100);
      });
    } catch (error) {
      console.log('Audio context not available:', error);
    }
  }, []);

  const triggerBeepAnimation = () => {
    setIsBeeping(true);
    setTimeout(() => setIsBeeping(false), 1000);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const getNextBeepTime = () => {
    const nextBeepTime = beepTimes.find(beepTime => beepTime > time);
    return nextBeepTime ? nextBeepTime - time : null;
  };

  const start = () => {
    setRunning(true);
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtx.resume();
    } catch (e) {
      console.log('Audio context not available');
    }
  };

  const stop = () => {
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setTime(0);
    setBeepsPlayed([]);
    setIsBeeping(false);
  };

  const nextBeepTime = getNextBeepTime();

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center text-white transition-all duration-1000 px-4 py-8 ${
      isBeeping 
        ? 'bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500' 
        : 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600'
    }`}>
      
     
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-white opacity-5 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-80 h-80 bg-white opacity-5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
        
        
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 animate-bounce">
            🧘 Yoga Timer
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-80">
            Find your inner peace with guided breathing intervals
          </p>
        </div>

        
        <div className={`mb-6 sm:mb-8 lg:mb-12 transition-all duration-300 ${
          isBeeping ? 'animate-pulse scale-110' : 'hover:scale-105'
        }`}>
          <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-mono font-bold mb-2 sm:mb-4">
            <span className="drop-shadow-2xl" style={{
              textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
            }}>
              {formatTime(time)}
            </span>
          </div>
          
         
          {nextBeepTime && (
            <div className="text-sm sm:text-base md:text-lg opacity-75 mb-2">
              Next beep in: <span className="font-mono">{formatTime(nextBeepTime)}</span>
            </div>
          )}
          
          {!nextBeepTime && time > 0 && (
            <div className="text-sm sm:text-base md:text-lg text-green-300 mb-2">
              🎉 All intervals complete! Well done!
            </div>
          )}
        </div>

      
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="text-xs sm:text-sm md:text-base opacity-75 mb-3">Breathing Intervals</div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            {beepTimes.map((beepTime, index) => (
              <div
                key={beepTime}
                className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  beepsPlayed.includes(beepTime)
                    ? 'bg-green-500 text-white scale-110 shadow-lg'
                    : time >= beepTime
                    ? 'bg-yellow-500 text-black animate-pulse'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {formatTime(beepTime)}
              </div>
            ))}
          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center mb-6 sm:mb-8">
          
          {!running ? (
            <button
              onClick={start}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-2xl shadow-2xl text-base sm:text-lg md:text-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {time === 0 ? '🎯 Start Session' : '▶️ Resume'}
            </button>
          ) : (
            <button
              onClick={stop}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-500 text-white rounded-2xl shadow-2xl text-base sm:text-lg md:text-xl font-semibold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              ⏸️ Pause
            </button>
          )}

          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-700 bg-opacity-80 text-white rounded-2xl shadow-2xl text-base sm:text-lg md:text-xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            🔄 Reset
          </button>
        </div>

       
        <div className={`transition-all duration-300 ${isBeeping ? 'opacity-100 scale-125' : 'opacity-0 scale-90'}`}>
          <div className="text-2xl sm:text-3xl md:text-4xl mb-2">🔔</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold">
            Breathing Cue!
          </div>
        </div>

        {running && (
          <div className="mt-6 sm:mt-8">
            <div className="text-xs sm:text-sm opacity-60">
              Session in progress... Keep breathing mindfully
            </div>
          </div>
        )}

      </div>

      
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white bg-opacity-30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
    </div>
  );
}