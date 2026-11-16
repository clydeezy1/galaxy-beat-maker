import { useState, useEffect } from 'react'
import './App.css';
import { searchSounds, getSoundById } from './services/freesound';


const sound = [
  {id: "kick", name : "Kick"},
  {id: "snare", name : "Snare"},
  {id: "hihat", name : "Hi-Hat"},
  {id: "clap", name : "Clap"},
  {id: "808", name : "808 Bass"},
  {id: "piano", name : "Piano"},
];
function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  // Tracks which sequencer is playing.
  // Tracks the current beat position
  const[currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(75);
  const [selectedSound, setSelectedSound] = useState('');
  // Stores the chosen Freesound sample for each instrument
const [instrumentSounds, setInstrumentSounds] = useState({});
  // MIDI is too hard so i'll just use a sound sequencer instead.
  const [pattern, setPattern] = useState(()=>
    Object.fromEntries(
      sound.map(item => [
        item.id, 
        Array(16).fill(false),
      ])
    )
  );

  function toggleStep(soundId, stepIndex) {
    setPattern(previous=> ({
      ...previous,
      [soundId]: previous[soundId].map((ison, index) =>
        index === stepIndex ? !ison : ison
      )
    }));
  }

  // Starts playback or stops and resets the sequencer
  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      setIsPlaying(true);
      setCurrentStep(0);
    }
  }

  // Advances the sequencer based on BPM
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      console.log("Timer tick:", performance.now());

      setCurrentStep(previous => (previous + 1) % 16);

      console.log(
        "Step interval:",
        (60 / tempo / 4) * 1000,
        "ms"
      );
    }, (60 / tempo / 4) * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, tempo]);

  // Plays sounds when the sequencer reaches an active step
  useEffect(() => {
    if (!isPlaying) return;

    sound.forEach((instrument) => {
      if (pattern[instrument.id]?.[currentStep]) {
        playInstrument(instrument.id);
      }
    });
  }, [currentStep, isPlaying]);

  async function handleSoundClick(sound) {
    setSelectedSound(sound.name);
    try {
      const results = await searchSounds(sound.name);
      console.log('Sounds from Freesound:', results);
        console.table(
          results.map(item => ({
            id: item.id,
            name: item.name,
            url: item.url
          }))
        );

      const firstSound = results[0];

      if (!firstSound) {
        throw new Error('No matching sound found.');
      }
 //Saves the slected Freesound sample to its instrument 
        setInstrumentSounds(previous => ({
          ...previous,
          [sound.id]: firstSound.id
        }));

      const audioUrl = firstSound.previews['preview-hq-mp3'];
      console.log('Audio URL:', audioUrl);

      const audio = new Audio(audioUrl);
      audio.volume = volume / 100;
      await audio.play();

    } catch (error) {
      console.error('Could not load sounds:', error);
    }
  }

async function playInstrument(soundId) {
  console.log("All saved instrument sounds:", instrumentSounds);

  const freesoundId = instrumentSounds[soundId];

  console.log("Instrument:", soundId);
  console.log("SavedFreesound ID:", freesoundId);


  if (!freesoundId) return;

  try {
    const soundData = await getSoundById(freesoundId);

    const audioUrl =
      soundData.previews["preview-hq-mp3"];

    const audio = new Audio(audioUrl);
    audio.volume = volume / 100;

    await audio.play();

    console.log("Audio playback started:", soundId);
    
  } catch (error) {
    console.error("Playback failed:", error);
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
      < section className="sequencer">
        <h2>Beat Pattern</h2>

        {sound.map(item => (
          <div className="sequencer-row" key={item.id}>
            <span>{item.name}</span>

            <div className="sequencer-steps">
              {pattern[item.id]?.map((isOn, stepIndex) => (
                <button
                  key={stepIndex}
                  type="button"
                    className={`step-button
                      ${isOn ? 'active' : ''}
                      ${isPlaying && currentStep === stepIndex ? 'playing' : ''}
                      `}                  
                      onClick={() => {
                      console.log('Clicked:', item.id, stepIndex);
                      toggleStep(item.id, stepIndex);
                    }}

                  aria-pressed={isOn}
                  aria-label={`${item.name} step ${stepIndex + 1}`}
                >
                  {stepIndex + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  ); 
}
export default App;