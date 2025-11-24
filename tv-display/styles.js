import { StyleSheet } from 'react-native';

// THEME CONSTANTS
const COLORS = {
    navyDeep: '#0A1024',
    navyMid: '#101836',
    cyan: '#67E8F9',
    cyanLow: 'rgba(103, 232, 249, 0.1)',
    cyanBorder: 'rgba(103, 232, 249, 0.4)',
    silver: '#C0C0C0',
    white: '#FFFFFF',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    cardBg: 'rgba(16, 24, 54, 0.5)',
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.navyDeep,
    },
    gridContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 30,
        gap: 30, // Gap between columns
        backgroundColor: COLORS.navyDeep
    },

    // --- LEFT COLUMN ---
    leftColumn: {
        flex: 2, // 8 out of 12 columns approx
        flexDirection: 'column',
        gap: 30,
    },

    // --- RIGHT COLUMN ---
    rightColumn: {
        flex: 1, // 4 out of 12 columns
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },

    // --- MODAL & UTILS ---
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: 400, backgroundColor: COLORS.navyMid, borderRadius: 16, padding: 30, borderWidth: 1, borderColor: COLORS.glassBorder },
    modalTitle: { color: COLORS.white, fontSize: 20, marginBottom: 20, textAlign: 'center' },
    modalInput: { backgroundColor: COLORS.navyDeep, color: COLORS.white, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: COLORS.glassBorder, marginBottom: 15 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    btnCancel: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
    btnSave: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: COLORS.cyan, alignItems: 'center' },
    btnText: { color: COLORS.white },
    btnTextBold: { color: COLORS.navyDeep, fontWeight: 'bold' },
    toast: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: COLORS.cyan, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50 },
    toastText: { color: COLORS.navyDeep, fontWeight: 'bold' },
});

export default styles;