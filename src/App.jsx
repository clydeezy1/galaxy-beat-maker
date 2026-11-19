import { useState, useEffect, useRef } from "react";
import './App.css';
import { searchSounds, getSoundById } from './services/freesound';
import { loadSoundWithCache } from "./services/soundCache";



const sound = [
  {id: "kick", name : "Kick"},
  {id: "snare", name : "Snare"},
  {id: "hihat", name : "Hi-Hat"},
  {id: "clap", name : "Clap"},
  {id: "808", name : "808 Bass"},
  {id: "piano", name : "Piano"},
];
function App() {
  const audioBuffersRef = useRef({});
  const audioContextRef = useRef(null);
  const previewAudioRef = useRef(null);
  const [previewingId, setPreviewingId] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  // Tracks which sequencer is playing.
  // Tracks the current beat position
  const[currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(75);
  const [selectedSound, setSelectedSound] = useState('');
  // Stores the chosen Freesound sample for each instrument
const [instrumentSounds, setInstrumentSounds] = useState({});
const [searchResults, setSearchResults] = useState([]);
const [searchPage, setSearchPage] = useState(1);
const [activeInstrument, setActiveInstrument] = useState(null);
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

useEffect(() => {
  return () => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
  };
}, []);

  // Plays sounds when the sequencer reaches an active step
  useEffect(() => {
    if (!isPlaying) return;

    sound.forEach((instrument) => {
      if (pattern[instrument.id]?.[currentStep]) {
        playInstrument(instrument.id);
      }
    });
  }, [currentStep, isPlaying]);

function stopPreview() {
  const preview = previewAudioRef.current;

  if (preview) {
    preview.pause();
    preview.currentTime = 0;
    previewAudioRef.current = null;
  }

  setPreviewingId(null);
}

function togglePreview(sample) {
  const previewUrl = sample.previews?.["preview-hq-mp3"];
  if (!previewUrl) return;

  const isSamePreview =
    previewAudioRef.current?.src === previewUrl;

  stopPreview();

  if (isSamePreview) return;

  const preview = new Audio(previewUrl);
  preview.volume = volume / 100;

  previewAudioRef.current = preview;
  setPreviewingId(sample.id);

  const clearPreview = () => {
    if (previewAudioRef.current === preview) {
      previewAudioRef.current = null;
      setPreviewingId(null);
    }
  };

  preview.onended = clearPreview;
  preview.onerror = clearPreview;

  preview.play().catch((error) => {
    if (previewAudioRef.current === preview) {
      console.error("Could not play preview:", error);
      clearPreview();
    }
  });
}
  
  async function handleSoundClick(sound) {
    setSelectedSound(sound.name);
    setActiveInstrument(sound.id);
    setSearchPage(1);
    try {
      const results = await searchSounds(sound.name);
      setSearchResults(results);
      setSearchPage(1);
      console.log('Sounds from Freesound:', results);
        console.table(
          results.map(item => ({
            id: item.id,
            name: item.name,
            url: item.url
          }))
        );


    } catch (error) {
      console.error('Could not load sounds:', error);
    }
  }

  async function prepareInstrument(soundId, audioData) {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }

  const audioBuffer =
    await audioContextRef.current.decodeAudioData(audioData.slice(0));

  audioBuffersRef.current[soundId] = audioBuffer;

  console.log("Instrument prepared:", soundId);
}

async function loadSelectedInstrument(soundId, sample) {
  try {
    const audioUrl = sample.previews?.["preview-hq-mp3"];

    if (!audioUrl) {
      throw new Error("No audio preview available");
    }

    const audioData = await loadSoundWithCache(
      sample.id,
      audioUrl
    );

    await prepareInstrument(soundId, audioData);

    console.log("Ready to play:", soundId);
  } catch (error) {
    console.error("Could not prepare instrument:", error);
  }
}

function selectSound(sample) {
  if (!activeInstrument) return;

  stopPreview();

  setInstrumentSounds(previous => ({
    ...previous,
    [activeInstrument]: sample.id
  }));

  loadSelectedInstrument(activeInstrument, sample);

  setSearchResults([]);

  console.log("Assigned:", sample.name, "to", activeInstrument);
}


async function changeSearchPage(newPage) {
  if (newPage < 1 || !activeInstrument) return;

  const instrument = sound.find(
    (item) => item.id === activeInstrument
  );

  if (!instrument) return;

  try {
    const results = await searchSounds(instrument.name, newPage);

    if (results.length === 0) return;

    setSearchResults(results);
    setSearchPage(newPage);
  } catch (error) {
    console.error("Could not change search page:", error);
  }
}

function playInstrument(soundId) {
  const audioBuffer = audioBuffersRef.current[soundId];
  const audioContext = audioContextRef.current;

  if (!audioBuffer || !audioContext) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume / 100;

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);
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

{searchResults.length > 0 && (
  <section className="sound-search-results">
    <h2>Choose a Sound</h2>

    <div className="search-pagination">
  <button
    type="button"
    disabled={searchPage === 1}
    onClick={() => changeSearchPage(1)}
  >
    First
  </button>

  <button
    type="button"
    disabled={searchPage === 1}
    onClick={() => changeSearchPage(searchPage - 1)}
  >
    Previous
  </button>

  <span>Page {searchPage}</span>

  <button
    type="button"
    onClick={() => changeSearchPage(searchPage + 1)}
  >
    Next
  </button>
</div>

  {searchResults.map((sample) => (
      <div key={sample.id} className="sound-result">
        <span>{sample.name}</span>

<button
  type="button"
  onClick={() => togglePreview(sample)}
  aria-pressed={previewingId === sample.id}
>
  {previewingId === sample.id ? "Stop Preview" : "Preview"}
</button>
        <button
          type="button"
          onClick={() => selectSound(sample)}
        >
          Select
        </button>
      </div>
    ))}
  </section>
)}

      < section className="sequencer">
        <h2>Beat Pattern</h2>

        {sound.map(item => (
          <div className="sequencer-row" key={item.id}>
          <span
          className={
            pattern[item.id]?.some(isOn => isOn)
              ? "instrument-name in-use"
              : "instrument-name"
          }
        >
          {item.name}
          </span>

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