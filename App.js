import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  ImageBackground,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import CountDown from 'react-native-countdown-component';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function App() {
  let shuffle;
  let generateRandom;
  const [completedProblems, setCompletedProblems] = useState([]);
  const Stack = createNativeStackNavigator();
  const [arr, createArr] = useState([]);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [sound, setSound] = React.useState();
  const [screen, setScreen] = useState(0);
  const [isSubmit, setisSubmit] = useState('Submit');
  const [num1, setNum1] = useState();
  const [num2, setNum2] = useState();
  const [count, setCount] = useState('3');
  const [roundLength, setRoundLength] = useState(60);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [numItemsDropped, setNum] = useState(0);
  const toggleSwitch = () => {
    //Function for Switch
    setIsEnabled((previousState) => !previousState);
    setIsRunning(!isRunning);
  };
  const countdownRef = useRef(null);
  const [highscore, newHighScore] = useState();
  const [outputText, setOutputText] = useState(num1 + ' x ' + num2);
  const [score, setScore] = useState(0);

  const storeHighScore = async (newvalue) => {
    try {
      const jsonValue = JSON.stringify(newvalue);
      await AsyncStorage.setItem('highscore', jsonValue);
    } catch (e) {
      // saving error
    }
  };
  const setHighScore = async () => {
    try {
      const value = await AsyncStorage.getItem('highscore');
      if (value !== null && value !== undefined) {
        newHighScore(JSON.parse(value));
        console.log(highscore);
      } else {
        newHighScore(0);
      }
    } catch (e) {
      // error reading value
    }
  };
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [number, setNumber] = React.useState('');
  const [customLmin, setCustomLmin] = useState(0);
  const [customLmax, setCustomLmax] = useState(100);
  const [customRmin, setCustomRmin] = useState(0);
  const [customRmax, setCustomRmax] = useState(100);
  let output = num1 + ' x ' + num2;

  const [animation, setAnimation] = useState(new Animated.Value(0));
  const [textanimation, setTextAnimation] = useState(new Animated.Value(0));

  const incorrectAns = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
    }).start(() => {
      Animated.timing(animation, {
        toValue: 0,
        duration: 600,
      }).start();
    });
  };

  const color = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(246, 247, 251)', 'rgb(255, 0, 0)'],
  });

  const readysetgo = async () => {
    setCount('3');
    Animated.timing(textanimation, {
      toValue: 1,
      duration: 500,
    }).start(() => {
      Animated.timing(textanimation, {
        toValue: 0,
        duration: 500,
      }).start(() => {
        setCount('2');
        Animated.timing(textanimation, {
          toValue: 1,
          duration: 500,
        }).start(() => {
          Animated.timing(textanimation, {
            toValue: 0,
            duration: 500,
          }).start(() => {
            setCount('1');
            Animated.timing(textanimation, {
              toValue: 1,
              duration: 500,
            }).start(() => {
              Animated.timing(textanimation, {
                toValue: 0,
                duration: 500,
              }).start(async () => {
                setCount('Go!');
                Animated.timing(textanimation, {
                  toValue: 1,
                  duration: 500,
                }).start(() => {
                  Animated.timing(textanimation, {
                    toValue: 0,
                    duration: 500,
                  }).start(() => {
                    setScreen(1);
                    setCount('3');
                  });
                });
              });
            });
          });
        });
      });
    });
  };

  const textcolor = textanimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(25, 25, 25)', 'rgb(244, 243, 244)'],
  });

  async function playSound(s) {
    //Async Function that Plays Soundbites
    if (s == 'correct') {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/pop2.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    }
    if (s == 'incorrect') {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/wrong.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    }
    if (s == 'victory') {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/trumpet.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    }
    if (s == 'crowd') {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/crowdcheering.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    }
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const setArray = (difficulty) => {
    setHighScore();
    let x = [];
    let y = [];
    let max;
    let min;

    if (difficulty == 'easy') {
      max = 12;
      min = 0;
      setIsRunning(true);
    } else if (difficulty == 'medium') {
      max = 100;
      min = 0;
      setIsRunning(true);
    } else if (difficulty == 'hard') {
      max = 100;
      min = 0;
      setIsRunning(true);
    }

    if (difficulty != 'medium' && difficulty != 'custom') {
      for (let a = min; a < max + 1; a++) {
        x.push(a);
        for (let b = min; b < max + 1; b++) {
          y.push([x[a], b]);
        }
      }
    } else if (difficulty == 'custom') {
      for (let c = 0; c < customLmax - customLmin + 1; c++) {
        x.push(customLmin + c);
        for (let d = 0; d < customRmax - customRmin + 1; d++) {
          y.push([x[c], customRmin + d]);
        }
      }
    } else {
      for (let e = min; e < max + 1; e++) {
        x.push(e);
        for (let f = 0; f < 13; f++) y.push([x[e], f]);
      }
    }

    console.log(y);
    generateRandom = Math.floor(Math.random() * y.length);
    shuffle = y[generateRandom];
    setCompletedProblems(y.splice(generateRandom, 1));
    setNum1(shuffle[0]);
    setNum2(shuffle[1]);
    createArr((arr) => y);
  };

  const handleSubmit = () => {
    setNumber((number) => '');
    if (parseFloat(number) == num1 * num2) {
      playSound('correct');
      output = num1 + ' × ' + num2;
      setOutputText(num1 + ' × ' + num2);
      setStreak(streak + 1);
      setMultiplier(Math.round(10 * (multiplier + 0.2)) / 10);
      setScore(Math.round(10 * (score + 10 * multiplier)) / 10);
      generateRandom = Math.floor(Math.random() * arr.length);
      shuffle = arr[generateRandom];
      if (arr.length == 0) {
        setArray('custom');
      }
      setCompletedProblems(arr.splice(generateRandom, 1));
      setNum1(shuffle[0]);
      setNum2(shuffle[1]);
    } else {
      playSound('incorrect');
      incorrectAns();
      setStreak(0);
      setMultiplier(1);
    }
  };

  const onChanged = (text) => {
    let newText = '';
    let numbers = '0123456789';

    for (var i = 0; i < text.length; i++) {
      if (numbers.indexOf(text[i]) > -1) {
        newText = newText + text[i];
      }
    }
    setNumber(newText);
  };

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  changeStyle = function () {
    if (score.toString().length + 3 > 7) {
      myFontSize = (7 * 390) / (4 * (score.toString().length + 3));
      myTopMargin = windowHeight * 0.05 + myFontSize / 0.9207235;
    } else {
      myFontSize = 390 / 4;
      myTopMargin = windowHeight * 0.05;
    }
    return {
      fontSize: myFontSize,
      alignSelf: 'center',
      color: '#f6f7fb',
      fontFamily: 'madetommy',
      textAlign: 'center',
      justifyContent: 'flex-start',
      textShadowColor: '#323854',
      textShadowRadius: 0,
      textShadowOffset: { width: 2, height: 2 },
    };
  };

  showCountdown = function () {
    if (!isRunning) {
      myOpacity = 0;
    } else {
      myOpacity = 1;
    }
    return {
      justifyContent: 'center',
      opacity: myOpacity,
      alignSelf: 'flex-end'
    };
  };

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      backgroundColor: '#0c0a2b',
      textAlign: 'center',
      textAlignVertical: 'center',
      flex: 1,
      width: '100%',
      height: '100%',
      paddingTop: Constants.statusBarHeight,
    },

    paragraph: {
      fontSize: 30,
      fontWeight: 'normal',
      textAlign: 'center',
      color: '#fbf3f2',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'madetommy',
    },
    input: {
      borderWidth: 1,
      color: '#f6f7fb',
      justifyContent: 'center',
      textAlign: 'center',
      alignItems: 'center',
      fontFamily: 'madetommy',
      fontWeight: 'normal',
      fontSize: 15,
      width: '60%',
    },
    titleContainer: {
      fontSize: 30,
      textAlign: 'center',
      color: '#8ed6c5',
      marginHorizontal: '3%',
      marginBottom: '1%',
      marginTop: '5%',
    },
    back: {
      marginHorizontal: '3%',
      fontWeight: 'normal',
      marginTop: '3%',
      fontSize: 20,
      alignSelf: 'flex-start',
      color: '#8ed6c5',
    },

    daswitch: {
      alignSelf: 'center',
      justifyContent: 'center',
      marginVertical: '5%',
    },

    viewPad: {
      width: windowWidth * 0.9,
      backgroundColor: '#323854',
      alignSelf: 'center',
      height: windowHeight * 0.3,
      borderRadius: 15,

    },

    scrollStyle: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: windowHeight * 0.01
    }
  });

  const [fontsLoaded] = useFonts({ // Importing Custom Fonts
    'madetommy': require('./assets/madetommy.otf'),
  });

  const [fontsLoaded2] = useFonts({
    'title': require('./assets/MotionPersonalUse.ttf')
  })

  const onLayoutRootView = React.useCallback(async () => { //Function that calls on Custom Font
    if (fontsLoaded && fontsLoaded2) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsLoaded2]);

  if (!fontsLoaded && !fontsLoaded2) {
    return null;
  }

  if (screen == 0) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: 'space-between' }]}
        onLayout={onLayoutRootView}>
        <Text
          style={[
            styles.paragraph,
            {
              fontFamily: 'title',
              color: '#f6f7fb',
              fontSize: 70,
              fontWeight: 'normal',
              marginTop: '20%',
              textShadowColor: '#000',
              textShadowRadius: 0,
              textShadowOffset: { width: 2, height: 2 },
            },
          ]}>
          MAD MINUTE MULTIPLY
        </Text>
        <View style={{ marginBottom: '50%', height: '40%', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => {
              setScreen(4);
              setRoundLength(60);
              setArray('easy');
              readysetgo();
              setCount('3');
              setSound();
            }}>
            <Text
              style={[
                styles.paragraph,
                {
                  color: '#f6f7fb',
                  fontSize: 35,
                  marginVertical: '1%',
                  textShadowColor: '#f66747',
                  textShadowRadius: 0,
                },
              ]}>
              Normal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setScreen(4);
              setArray('medium');
              setRoundLength(60);
              readysetgo();
              setCount('3');
              setSound();
            }}>
            <Text
              style={[
                styles.paragraph,
                {
                  color: '#f6f7fb',
                  fontSize: 35,
                  marginVertical: '1%',
                  textShadowColor: '#f66747',
                  textShadowRadius: 0,
                },
              ]}>
              Hard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setScreen(4);
              setArray('hard');
              setRoundLength(60);
              readysetgo();
              setSound();
            }}>
            <Text
              style={[
                styles.paragraph,
                {
                  color: '#f6f7fb',
                  fontSize: 35,
                  marginVertical: '1%',
                  textShadowColor: '#f66747',
                  textShadowRadius: 0,
                },
              ]}>
              Impossible
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setScreen((screen) => 3);
            }}>
            <View style={{borderRadius: 10, backgroundColor: '#dcbf54', marginBottoms: '10%', width: '45%', alignSelf: 'center'}}>
              <Text style={[styles.paragraph, {textAlign: 'center', paddingHorizontal: 30, paddingVertical: 10, color: '#0c0a2b', fontSize: 25}]} numberOfLines={1}>
              Custom
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen == 1) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: 'center' }]}
        onLayout={onLayoutRootView}>
        <TouchableOpacity
          onPress={() => {
            setNumber((number) => '');
            setScreen((screen) => 0);
            setScore(0);
            setMultiplier(1);
            setStreak(0);
            setIsRunning(true);
          }}>
          <Text
            style={[styles.back, { fontFamily: 'madetommy', color: '#f6f7fb' }]}>
            Back
          </Text>
        </TouchableOpacity>
          <Text style={this.changeStyle()} numberOfLines={1}>
            {score}pts
          </Text>
        <ScrollView keyboardShouldPersistTaps={'handled'} style={styles.scrollStyle}>
            <View style={styles.viewPad}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                marginHorizontal: '5%',
                height: windowHeight * 0.06,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  color: '#f6f7fb',
                  fontFamily: 'madetommy',
                  marginBottom: windowHeight * 0.005
                }}>
                🔥{streak}
              </Text>
              <CountDown
                style={this.showCountdown()}
                until={roundLength}
                onFinish={async () => {
                  setScreen((screen) => screen + 1);
                  if (score >= highscore) {
                    await storeHighScore(score);
                    setHighScore();
                    playSound('victory');
                  } else {
                    playSound('crowd');
                  }
                }}
                running={isRunning}
                size={20}
                digitStyle={{
                  borderWidth: 0,
                  borderColor: '#8ed6c5',
                  justifyContent: 'center',
                }}
                digitTxtStyle={{
                  color: '#f6f7fb',
                  fontFamily: 'madetommy',
                  fontWeight: 'normal',
                  fontSize: 20,
                  justifyContent: 'center',
                  marginTop: '43%',
                }}
                timeLabelStyle={{ color: 'red' }}
                separatorStyle={{ color: '#fff', marginTop: '200%' }}
                timeToShow={['M', 'S']}
                timeLabels={{ m: null, s: null }}
                showSeparator
              />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'madetommy',
                  color: '#f6f7fb',
                  marginBottom: windowHeight * 0.005
                }}>
                {multiplier}x pts
              </Text>
            </View>

          <View
            style={{
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginRight: '37.5%',
            }}>
            <Animated.Text
              style={[
                styles.paragraph,
                { fontSize: 75, color: color, marginLeft: '5%' },
              ]}>
              {num1}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.paragraph,
                { fontSize: 75, color: color, marginLeft: '5%' },
              ]}>
              x {num2}
            </Animated.Text>
          </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: windowWidth * 0.9,
              marginTop: '5%'
            }}>
            <TextInput
              onKeyPress={(event) => {
                if (event.nativeEvent.key == 'Enter') {
                  handleSubmit();
                }
              }}
              style={styles.input}
              onChangeText={(text) => onChanged(text)}
              value={number}
              placeholder="Type the Answer"
              keyboardType="number-pad"
              autoFocus={true}
            />
            <TouchableOpacity
              onPress={() => {
                if (isSubmit == 'Submit') {
                  {
                    handleSubmit();
                  }
                }
              }}>
              <Text
                style={[
                  styles.paragraph,
                  {
                    fontSize: 15,
                    marginVertical: '3%',
                    marginRight: '5%',
                    width: '100%',
                  },
                ]}>
                {isSubmit}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen == 2) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: 'space-between' }]}>
        <View>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 50,
                fontWeight: 'normal',
                marginVertical: '10%',
              },
            ]}>
            Score
          </Text>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 70,
                fontWeight: 'normal',
                color: '#f6f7fb',
              },
            ]}>
            {score}
          </Text>
        </View>
        <View style={{ marginVertical: '1%' }}>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 50,
                fontWeight: 'normal',
                marginVertical: '10%',
              },
            ]}>
            High Score
          </Text>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 70,
                fontWeight: 'normal',
                color: '#f6f7fb',
              },
            ]}>
            {highscore}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setNumber((number) => '');
            setScreen((screen) => 0);
            setScore(0);
            setMultiplier(1);
            setStreak(0);
            setIsRunning(true);
          }}>
            <View style={{borderRadius: 10, backgroundColor: '#dcbf54', marginBottom: '10%', width: '60%', alignSelf: 'center'}}>
              <Text style={[styles.paragraph, {textAlign: 'center', paddingHorizontal: 30, paddingVertical: 10, color: '#0c0a2b', fontSize: 25}]} numberOfLines={1}>
              Main Menu
              </Text>
            </View>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screen == 3) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            setScreen((screen) => 0);
          }}>
          <Text
            style={[styles.back, { fontFamily: 'madetommy', color: '#f6f7fb' }]}>
            Back
          </Text>
        </TouchableOpacity>
        <ScrollView>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 30,
                textAlignVertical: 'center',
                fontWeight: 'normal',
                marginHorizontal: '1%',
              },
            ]}>
            Top Number Minimum Value
          </Text>
          <Text style={[styles.paragraph, { color: '#f6f7fb' }]}>
            {customLmin}
          </Text>
          <Slider
            style={styles.titleContainer}
            value={customLmin}
            maximumValue={100}
            minimumValue={0}
            step={1}
            onValueChange={(w) => setCustomLmin(w)}
            minimumTrackTintColor="#dcbf54"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 30,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            Top Number Maximum Value
          </Text>
          <Text style={[styles.paragraph, { color: '#f6f7fb' }]}>
            {customLmax}
          </Text>
          <Slider
            style={styles.titleContainer}
            value={customLmax}
            maximumValue={100}
            minimumValue={0}
            step={1}
            onValueChange={(w) => setCustomLmax(w)}
            minimumTrackTintColor="#dcbf54"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 30,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            Bottom Number Minimum Value
          </Text>
          <Text style={[styles.paragraph, { color: '#f6f7fb' }]}>
            {customRmin}
          </Text>
          <Slider
            style={styles.titleContainer}
            value={customRmin}
            maximumValue={100}
            minimumValue={0}
            step={1}
            onValueChange={(w) => setCustomRmin(w)}
            minimumTrackTintColor="#dcbf54"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 30,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            Bottom Number Maximum Value
          </Text>
          <Text style={[styles.paragraph, { color: '#f6f7fb' }]}>
            {customRmax}
          </Text>
          <Slider
            style={styles.titleContainer}
            value={customRmax}
            maximumValue={100}
            minimumValue={0}
            step={1}
            onValueChange={(w) => setCustomRmax(w)}
            minimumTrackTintColor="#dcbf54"
            maximumTrackTintColor="#f6f7fb"
          />

          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 30,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            Time Limit
          </Text>
          <Text style={[styles.paragraph, { color: '#f6f7fb' }]}>
            {roundLength / 60} {roundLength / 60 == 1 ? "minute" : "minutes"}
          </Text>
          <Slider
            style={styles.titleContainer}
            value={roundLength}
            maximumValue={600}
            minimumValue={30}
            step={30}
            onValueChange={(w) => setRoundLength(w)}
            minimumTrackTintColor="#dcbf54"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'madetommy',
                fontSize: 30,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            Practice Mode
          </Text>
          <Switch
            style={styles.daswitch}
            trackColor={{ false: '#767577', true: '#dcbf54' }}
            thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
          <TouchableOpacity
            onPress={async () => {
              if (customLmin > customLmax || customRmin > customRmax) {
                await sendPushNotification();
              } else {
                setScreen(4);
                setArray('custom');
                readysetgo();
                setCount('3');
                if (!isEnabled) {
                  setIsRunning(true);
                } else {
                  setIsRunning(false);
                }
              }
            }}>
            <View style={{borderRadius: 10, backgroundColor: '#dcbf54', marginBottom: '10%', width: '45%', alignSelf: 'center'}}>
              <Text style={[styles.paragraph, {textAlign: 'center', paddingHorizontal: 30, paddingVertical: 10, color: '#0c0a2b', fontSize: 25}]} numberOfLines={1}>
              Start
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
  if (screen == 4) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.Text
          style={[styles.paragraph, { color: textcolor, fontSize: 180 }]}>
          {count}
        </Animated.Text>
      </SafeAreaView>
    );
  }

  async function sendPushNotification() {
    console.log(Device);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Error!',
        body: 'Minimum value cannot exceed maximum value',
      },
      trigger: { seconds: 1 },
    });
    if (Device.osName != 'iOS' && Device.osName != 'iPadOS') {
      alert('Error! Minimum value cannot exceed maximum value.');
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }
}
