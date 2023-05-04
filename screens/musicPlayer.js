import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Image, FlatList, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import songs from '../model/data';
import TrackPlayer, {  Capability, Event, RepeatMode, State, usePlaybackState, useProgress, useTrackPlayerEvents} from 'react-native-track-player';

const { width, height } = Dimensions.get('window');

const setupPlayer = async () => {
    try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.add(songs);
        await TrackPlayer.updateOptions({
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.Stop,
            ],
        });
    } catch (error) {
        console.error(`[-] ${error}`)
    }
};

const togglePlayback = async playbackState => {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    const state = await TrackPlayer.getState();
    console.log(currentTrack, playbackState, state);
    if (currentTrack != null) {
        if (playbackState === State.Paused) {
            await TrackPlayer.play();
            console.log('play1');
        }else if (playbackState === State.Ready) {
            console.log('play2');
            await TrackPlayer.play();
        } else {
            console.log('pause');
            await TrackPlayer.pause();
        }
        
    }
};

const MusicPlayer = () => {
    const playbackState = usePlaybackState();
    const progress = useProgress();
    const [songIndex, setSongIndex] = useState(0);
    const [repeatMode, setRepeatMode] = useState('off')
    const [trackTitle, setTrackTitle ] = useState();
    const [trackArtits, setTrackArtits ] = useState();
    const [trackArtWork, setTrackArtWork ] = useState();

    
    // costom refrence
    const scrollX = useRef(new Animated.Value(0)).current;
    const songSlide = useRef(null); // Flatlist refrence

    useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
        if(event.type === Event.PlaybackTrackChanged && event.nextTrack !== null){
            const track = await TrackPlayer.getTrack(event.nextTrack);
            const  {title, artwork, artist} = track;
            setTrackTitle(title);
            setTrackArtWork(artwork);
            setTrackArtits(artist);
            console.log('Info ' + title, artist, artwork);
        }
    })

    const repeatIcon = () => {
        if (repeatMode === 'off') {
            return 'repeat-off';
        }
        if (repeatMode === 'track') {
            return 'repeat-once';
        }
        if (repeatMode === 'repeat') {
            return 'repeat';
        }
    }

    const changeRepeatMode = () => {
        if (repeatMode === 'off') {
            TrackPlayer.setRepeatMode(RepeatMode.Track)
            setRepeatMode('track')
        }
        if (repeatMode === 'track') {
            TrackPlayer.setRepeatMode(RepeatMode.Queue)
            setRepeatMode('repeat')
        }
        if (repeatMode === 'repeat') {
            TrackPlayer.setRepeatMode(RepeatMode.Off)
            setRepeatMode('off')
        }
    }

    const skipTo = async trackId => {
        await TrackPlayer.skip(trackId);
    }

    useEffect(() => {
        setupPlayer();
        scrollX.addListener(({value}) => {
            // console.log(`ScrollX: ${value} | Device width: ${width}`);
            const index = Math.round(value / width);
            skipTo(index);
            setSongIndex(index);
        });

        return () => {
            scrollX .removeAllListeners();
            TrackPlayer.destroy();
        }
    }, []);

    const SkipToNext = () => {
        songSlide.current.scrollToOffset({
            offset: (songIndex + 1) * width,
        })
    }

    
    const SkipToPrevious = () => {
        songSlide.current.scrollToOffset({
            offset: (songIndex - 1) * width,
        })
    }

    const renderSongs = ({item, index}) => {
        return(
        <Animated.View style={ style.mainImageWarpper }>
            <View style={[style.imageWarpper, style.elevation]}>
                <Image 
                    source={trackArtWork}
                    style={style.musicImage}
                    />
            </View>
        </Animated.View>
        );
    };

  return (
    <SafeAreaView style={style.container}>
    <View style={style.mainContainer}>
        {/* image */}
        <Animated.FlatList 
            ref={songSlide}
            data = {songs}
            renderItem={renderSongs}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
                [
                    {
                        nativeEvent: {
                            contentOffset: { x: scrollX },
                        }
                    }
                ],
                { useNativeDriver: true },
            )}
        />
         

        {/* Song Content */}
        <View>
            <Text style={[style.songTitle, style.songContent]}>{trackTitle}</Text>
            <Text style={[style.songArtist, style.songContent]}>{trackArtits}</Text>
        </View>
        {/* slider */}
        <View>
            <Slider
                style={style.progressBar}
                value={progress.position}
                minimumValue={0}
                maximumValue={progress.duration}
                thumbTintColor='#FFD369'
                minimumTrackTintColor="#FFD369"
                maximumTrackTintColor="#FFF"
                onSlidingComplete={ async value => { await TrackPlayer.seekTo(value)}}
            />
        </View>
        {/* Progress bar Duraction */}
        <View style={style.progressBarDuraction}>
            <Text style={style.progressBarDuractionText}>
                { new Date(progress.position * 1000).toLocaleTimeString().replace('AM',"").substring(3)}</Text>
            <Text style={style.progressBarDuractionText}>
            {new Date((progress.duration - progress.position ) * 1000).toLocaleTimeString().replace('AM',"").substring(3)}</Text>
        </View>
        {/* music Control */}
        <View style={style.musicControlContainer}>
            <TouchableOpacity onPress={SkipToPrevious}>
                <Ionicons name='play-skip-back-outline' size={35} color='#FFD369'/>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => togglePlayback(playbackState)}>
                <Ionicons name={playbackState === State.Playing ? 'ios-pause-circle' :'ios-play-circle'} size={75} color='#FFD369'/>
            </TouchableOpacity>

            <TouchableOpacity onPress={SkipToNext}>
                <Ionicons name='play-skip-forward-outline' size={35} color='#FFD369'/>
            </TouchableOpacity>
        </View>

    </View>
    <View style={style.bottomContainer}>
        <View style={style.bottomContainerWarp}>
            <TouchableOpacity onPress={() => {}}>
                <Ionicons name='heart-outline' size={30} color='#888'/>
            </TouchableOpacity>
            <TouchableOpacity onPress={changeRepeatMode}>
                <MaterialCommunityIcons name={`${repeatIcon()}`} size={30} color={repeatMode !== 'off'? '#ffd369' :'#888'}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
                <Ionicons name='share-outline' size={30} color='#888'/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
                <Ionicons name='ellipsis-horizontal' size={30} color='#888'/>
            </TouchableOpacity>
        </View>
    </View>
    </SafeAreaView>
  )
}

export default MusicPlayer;

const style = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#222831',
    },

    mainContainer: {
        flex: 1,
        alignItems: 'center',
      justifyContent: 'center'
    },

    bottomContainer: {
        width: width,
        alignItems: 'center',
        paddingVertical: 15,
        borderTopColor: '#393E46',
        borderWidth: 1,
    },
    bottomContainerWarp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },

    mainImageWarpper: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },

    imageWarpper: {
        width: 300,
        height: 340,
        marginBottom: 20,
        marginTop: 20,
    },

    musicImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },

    elevation: {
        elevation: 5,
        shadowColor: '#ccc',
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
    },

    songContent: {
        textAlign: 'center',
        color: '#EEE'
    },

    songTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    songArtist: {
        fontSize: 16,
        fontWeight: '300',
    },

    progressBar: {
        width: 350,
        height: 40,
        marginTop: 20,
        flexDirection: 'row'
    },

    progressBarDuraction: {
        width: 340,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressBarDuractionText: {
        color: '#FFF',
        fontWeight: '500',
    },

    musicControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '60%',
        marginTop: 10,
    },
  });