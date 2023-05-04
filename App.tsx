import { View, Text, StyleSheet, StatusBar } from 'react-native'
import React from 'react'

import MusicPlayer from './screens/musicPlayer'

const App = () => {
  return (
    <View style={style.container}>
      <StatusBar barStyle={'light-content'} />
      <MusicPlayer />
    </View>
  )
}

export default App;

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});
