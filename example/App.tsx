import * as IdNowAutoIdent from "id-now-auto-ident";
import {
  AutoIdentResponseDescriptions,
  IdNowLanguage,
} from "id-now-auto-ident";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useAsyncEffect } from "use-async-effect";

const language = IdNowLanguage.en;

export default function App() {
  useAsyncEffect(async () => {
    if (Platform.OS === "android") {
      const result = await IdNowAutoIdent.autoIdentInitAndroid(language);
      console.log("IdNowAutoIdent initAndroid", result);
    }
    const result = await IdNowAutoIdent.startAutoIdent(
      "TST-BRLYCD-KN",
      language,
    );
    if (!result) return;
    const errorCode = result.errorCode;
    if (errorCode) {
      const errorMessage = AutoIdentResponseDescriptions[errorCode];
      console.log(`IdNowAutoIdent error: ${errorCode} ${errorMessage}`);
    }
    console.log(`IdNowAutoIdent  ended with status: ${result.status}`);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Starting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
