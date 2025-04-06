import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Text,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  LongPressGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock exercise database
const EXERCISE_DATABASE = [
  { id: "1", name: "Bench Press", category: "Chest" },
  { id: "2", name: "Squat", category: "Legs" },
  { id: "3", name: "Deadlift", category: "Back" },
  { id: "4", name: "Overhead Press", category: "Shoulders" },
  { id: "5", name: "Pull-up", category: "Back" },
  { id: "6", name: "Push-up", category: "Chest" },
  { id: "7", name: "Lunges", category: "Legs" },
  { id: "8", name: "Bicep Curl", category: "Arms" },
  { id: "9", name: "Tricep Extension", category: "Arms" },
  { id: "10", name: "Plank", category: "Core" },
];

type Exercise = {
  id: string;
  name: string;
  category: string;
};

type ExerciseSet = {
  id: string;
  type: "single" | "superset";
  exercises: Exercise[];
  sets: number;
  reps: number[];
  rest: number[];
};

type DraggableSetItemProps = {
  item: {
    id: string;
    reps: string;
    rest: string;
  };
  index: number;
  onRepsChange: (value: number) => void;
  onRestChange: (value: number) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
};

export default function CreatePlanScreen() {
  const [planName, setPlanName] = useState("");
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isConfiguringExercise, setIsConfiguringExercise] = useState(false);
  const [currentSetType, setCurrentSetType] = useState<"single" | "superset">(
    "single"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState<string[]>(["10", "10", "10"]);
  const [rest, setRest] = useState<string[]>(["100", "100", "100"]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfiguringSet, setIsConfiguringSet] = useState(false);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const addExerciseSet = (type: "single" | "superset") => {
    setCurrentSetType(type);
    setSelectedExercises([]);
    setSearchQuery("");
    setIsAddingExercise(true);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    if (currentSetType === "single") {
      setSelectedExercises([exercise]);
      setIsAddingExercise(false);
      setIsConfiguringExercise(true);
    } else {
      setSelectedExercises((prev) => {
        const isSelected = prev.some((e) => e.id === exercise.id);
        if (isSelected) {
          return prev.filter((e) => e.id !== exercise.id);
        }
        return [...prev, exercise];
      });
    }
  };

  const handleAddExercises = () => {
    if (selectedExercises.length > 0) {
      const newSet: ExerciseSet = {
        id: Date.now().toString(),
        type: currentSetType,
        exercises: selectedExercises,
        sets: parseInt(sets),
        reps: reps.map((r) => parseInt(r)),
        rest: rest.map((r) => parseInt(r)),
      };
      setExerciseSets((prev) => [...prev, newSet]);
      setIsConfiguringExercise(false);
      setSets("3");
      setReps(["10", "10", "10"]);
      setRest(["100", "100", "100"]);
    }
  };

  const renderSetConfigurations = () => {
    const numSets = parseInt(sets);
    const setItems = Array.from({ length: numSets }, (_, i) => ({
      id: i.toString(),
      reps: reps[i] || "10",
      rest: rest[i] || "100",
    }));

    return (
      <View style={styles.setsListContainer}>
        <FlatList
          data={setItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.setConfiguration}>
              <View style={styles.setHeader}>
                <Text style={styles.setLabel}>Set {index + 1}</Text>
                <View style={styles.setValues}>
                  <Text style={styles.repValue}>{item.reps} reps</Text>
                  <Text style={styles.restValue}>{item.rest}s rest</Text>
                </View>
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Reps</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={20}
                  step={1}
                  value={parseInt(item.reps)}
                  onValueChange={(value: number) => {
                    const newReps = [...reps];
                    newReps[index] = value.toString();
                    setReps(newReps);
                  }}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#E5E5EA"
                  thumbTintColor="#007AFF"
                />
                <Text style={styles.sliderValue}>{item.reps} reps</Text>
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Rest (seconds)</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={200}
                  step={15}
                  value={parseInt(item.rest)}
                  onValueChange={(value: number) => {
                    const newRest = [...rest];
                    newRest[index] = value.toString();
                    setRest(newRest);
                  }}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#E5E5EA"
                  thumbTintColor="#007AFF"
                />
                <Text style={styles.sliderValue}>{item.rest}s rest</Text>
              </View>
            </View>
          )}
          style={styles.setsList}
        />
      </View>
    );
  };

  const handleSavePlan = () => {
    // TODO: Save plan with exercises
    router.back();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Workout Plan</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create New Workout Plan</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Plan Name</Text>
              <TextInput
                style={styles.input}
                value={planName}
                onChangeText={setPlanName}
                placeholder="Enter plan name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.exercisesSection}>
              <Text style={styles.label}>Exercises</Text>
              {exerciseSets.map((set) => (
                <View key={set.id} style={styles.exerciseSet}>
                  <Text style={styles.exerciseSetTitle}>
                    {set.type === "single" ? "Exercise" : "Superset"}
                  </Text>
                  {set.exercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exercise}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                    </View>
                  ))}
                </View>
              ))}

              <View style={styles.addButtonsContainer}>
                <TouchableOpacity
                  style={[styles.addButton, styles.singleExerciseButton]}
                  onPress={() => addExerciseSet("single")}
                >
                  <Text style={styles.buttonText}>Add Exercise</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addButton, styles.supersetButton]}
                  onPress={() => addExerciseSet("superset")}
                >
                  <Text style={styles.buttonText}>Add Superset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Exercise Selection Modal */}
        <Modal
          visible={isAddingExercise}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAddingExercise(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback
              onPress={() => setIsAddingExercise(false)}
            >
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {currentSetType === "single"
                  ? "Add Exercise"
                  : "Create Superset"}
              </Text>

              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />

              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.exerciseItem,
                      selectedExercises.some((e) => e.id === item.id) &&
                        styles.selectedExercise,
                    ]}
                    onPress={() => handleExerciseSelect(item)}
                  >
                    <View>
                      <Text style={styles.exerciseItemName}>{item.name}</Text>
                      <Text style={styles.exerciseCategory}>
                        {item.category}
                      </Text>
                    </View>
                    {selectedExercises.some((e) => e.id === item.id) && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.exerciseList}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsAddingExercise(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalAddButton,
                    !selectedExercises.length && styles.disabledButton,
                  ]}
                  onPress={handleAddExercises}
                  disabled={!selectedExercises.length}
                >
                  <Text style={styles.addButtonText}>
                    {currentSetType === "single"
                      ? "Add Exercise"
                      : "Add Superset"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Exercise Configuration Modal */}
        <Modal
          visible={isConfiguringExercise}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsConfiguringExercise(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback
              onPress={() => setIsConfiguringExercise(false)}
            >
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Configure Exercise</Text>

              <View style={styles.configurationSection}>
                <View style={styles.configurationInput}>
                  <Text style={styles.configurationLabel}>Number of Sets</Text>
                  <View style={styles.setsSliderContainer}>
                    <Text style={styles.setsValue}>{sets} sets</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={5}
                      step={1}
                      value={parseInt(sets)}
                      onValueChange={(value: number) => {
                        const newNumSets = value;
                        const currentNumSets = parseInt(sets);
                        setSets(newNumSets.toString());

                        if (newNumSets > currentNumSets) {
                          const newReps = [...reps];
                          while (newReps.length < newNumSets) {
                            newReps.push("10");
                          }
                          setReps(newReps);
                        } else {
                          console.log(
                            "reps.slice(0, newNumSets)",
                            reps.slice(0, newNumSets)
                          );
                          setReps(reps.slice(0, newNumSets));
                        }
                      }}
                      minimumTrackTintColor="#007AFF"
                      maximumTrackTintColor="#E5E5EA"
                      thumbTintColor="#007AFF"
                    />
                  </View>
                </View>

                <View style={styles.setsConfiguration}>
                  <Text style={styles.configurationLabel}>Reps per Set</Text>
                  <View style={styles.setsListWrapper}>
                    {renderSetConfigurations()}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsConfiguringExercise(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalAddButton]}
                  onPress={handleAddExercises}
                >
                  <Text style={styles.addButtonText}>Add Exercise</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !planName && styles.saveButtonDisabled]}
            onPress={handleSavePlan}
            disabled={!planName}
          >
            <Text style={styles.saveButtonText}>Create Plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const DraggableSetItem = React.memo(
  ({
    item,
    index,
    onRepsChange,
    onRestChange,
    onDragEnd,
  }: DraggableSetItemProps) => {
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const startY = useSharedValue(0);
    const currentIndex = useSharedValue(index);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        isDragging.value = true;
        startY.value = translateY.value;
        ctx.startY = translateY.value;
        ctx.startIndex = index;
      },
      onActive: (event, ctx) => {
        if (Math.abs(event.translationY) > 20) {
          translateY.value = ctx.startY + event.translationY;
          const newIndex = Math.round(translateY.value / 100) + ctx.startIndex;
          currentIndex.value = newIndex;
        }
      },
      onEnd: () => {
        isDragging.value = false;
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
        if (currentIndex.value !== index) {
          runOnJS(onDragEnd)(index, currentIndex.value);
        }
      },
      onCancel: () => {
        isDragging.value = false;
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
      },
      onFail: () => {
        isDragging.value = false;
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
        backgroundColor: isDragging.value ? "rgba(0, 122, 255, 0.1)" : "white",
        zIndex: isDragging.value ? 1 : 0,
      };
    });

    return (
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetY={[-40, 40]}
        hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }}
      >
        <Animated.View style={[styles.setConfiguration, animatedStyle]}>
          <View style={styles.setHeader}>
            <Text style={styles.setLabel}>Set {index + 1}</Text>
            <View style={styles.setValues}>
              <Text style={styles.repValue}>{item.reps} reps</Text>
              <Text style={styles.restValue}>{item.rest}s rest</Text>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Reps</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={20}
              step={1}
              value={parseInt(item.reps)}
              onValueChange={onRepsChange}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E5E5EA"
              thumbTintColor="#007AFF"
            />
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Rest (seconds)</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={180}
              step={15}
              value={parseInt(item.rest)}
              onValueChange={onRestChange}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E5E5EA"
              thumbTintColor="#007AFF"
            />
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "white",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
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
  inputContainer: {
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      },
    }),
  },
  exercisesSection: {
    marginTop: 24,
  },
  exerciseSet: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
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
  exercise: {
    marginTop: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  addButtonsContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  addButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  singleExerciseButton: {
    backgroundColor: "#007AFF",
  },
  supersetButton: {
    backgroundColor: "#5856D6",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    height: "90%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  exerciseList: {
    flex: 1,
    marginTop: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedExercise: {
    backgroundColor: "#f0f0f0",
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  exerciseCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "white",
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E5EA",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  modalAddButton: {
    backgroundColor: "#007AFF",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  configurationSection: {
    flex: 1,
    marginTop: 16,
    gap: 16,
  },
  configurationInput: {
    marginTop: 8,
  },
  setsConfiguration: {
    flex: 1,
    marginTop: 16,
    gap: 12,
  },
  setsListWrapper: {
    flex: 1,
    minHeight: 200,
    marginBottom: 16,
    paddingTop: 16,
  },
  setsListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  setsList: {
    flex: 1,
  },
  modalTitle: {
    color: "#000",
  },
  configurationLabel: {
    color: "#000",
    marginBottom: 24,
    fontSize: 16,
    fontWeight: "600",
  },
  setLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  label: {
    fontSize: 16,
    color: "#000",
  },
  exerciseSetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  exerciseName: {
    fontSize: 16,
    color: "#000",
  },
  setsSliderContainer: {
    marginTop: 8,
  },
  setsValue: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  draggableArea: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  setHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  dragHandle: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  dragHandleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
    marginHorizontal: 1,
  },
  repValue: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  restValue: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  setValues: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  activeSetConfiguration: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  setConfiguration: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      },
    }),
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalScrollView: {
    flex: 1,
  },
  toastContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 9999,
  },
  toastContent: {
    backgroundColor: "rgba(0, 122, 255, 0.9)",
    borderRadius: 8,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  toastTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  toastMessage: {
    color: "white",
    fontSize: 14,
  },
  dropsetToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  dropsetLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dropsetConfig: {
    marginTop: 8,
  },
  dropsetRepsContainer: {
    marginTop: 16,
  },
  dropsetRepsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  dropsetRepRow: {
    marginBottom: 12,
  },
  roundLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  sliderValue: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
    marginTop: 4,
  },
  dropsetSummary: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropsetSummaryText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  dropsetRepsSummary: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  setCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    }),
  },
  setCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  setCardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  setCardDetail: {
    fontSize: 16,
    color: "#666",
  },
  slidersContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sliderWrapper: {
    marginBottom: 32,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "white",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#E5E5EA",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  repConfig: {
    flex: 1,
  },
});
