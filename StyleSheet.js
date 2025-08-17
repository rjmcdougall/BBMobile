import { StyleSheet } from "react-native";

// Modern Dark Theme Colors
const Colors = {
	// Primary Dark Theme
	primary: '#1a1a1a',
	secondary: '#2d2d2d',
	tertiary: '#3d3d3d',
	
	// Accent Colors
	accent: '#007AFF',
	accentSecondary: '#34C759',
	accentWarning: '#FF9500',
	accentError: '#FF3B30',
	
	// Text Colors
	textPrimary: '#FFFFFF',
	textSecondary: '#B0B0B0',
	textTertiary: '#8E8E93',
	
	// Surface Colors
	surfacePrimary: '#1c1c1e',
	surfaceSecondary: '#2c2c2e',
	surfaceTertiary: '#3a3a3c',
	
	// Border Colors
	borderPrimary: '#48484a',
	borderSecondary: '#636366',
};

export { Colors };

export default StyleSheet.create({
	buttonTextCenter: {
		margin: 2,
		fontSize: 24,
		textAlign: "center",
		padding: 12,
		fontWeight: "600",
		color: Colors.textPrimary,
	},
	connectButtonTextCenter: {
		margin: 2,
		fontSize: 18,
		textAlign: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontWeight: "600",
		color: Colors.textPrimary,
	},
	smallButtonTextCenter: {
		margin: 2,
		fontSize: 14,
		textAlign: "center",
		padding: 8,
		fontWeight: "500",
		color: Colors.textPrimary,
	},
	button: {
		marginTop: 4,
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	horizonralButton: {
		flex: 1,
		marginTop: 4,
		marginHorizontal: 2,
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	horizontalButtonBar: {
		flexDirection: "row",
		paddingHorizontal: 4,
	},
	icon: {
		margin: 8,
		borderRadius: 12,
		padding: 6,
	},
	map: {
		flex: 1,
		height: 300,
		borderRadius: 12,
		overflow: 'hidden',
	},
	mapView: {
		flex: 1,
		margin: 4,
		borderRadius: 12,
		overflow: 'hidden',
	},
	monitorContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: Colors.primary,
	},
	monitorMap: {
		flex: 1,
		margin: 4,
		borderRadius: 12,
		overflow: 'hidden',
	},
	batteryList: {
		flex: .3,
		backgroundColor: Colors.surfacePrimary,
		margin: 4,
		borderRadius: 12,
		padding: 8,
	},
	container: {
		flex: 1,
		backgroundColor: Colors.primary,
	},
	dropDownRowText: {
		marginLeft: 12,
		fontSize: 20,
		color: Colors.textPrimary,
		fontWeight: "500",
	},
	rowText: {
		margin: 6,
		fontSize: 14,
		padding: 8,
		fontWeight: "500",
		color: Colors.textPrimary,
	},
	footer: {
		height: 50,
		margin: 4,
		justifyContent: "center",
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: 12,
		borderTopWidth: 1,
		borderTopColor: Colors.borderPrimary,
	},
	switch: {
		margin: 6,
		padding: 12,
		flex: 1,
		flexDirection: "row",
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
	},
	switchText: {
		fontSize: 14,
		fontWeight: "500",
		textAlign: "center",
		color: Colors.textPrimary,
	},
	sliderTrack: {
		height: 8,
		borderRadius: 4,
		backgroundColor: Colors.surfaceTertiary,
	},
	sliderThumb: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: Colors.accent,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	annotationContainer: {
		width: 32,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.surfacePrimary,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: Colors.accent,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	annotationFill: {
		width: 24,
		height: 24,
		borderRadius: 12,
		transform: [{ scale: 0.7 }]
	}
});
