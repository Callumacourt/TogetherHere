import { StyleSheet, View, Text } from "react-native";

export default function AccountScreen () {
    return (
        <View style = {styles.container}>
            <Text>Testing nav</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignContent: "center",
    },

    form: {

    }
})