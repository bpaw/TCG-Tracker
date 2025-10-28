// To clear storage programmatically, add this to App.tsx temporarily:
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add before initialize():
await AsyncStorage.clear();
console.log('Storage cleared!');
