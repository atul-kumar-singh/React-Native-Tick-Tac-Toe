import React, { Component } from 'react';
import PubNubReact from 'pubnub-react';
import {
  Platform,
  StyleSheet,
  View,
  Alert,
  Text,
  ActivityIndicator
} from 'react-native';

import Game from './src/components/Game';
import Lobby from './src/components/Lobby';
import shortid  from 'shortid';
//import Spinner from 'react-native-spinkit';
import prompt from 'react-native-prompt-android';
import Spinner from 'react-native-loading-spinner-overlay';
console.disableYellowBox = true;

//var Spinner = require('react-native-spinkit');
import Waiting from './src/components/Waiting' ;
//import { CirclesRotationScaleLoader, TextLoader } from 'react-native-indicator';


export default class App extends Component {
  constructor(props) {
    super(props);

    this.pubnub = new PubNubReact({
      publishKey: "pub-c-2044f59d-6d75-4c29-b4da-dd0f156e4318", 
      subscribeKey: "sub-c-b4bf70d0-d47a-11ea-9485-d6b39d8ad52f",
    });
    
    this.state = {
      username: '',
      piece: '',
      x_username: '',
      o_username: '',
      y_username: '',
      z_username: '',
      is_playing: false,
      is_waiting: false,
      is_room_creator: false,
      isDisabled: false,
      total_players_count: 0,
      playersArray: []
    };
    this.channel = null;
    this.pubnub.init(this);
  }

  componentWillUnmount() {
    this.pubnub.unsubscribe({
      channels : ['gameLobby', this.channel]
    });
  }
  
  componentDidMount() {
    this.pubnub.subscribe({
      channels: ['gameLobby'],
      withPresence: true
    });

    this.pubnub.getMessage('gameLobby', (msg) => {
      // Set username for Player X
      if(msg.message.is_room_creator){
        this.setState({
          x_username: msg.message.username,
          total_players_count: 1
        })
      }
      else if(msg.message.not_room_creator){
        this.pubnub.unsubscribe({
          channels : ['gameLobby']
        });
        switch (msg.message.total_players_count) {
          case 1:
              return "";
          case 2:
            this.setState({
              o_username: msg.message.username,
              is_waiting: false,
              is_playing: true
            });
            break ;
          case 3:
            this.setState({
              y_username: msg.message.username,
              is_waiting: true,
              is_playing: false
            }); 
            break ;
          case 4:
            this.setState({
              z_username: msg.message.username,
              is_waiting: false,
              is_playing: true
            }); 
            break ;
          default:
              return "";
        }
      }
    });
  }

  onChangeUsername = (username) => {
    this.setState({username});
  }

  onPressCreateRoom = () => {
    if(this.state.username === ''){
      Alert.alert('Error','Please enter a username');
    }
    else{
      // Random channel name generated
      let roomId = shortid.generate();
      let shorterRoomId = roomId.substring(0,5);
      roomId = shorterRoomId;
      this.channel = 'tictactoe--' + roomId;
      this.pubnub.subscribe({
        channels: [this.channel],
        withPresence: true
      });
  
      // alert the room creator to share the room ID with their friend
      Alert.alert(
        'Share this room ID with your friend',
        roomId,
        [
          {text: 'Done'},
        ],
        { cancelable: false }
      );
  
      // show the Spinner component while waiting for someone to join the room
      this.setState({
        piece: 'X',
        is_room_creator: true,
        is_waiting: true,
        isDisabled: true
      });

      this.pubnub.publish({
        message: {
          is_room_creator: true,
          username: this.state.username,
          total_players_count: 1,
          playersArray: [this.state.username]
        },
        channel: 'gameLobby'
      });  
    }
  }

