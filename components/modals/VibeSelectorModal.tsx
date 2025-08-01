import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { VIBE_OPTIONS } from "../../constants/vibeOptions";

type Props = {
  visible: boolean;
  selectedVibes: string[];
  setSelectedVibes?: (vibes: string[]) => void;
  onClose: () => void;
  onToggle: (vibes: string[]) => void;
};

export default function VibeSelectorModal({
  visible,
  selectedVibes,
  setSelectedVibes,
  onClose,
  onToggle,
}: Props) {
  const [tempVibes, setTempVibes] = React.useState(selectedVibes);

  const toggleVibe = (key: string) => {
    setTempVibes((prev) => {
      const updated = prev.includes(key)
        ? prev.filter((v) => v !== key)
        : [...prev, key];
      if (typeof setSelectedVibes === "function") {
        setSelectedVibes(updated);
      }
      onToggle(updated); // Immediately apply the new vibe filter
      return updated;
    });
  };

  React.useEffect(() => {
    if (visible) setTempVibes(selectedVibes);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modal}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Select Vibes</Text>
              <ScrollView contentContainerStyle={styles.container}>
                {VIBE_OPTIONS.map((vibe) => (
                  <TouchableOpacity
                    key={vibe.key}
                    style={[
                      styles.chip,
                      tempVibes.includes(vibe.key) && styles.chipSelected,
                    ]}
                    onPress={() => toggleVibe(vibe.key)}
                  >
                    <Text
                      style={{
                        color: tempVibes.includes(vibe.key) ? "#fff" : "#333",
                      }}
                    >
                      {vibe.emoji} {vibe.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.buttonRow}>
                <Button
                  title="Clear"
                  onPress={() => {
                    setTempVibes([]);
                    setSelectedVibes?.([]);
                    onToggle([]);
                  }}
                  color="#888"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 20,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: "#007aff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
});
