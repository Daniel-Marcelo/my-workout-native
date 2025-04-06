import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

type SecondaryTextProps = {
  children: React.ReactNode;
  bold?: boolean;
  style?: TextStyle;
};

export const SecondaryText = ({
  children,
  bold,
  style = {},
}: SecondaryTextProps) => {
  return (
    <Text style={[styles.defaultStyle, bold && styles.bold, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    color: "grey",
    fontSize: 14, // Approximately equivalent to 0.875rem
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
  },
});