  joinRoom = (room_id) => {
    this.channel = 'tictactoe--' + room_id;
 
    // Check that the lobby is not full
    this.pubnub.hereNow({
      channels: [this.channel], 
    }).then((response) => { 
      // If totalOccupancy is less than or equal to 1, then player can't join a room since it has not been created
      if(response.totalOccupancy <= 1){
        Alert.alert('Lobby is empty','Please create a room or wait for someone to create a room to join.');
      }
      else if(response.totalOccupancy === 2){
        this.pubnub.subscribe({
          channels: [this.channel],
          withPresence: true
        });
        
        this.pubnub.publish({
          message: {
            readyToPlay: true,
            not_room_creator: true,
            username: this.state.username,
            total_players_count: 2,
            playersArray: playersArray.push(this.state.username)
          },
          channel: 'gameLobby'
        });
      }
      // else if(response.totalOccupancy === 3){
      //   this.pubnub.subscribe({
      //     channels: [this.channel],
      //     withPresence: true
      //   });
        
      //   this.pubnub.publish({
      //     message: {
      //       readyToPlay: false,
      //       not_room_creator: true,
      //       username: this.state.username,
      //       total_players_count: 3,
      //       playersArray: playersArray.push(this.state.username)
      //     },
      //     channel: 'gameLobby'
      //   });
      // } 
      // else if(response.totalOccupancy === 4){
      //   this.pubnub.subscribe({
      //     channels: [this.channel],
      //     withPresence: true
      //   });
        
      //   this.pubnub.publish({
      //     message: {
      //       readyToPlay: true,
      //       not_room_creator: true,
      //       username: this.state.username,
      //       total_players_count: 4,
      //       playersArray: playersArray.push(this.state.username)
      //     },
      //     channel: 'gameLobby'
      //   });
      // } 
      else{
        Alert.alert('Room full','Please enter another room name');
      }
    }).catch((error) => { 
        console.log(error)
    });
  }

  onPressJoinRoom = () => {
    if(this.state.username === ''){
      Alert.alert('Error','Please enter a username');
    }
    else{
      // Check for platform
      if (Platform.OS === "android") {
        prompt(
          'Enter the room name',
          '',
          [
           {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           {text: 'OK', onPress: (value) =>  
           (value === '') ? '' : this.joinRoom(value)},
          ],
          {
              type: 'default',
              cancelable: false,
              defaultValue: '',
              placeholder: ''
            }
        );      
      }
      else if (Platform.OS === "ios"){
        Alert.prompt(
          'Enter the room name',
          '',
          [
           {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           {text: 'OK', onPress: (value) =>  
           (value === '') ? '' : this.joinRoom(value)},
          ],
          'plain-text',
        );
      }  
      else{
        const roomName = prompt("Please enter your name");
        if(roomName !== ''){
          this.joinRoom(value);
        }
      }
    }
  }

  // Reset everything
  endGame = () => {
    this.setState({
      username: '',
      piece: '',
      x_username: '',
      o_username: '',
      y_username: '',
      z_username: '',
      total_players_count: 0,
      is_playing: false,
      is_waiting: false,
      is_room_creator: false,
      isDisabled: false
    });

    // Subscribe to gameLobby again on a new game

    this.channel = null;
    this.pubnub.subscribe({
      channels: ['gameLobby'],
      withPresence: true
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.title_container}>
          <Text style={styles.title}>AKS Native Tic-Tac-Toe</Text>
        </View>

        {
          this.state.is_waiting && 
          <View style={styles.spinner_container}>
            <ActivityIndicator style={styles.spinnerStyles} size="large" color="#0000cc" ><Text>Waiting ...</Text></ActivityIndicator>
          </View>
        }

        {
          !this.state.is_playing &&
          <Lobby 
            username={this.state.name} 
            onChangeUsername={this.onChangeUsername}
            onPressCreateRoom={this.onPressCreateRoom} 
            onPressJoinRoom={this.onPressJoinRoom}
            isDisabled={this.state.isDisabled}
          />
        }
      
        {
            this.state.is_playing &&
            <Game 
              pubnub={this.pubnub}
              channel={this.channel} 
              username={this.state.username} 
              piece={this.state.piece}
              x_username={this.state.x_username}
              o_username={this.state.o_username}
              is_room_creator={this.state.is_room_creator}
              endGame={this.endGame}
            />
          }
          <View style={styles.footer_container}>
            <Text style={styles.footer_text}>Developed By Atul Kumar Singh (A.K.S)</Text>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  spinner: {
    flex: 1,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 50
  },
  title_container: {
    flex: 1,
    marginTop: 18
  },
  title: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    marginTop: 20,
    color: 'rgb(0,0,204)'
  },
  spinnerTextStyle: {
    color: '#FFF',
    flex: 1,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 50
  },
  footer_container: {
    flex: 1,
    marginTop: 18
  },
  footer_text: {
    fontSize: 14,
    color: 'rgb(0,0,204)',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0
  },
  spinnerStyles: {
    color: '#FFF',
    flex: 1,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 50,
    width: 100,
    height: 100
  },
  spinner_container: {
    flex: 1, justifyContent: "center", alignItems: "center"
  }
});
