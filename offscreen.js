let currentAudio;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "play-adhan") {
    currentAudio?.pause();
    currentAudio = new Audio(message.audioUrl);
    currentAudio.volume = 0.9;
    currentAudio.play().catch(() => {});
  }
});
