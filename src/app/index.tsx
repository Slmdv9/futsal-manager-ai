import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Futsal Manager AI</Text>
        <Text style={styles.subtitle}>
          Pizarras, ejercicios y programación para entrenadores de fútbol sala.
        </Text>
        <Text style={styles.status}>Aplicación en construcción</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: '#006948',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#131b2e',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  status: {
    color: '#3d4a42',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
