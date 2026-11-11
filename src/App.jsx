import { useState } from 'react'
import './App.css';

const sound = [
  {id: "kick", name : "Kick"},
  {id: "snare", name : "Snare"},
  {id: "hihat", name : "Hi-Hat"},
  {id: "clap", name : "Clap"},
  {id: "808", name : "808 Bass"},
  {id: "pinano", name : "Piano"},
];
function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ tempo, setTempo] = useState(120);
  const[volume, setVolume] = useState(75);



  function togglePlayback() {
    setIsPlaying(previous => !previous);
  }

  return (
    <main>
      <h1>Galaxy Beat Maker</h1>
      <p>Create your own beats among the stars.</p>
      <div className="tempo-control">
        <label htmlFor="tempo">Tempo: {tempo} BPM</label>
        <input
          id="tempo"
          type="range"
          min="40"
          max="240"
          step="1"
          value={tempo}
          onChange={event => setTempo(Number(event.target.value))}
        />
      </div>
      <div className="volume-control">
        <label htmlFor="volume">Master Volume: {volume}%</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={event => setVolume(Number(event.target.value))}
        />
      </div>

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
      <div className="sound-buttons">
        {sound.map((sound) => (
          <button 
          key={sound.id} 
          type="button" 
          className="sound-button"
          >
            {sound.name}
          </button>
        ))}
      </div>
    </main>
  )
}

export default App;