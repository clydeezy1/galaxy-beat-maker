import { useState } from 'react'
import './App.css';
import { searchSounds } from './services/freesound';


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
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(75);
  const [selectedSound, setSelectedSound] = useState('');

  function togglePlayback() {
    setIsPlaying(previous => !previous);
  }

  async function handleSoundClick(sound) {
    setSelectedSound(sound.name);
    try {
      const results = await searchSounds(sound.name);
      console.log('Sounds from Freesound:', results);
      
      const firstSound = results[0];

      if (!firstSound) {
        throw new Error('No matching sound found.');
      }
      const audioUrl = firstSound.previews['preview-hq-mp3'];
      console.log('Audio URL:', audioUrl);

      const audio = new Audio(audioUrl);
      audio.volume = volume / 100;
      await audio.play();

    } catch (error) {
      console.error('Could not load sounds:', error);
    }
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
      <p>Selected sound: {selectedSound || 'None yet'}</p>
      <div className="sound-buttons">
        {sound.map((sound) => (
          <button 
          key={sound.id} 
          type="button" 
          className= {
          selectedSound === sound.name
          ? 'sound-button selected'
          : 'sound-button'
          }
          onClick={() => handleSoundClick(sound)}
          aria-pressed={selectedSound === sound.name}
          >
            {sound.name}
          </button>
        ))}
      </div>
    </main>
  )
}

export default App;