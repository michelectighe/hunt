import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { Pin, Species } from "../../types";
import { SpeciesBar } from "./SpeciesBar";
// ❌ remove this (hook version) if using context
// import { useSpecies } from "../hooks/useSpecies";

interface EditPinModalProps {
  styles: any;
  visible: boolean;
  pin: Pin | null;
  editSpecies: Species | null;
  setEditSpecies: (s: Species) => void;
  editNote: string;
  setEditNote: (s: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const EditPinModal: React.FC<EditPinModalProps> = ({
  styles,
  visible,
  pin,
  editSpecies,
  setEditSpecies,
  editNote,
  setEditNote,
  onSave,
  onDelete,
  onClose,
}) => {
  // ❌ not needed with context-based SpeciesBar
  // const { species } = useSpecies();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
            style={{ width: "100%" }}
          >
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Edit Pin</Text>
                {pin && (
                  <>
                    <Text style={styles.modalSub}>
                      {new Date(pin.ts).toLocaleString()} •
                    </Text>
                    {pin.moonPhase != null && pin.moonIllum != null && (
                      <Text style={styles.modalSub}>
                        {Math.round((pin.moonIllum ?? 0) * 100)}% •{" "}
                        {pin.moonPhase}
                      </Text>
                    )}
                    <Text style={styles.modalSub}>
                      Land: {pin.own.toUpperCase()}
                    </Text>

                    <Text style={styles.modalCoords}>
                      {pin.lat.toFixed(5)}, {pin.lon.toFixed(5)}
                    </Text>

                    {/* Context-based SpeciesBar: just selection + setter */}
                    <SpeciesBar
                      selected={editSpecies}
                      onSelect={setEditSpecies}
                    />

                    <Text style={styles.label}>Note</Text>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Add a note…"
                      placeholderTextColor="#7a8a82"
                      value={editNote}
                      onChangeText={setEditNote}
                      multiline
                      textAlignVertical="top"
                      returnKeyType="done"
                      blurOnSubmit
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                        <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={onClose}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={onDelete}
                      >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
