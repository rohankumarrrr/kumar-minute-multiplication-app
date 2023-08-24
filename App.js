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

//This is my "Mad Minute Multiplication" App, designed to be quiz game that is fun but also educational. The game features three modes: easy (0x0 to 12x12), medium (0x0 to 100x12), hard (0x0 to 100x100), and custom (the user chooses the upper and lower bounds of both numbers). For the custom game mode, the user will be alerted on Web or given a toast notification on iOS and Android if their lower bound for a certain number is bigger than the upper bound for that same number. This app is best enjoyed with the ringer on the mobile devices turned off, as it features lots of cool sound effects that act as auditory feedback for the user for a correct or incorrect answer. I am once again importing animated, which is used for the countdown at the beginning and the incorrect answer. NOTE: I acknowledge that my 'readysetgo' countdown function is EXTREMELY repetitive. However, I could not figure out how to make it more concise with the given time constraints. My app also has AsyncStorage, which is used to save the high score a user achieves for their game even after they exit the app. I was thinking of creating an array with a separate high score for each game mode, but this would be difficult with the given time constraints. I also imported a custom font called Chalkboy, to give the app a moe User-Friendly look. Each gamemode has a one-minute countdown timer, and the user can earn streaks for getting multiple questions correct in succession. The higher the streak, the higher the multiplier, which increases the score earned (the user earns 10 *  the multiplier value for each correct question). For once, my app works on Android with no issues apart from minor scaling differences which do not in any way limit the functionality of the app. I am also using the fontshrinking feature from my Calculator App to change the font size if the user's score is too large. Overall, I am very proud of what I have achieved with this app and while I may not have experimented as much with new components as I did with previous projects, I think it is a combination of the best aspects of all my works. I also do think shadows behind the text would have greatly improved the aesthetics of the app, but unfortunately shadowProps are not supported on Android and I was not willing to break my app on Android again. I also have a Practice Mode within Custom where the timer does not run and the user can practice problems infinitely.

