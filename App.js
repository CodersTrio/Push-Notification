import React, { useEffect, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

Notifications.setNotificationHandler({
  handleNotification: () => {
    return ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      // shouldSetBadge: true,
    })
  }
})

const App = () => {
  const [pushToken, setPushToken] = useState();
  console.log('push token:', pushToken)

  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then((statusObj) => {
        if (statusObj.status !== 'granted') {
          return Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== 'granted') {
          throw new Error('Permission not granted!');
        }
      })
      .then(() => {
        console.log('getting token');
        return Notifications.getExpoPushTokenAsync();
      })
      .then(response => {
        const token = response.data;
        setPushToken(token);
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }, []);

  useEffect(() => {
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    })

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    })

    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    }

  }, [])

  const triggerNotifications = () => {
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: 'Hello',
    //     body: 'This is a test notification',
    //   },
    //   trigger: {
    //     seconds: 5,
    //   }
    // })
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        data: { extraData: 'Some data' },
        title: 'Sent via the app',
        body: 'This push notification was sent via the app!',
      }),
    });
  }

  return (
    <View style={styles.container}>
      <Button onPress={triggerNotifications} title="Trigger Notification" />
    </View>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})
