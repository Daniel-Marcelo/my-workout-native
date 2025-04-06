import React from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <ThemedText type="subtitle">Today's Progress</ThemedText>
          <View style={styles.card}>
            <ThemedText>Your workout stats will appear here</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Recent Workouts</ThemedText>
          <View style={styles.card}>
            <ThemedText>Your recent workouts will appear here</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Goals</ThemedText>
          <View style={styles.card}>
            <ThemedText>Your fitness goals will appear here</ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    }),
  },
});