export default function App() {
  let shuffle;
  let generateRandom;
  const [completedProblems, setCompletedProblems] = useState([]);
  const Stack = createNativeStackNavigator();
  const [arr, createArr] = useState([]);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [sound, setSound] = React.useState();
  const [screen, setScreen] = useState(0);
  const [isSubmit, setisSubmit] = useState('SUBMIT');
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
    await playSound('count1');
    Animated.timing(textanimation, {
      toValue: 1,
      duration: 500,
    }).start(() => {
      Animated.timing(textanimation, {
        toValue: 0,
        duration: 500,
      }).start(() => {
        playSound('count1');
        setCount('2');
        Animated.timing(textanimation, {
          toValue: 1,
          duration: 500,
        }).start(() => {
          Animated.timing(textanimation, {
            toValue: 0,
            duration: 500,
          }).start(() => {
            playSound('count1');
            setCount('1');
            Animated.timing(textanimation, {
              toValue: 1,
              duration: 500,
            }).start(() => {
              Animated.timing(textanimation, {
                toValue: 0,
                duration: 500,
              }).start(async () => {
                playSound('count2');
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
    if (s == 'count1') {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/count1.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    }
    if (s == 'count2') {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/count2.mp3')
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
      marginVertical: windowHeight * 0.01,
      alignSelf: 'center',
      color: '#f6f7fb',
      fontFamily: 'Chalkboy',
      textAlign: 'center',
      justifyContent: 'flex-start',
      textShadowColor: '#f66747',
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
    };
  };

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      backgroundColor: '#191919',
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
      fontFamily: 'Chalkboy',
    },
    input: {
      borderWidth: 1,
      color: '#f6f7fb',
      justifyContent: 'center',
      textAlign: 'center',
      alignItems: 'center',
      fontFamily: 'Chalkboy',
      fontWeight: 'normal',
      fontSize: 30,
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
  });

  const [fontsLoaded] = useFonts({
    //Loading a Custom Font
    Chalkboy: require('./assets/ChalkboyRegular.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    //Function that calls on Custom Font
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (screen == 0) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: 'center' }]}
        onLayout={onLayoutRootView}>
        <Text
          style={[
            styles.paragraph,
            {
              fontFamily: 'Chalkboy',
              color: '#f66747',
              fontSize: 55,
              fontWeight: 'normal',
              marginTop: '10%',
              textShadowColor: '#000',
              textShadowRadius: 0,
              textShadowOffset: { width: 2, height: 2 },
            },
          ]}>
          Mad Minute Multiplication
        </Text>
        <View style={{ marginBottom: '30%' }}>
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
                  fontSize: 60,
                  marginVertical: '1%',
                  textShadowColor: '#f66747',
                  textShadowRadius: 0,
                  textShadowOffset: { width: 2, height: 2 },
                },
              ]}>
              Easy
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
                  fontSize: 60,
                  marginVertical: '1%',
                  textShadowColor: '#f66747',
                  textShadowRadius: 0,
                  textShadowOffset: { width: 2, height: 2 },
                },
              ]}>
              Normal
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
                  fontSize: 60,
                  marginVertical: '1%',
                  textShadowColor: '#f66747',
                  textShadowRadius: 0,
                  textShadowOffset: { width: 2, height: 2 },
                },
              ]}>
              Hard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setScreen((screen) => 3);
            }}>
            <Text
              style={[
                styles.paragraph,
                {
                  color: '#f6f7fb',
                  fontSize: 60,
                  marginVertical: '1%',
                  textShadowColor: '#f66747',
                  textShadowRadius: 0,
                  textShadowOffset: { width: 2, height: 2 },
                },
              ]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen == 1) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: 'space-around' }]}
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
            style={[styles.back, { fontFamily: 'Chalkboy', color: '#f6f7fb' }]}>
            BACK
          </Text>
        </TouchableOpacity>
        <ScrollView keyboardShouldPersistTaps={'handled'}>
          <View>
            <Text style={this.changeStyle()} numberOfLines={1}>
              {score}pts
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                marginHorizontal: '5%',
              }}>
              <Text
                style={{
                  fontSize: 30,
                  color: '#f6f7fb',
                  fontFamily: 'Chalkboy',
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
                  fontFamily: 'Chalkboy',
                  fontWeight: 'normal',
                  fontSize: 30,
                  justifyContent: 'center',
                  marginTop: '43%',
                }}
                timeLabelStyle={{ color: 'red' }}
                separatorStyle={{ color: '#f66747', marginTop: '200%' }}
                timeToShow={['M', 'S']}
                timeLabels={{ m: null, s: null }}
                showSeparator
              />
              <Text
                style={{
                  fontSize: 30,
                  fontFamily: 'Chalkboy',
                  color: '#f6f7fb',
                }}>
                {multiplier}x pts
              </Text>
            </View>
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
                { fontSize: 100, color: color, marginLeft: '5%' },
              ]}>
              {num1}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.paragraph,
                { fontSize: 100, color: color, marginLeft: '5%' },
              ]}>
              x {num2}
            </Animated.Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
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
              placeholder="TYPE THE ANSWER"
              keyboardType="number-pad"
              autoFocus={true}
            />
            <TouchableOpacity
              onPress={() => {
                if (isSubmit == 'SUBMIT') {
                  {
                    handleSubmit();
                  }
                }
              }}>
              <Text
                style={[
                  styles.paragraph,
                  {
                    fontSize: 40,
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
                fontFamily: 'Chalkboy',
                fontSize: 70,
                fontWeight: 'normal',
                marginVertical: '10%',
              },
            ]}>
            SCORE
          </Text>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
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
                fontFamily: 'Chalkboy',
                fontSize: 70,
                fontWeight: 'normal',
                marginVertical: '10%',
              },
            ]}>
            HIGH SCORE
          </Text>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
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
          <Text
            style={[
              styles.paragraph,
              {
                fontSize: 55,
                marginVertical: '10%',
                borderWidth: 2,
                borderColor: '#f66747',
                alignSelf: 'center',
              },
            ]}>
            MAIN MENU
          </Text>
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
            style={[styles.back, { fontFamily: 'Chalkboy', color: '#f6f7fb' }]}>
            BACK
          </Text>
        </TouchableOpacity>
        <ScrollView>
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
                fontSize: 40,
                textAlignVertical: 'center',
                fontWeight: 'normal',
                marginHorizontal: '1%',
              },
            ]}>
            TOP NUMBER MINIMUM VALUE
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
            minimumTrackTintColor="#f66747"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
                fontSize: 40,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            TOP NUMBER MAXIMUM VALUE
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
            minimumTrackTintColor="#f66747"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
                fontSize: 40,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            BOTTOM NUMBER MINIMUM VALUE
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
            minimumTrackTintColor="#f66747"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
                fontSize: 40,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            BOTTOM NUMBER MAXIMUM VALUE
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
            minimumTrackTintColor="#f66747"
            maximumTrackTintColor="#f6f7fb"
          />

          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
                fontSize: 40,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            TIME LIMIT
          </Text>
          <Text style={[styles.paragraph, { color: '#f6f7fb' }]}>
            {roundLength / 60} Minutes
          </Text>
          <Slider
            style={styles.titleContainer}
            value={roundLength}
            maximumValue={600}
            minimumValue={30}
            step={30}
            onValueChange={(w) => setRoundLength(w)}
            minimumTrackTintColor="#f66747"
            maximumTrackTintColor="#f6f7fb"
          />
          <Text
            style={[
              styles.paragraph,
              {
                fontFamily: 'Chalkboy',
                fontSize: 40,
                textAlignVertical: 'center',
                fontWeight: 'normal',
              },
            ]}>
            PRACTICE MODE?
          </Text>
          <Switch
            style={styles.daswitch}
            trackColor={{ false: '#767577', true: '#f66747' }}
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
            <Text
              style={[
                styles.paragraph,
                {
                  fontSize: 55,
                  marginVertical: '5%',
                  borderWidth: 2,
                  borderColor: '#f66747',
                  width: '50%',
                  alignSelf: 'center',
                },
              ]}>
              START
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
  if (screen == 4) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.Text
          style={[styles.paragraph, { color: textcolor, fontSize: 240 }]}>
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
