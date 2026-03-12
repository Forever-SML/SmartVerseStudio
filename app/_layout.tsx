import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'login',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="screens/BeatMaker"
          options={{
            headerShown: true,
            title: 'Beat Maker',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/Metronome"
          options={{
            headerShown: true,
            title: 'Metronome',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/Mixer"
          options={{
            headerShown: true,
            title: 'Mixer',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/MyTracks"
          options={{
            headerShown: true,
            title: 'My Tracks',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/AICamera"
          options={{
            headerShown: true,
            title: 'AI Camera',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/RecordVideo"
          options={{
            headerShown: true,
            title: 'Record Video',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/EditVideo"
          options={{
            headerShown: true,
            title: 'Edit Video',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/GoLive"
          options={{
            headerShown: true,
            title: 'Go Live',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#FF4444',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/Collaborate"
          options={{
            headerShown: true,
            title: 'Collaborate',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/EditProfile"
          options={{
            headerShown: true,
            title: 'Edit Profile',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="screens/AIInstruments"
          options={{
            headerShown: true,
            title: 'AI Instruments',
            headerStyle: { backgroundColor: '#0A0A0A' },
            headerTintColor: '#C77DFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}