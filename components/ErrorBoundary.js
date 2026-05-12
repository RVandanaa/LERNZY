import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

/**
 * Catches React render errors so the app does not white-screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      console.warn("ErrorBoundary", error?.message, info?.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            The app hit an unexpected error. You can try again or restart the app.
          </Text>
          {__DEV__ && this.state.error?.message ? (
            <Text style={styles.detail}>{String(this.state.error.message)}</Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} accessibilityRole="button">
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F4F6FB",
    paddingTop: Platform.OS === "ios" ? 56 : 36
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1D2E",
    marginBottom: 8,
    textAlign: "center"
  },
  body: {
    fontSize: 15,
    color: "#5A5E78",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22
  },
  detail: {
    fontSize: 12,
    color: "#9EA3B8",
    marginBottom: 16,
    textAlign: "center"
  },
  button: {
    backgroundColor: "#4F6EF7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  }
});
