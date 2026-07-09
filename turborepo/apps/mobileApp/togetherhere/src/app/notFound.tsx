import { StyleSheet, Text, View} from "react-native"
import { Link, Stack } from "expo-router"

export default function NotFound () {
    return (
        <>
        <Stack.Screen options={{title: "Oops, you've encountered an invalid route"}}/>
        <View style = {styles.container}>
            <Link style = {styles.button} href={"/"}>Return home</Link>
        </View>
        </>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
