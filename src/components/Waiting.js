import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class Waiting extends Component {
  constructor() {
    super();
  }

  render() {
    return (        
      <View style={styles.content_container}>
        <Text>
            This is Waiting Room
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content_container: {
    flex: 1,
  },
});
