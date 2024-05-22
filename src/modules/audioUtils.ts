const AudioContextClass = (window.AudioContext ||
  (window as any).webkitAudioContext) as typeof AudioContext;
const audioContext = new AudioContextClass();

export async function loadAudio(url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

export function playSound(buffer: AudioBuffer) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}
