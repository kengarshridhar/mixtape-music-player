import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());

  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());

  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());

  // ...
};

// // src/services/PlaybackService.ts
// import TrackPlayer, { Event } from 'react-native-track-player';

// export const PlaybackService = async function() {

//     TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

//     TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

//     // ...

// };