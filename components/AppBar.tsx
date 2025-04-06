import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { SecondaryText } from "./SecondaryText";

type RootStackParamList = {
  Dashboard: undefined;
  CreateNewPlan: undefined;
};

type AppBarProps = {
  title: string;
};

const DRAWER_WIDTH = 250;
const ANIMATION_DURATION = 250;

export const AppBar = ({ title }: AppBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleDrawer = () => {
    const toValue = isOpen ? -DRAWER_WIDTH : 0;
    const fadeToValue = isOpen ? 0 : 0.5;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: fadeToValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const navigateTo = (route: keyof RootStackParamList) => {
    toggleDrawer();
    navigation.navigate(route);
  };

  const menuItems = [
    { label: "Dashboard", route: "dashboard " as const },
    { label: "Create New Plan", route: "create-plan" as const },
  ];

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>
      </SafeAreaView>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            pointerEvents: isOpen ? "auto" : "none",
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <View style={styles.overlayTouch} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={styles.drawerContent}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Menu</Text>
          </View>
          <View style={styles.drawerItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.drawerItem}
                onPress={() => navigateTo(item.route)}
              >
                <SecondaryText style={styles.drawerItemText}>
                  {item.label}
                </SecondaryText>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
    zIndex: 1,
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
  appBar: {
    height: 56,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    zIndex: 2,
  },
  overlayTouch: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "white",
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
      },
    }),
  },
  drawerContent: {
    flex: 1,
    backgroundColor: "white",
  },
  drawerHeader: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  drawerItems: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  drawerItemText: {
    fontSize: 16,
  },
});
