import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const inspirationalQuotes = [
  "Travel is the only thing you buy that makes you richer.",
  "Adventure awaits at every station.",
  "Life is a journey, enjoy the ride.",
  "The journey of a thousand miles begins with a single step.",
  "Collect moments, not things.",
  "Not all who wander are lost.",
  "To travel is to live.",
  "Every journey begins with a single ticket.",
  "The world is a book, and those who do not travel read only one page.",
  "Journey safe, travel smart.",
  "Let's find some beautiful places to get lost.",
  "Travel far enough to meet yourself.",
  "The journey itself is home.",
  "Take only memories, leave only footprints.",
  "Travel brings power and love back into your life.",
];

export default function AdPlaceholder() {
  const colorScheme = useColorScheme();
  
  const quote = useMemo(() => {
    return inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f9fafb',
          borderColor: colorScheme === 'dark' ? '#333' : '#e5e7eb',
        },
      ]}
    >
      <ThemedText style={styles.label}>Advertisement</ThemedText>
      <View style={styles.quoteContainer}>
        <ThemedText style={styles.quote}>"{quote}"</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    opacity: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quoteContainer: {
    paddingHorizontal: 12,
  },
  quote: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    opacity: 0.8,
  },
});
