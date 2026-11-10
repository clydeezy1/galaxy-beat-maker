import { useState } from 'react'
import './App.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  function togglePlayback() {
    setIsPlaying(previous => !previous);
  }

  return (
    <main>
      <h1>Galaxy Beat Maker</h1>
      <p>Create your own beats among the stars.</p>

      <button
      type="button"
      className="play-button"
      onClick={togglePlayback}
      aria-pressed={isPlaying}
      >
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <p role="status">
        {isPlaying ? 'Playback is on.' : 'Playback is off.'}
      </p>
    </main>
  )
}

export default App;