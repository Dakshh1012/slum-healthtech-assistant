import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center"
    >
      <Text className="text-5xl">Edit app/index.tsx to edit this screen.</Text>
      <TouchableOpacity>
        <Link href="./(tabs)">Go to MediBuddy</Link>
      </TouchableOpacity>
    </View>
  );
}
