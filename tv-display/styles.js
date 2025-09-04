import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({

    reloadBar: {
        marginTop: 10,
        backgroundColor: '#f59e42',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: '#f59e42',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    reloadBarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    wsStatusBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#3b82f6',
        padding: 10,
        zIndex: 999,
        alignItems: 'center',
    },
    wsStatusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonActive: {
        borderWidth: 3,
        borderColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonTextActive: {
        color: '#3b82f6',
        fontWeight: 'bold',
        textShadowColor: '#fff',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },

    container: {
        marginTop: 30,

        flexDirection: "row",
        flex: 1,
        backgroundColor: "#1a202c", // dark background
    },
    borderWrapper: {
        position: "absolute",
        padding: 2,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "none",
    },
    animatedBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 10,
        border: 1,
        height: "100%",
        width: "200%",
    },
    gradient: {
        flex: 1,
        height: 10,
    },
    leftSection: {
        width: "50%",
        backgroundColor: "#111827",
    },
    header: {
        backgroundColor: "#6366f1",
        padding: 16,
    },
    headerText: {
        marginLeft: 10,
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
    },
    buttonWrapper: {
        padding: 16,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    button: {
        width: "48%",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    buttonLight: {
        backgroundColor: "#3b82f6",
    },
    buttonDark: {
        backgroundColor: "#1e3a8a",
    },
    buttonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
    },
    divider: {
        width: 1,
        backgroundColor: "#ccc",
    },
    rightSection: {
        width: "50%",
        backgroundColor: "#1e40af",
        alignItems: "center",
        justifyContent: "center",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "50%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: "#333",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        color: "#333",
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    fullWidth: {
        width: "100%",
    },
    buttonClose: {
        backgroundColor: "#aaa",
    },
    buttonSave: {
        backgroundColor: "#4287f5",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
    },
    rightSection: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },

    image: {
        width: "100%",
        height: "100%",
    },
    ticketBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#1e1e1e",
        width: 300,
        height: 200,
        padding: 1,
        zIndex: 1,
        backgroundColor: "none",
    },
    leftTicket: {
        backgroundColor: "#fff",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    rightTicket: {
        backgroundColor: "#3b82f6",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    numberTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#3b82f6",
    },
    numberValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#3b82f6",
    },
    proceedText: {
        fontSize: 20,
        textAlign: "center",
        color: "#fff",
    },
    counterNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default styles;