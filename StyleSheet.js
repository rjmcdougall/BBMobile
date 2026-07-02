import { StyleSheet, Dimensions, Platform } from "react-native";

// ---------------------------------------------------------------------------
// Responsive metrics
// ---------------------------------------------------------------------------
// Everything scales off the device's short side relative to a 375pt baseline
// (standard iPhone width). The factor is clamped so small phones (iPhone SE)
// aren't cramped and large phones / tablets aren't blown out. Use scale() for
// spacing/sizing and fontScale() for type (gentler curve so text stays sane on
// big screens).
const window = Dimensions.get("window");
const shortSide = Math.min(window.width, window.height);
const longSide = Math.max(window.width, window.height);

const BASELINE = 375;
const rawFactor = shortSide / BASELINE;
const factor = Math.max(0.85, Math.min(rawFactor, 1.35));

const scale = (n) => Math.round(n * factor);
const fontScale = (n) => Math.round(n * (1 + (factor - 1) * 0.5));

const Metrics = {
	width: window.width,
	height: window.height,
	shortSide,
	longSide,
	isSmall: shortSide < 360,      // iPhone SE / small Androids
	isLarge: shortSide >= 414,     // Plus / Pro Max
	isTablet: shortSide >= 600,
	scale,
	fontScale,
};

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
// Modern high-contrast dark theme: near-black canvas, layered surfaces, a
// single vivid blue accent, generous spacing on an 8pt grid.
const Colors = {
	// Backgrounds / canvas
	primary: '#0B0B0F',
	backgroundPrimary: '#0B0B0F',
	secondary: '#15151B',
	tertiary: '#1E1E26',

	// Accents
	accent: '#2E7CF6',
	accentSecondary: '#30D158',
	accentWarning: '#FF9F0A',
	accentError: '#FF453A',

	// Text
	textPrimary: '#FFFFFF',
	textSecondary: '#A0A0AB',
	textTertiary: '#6E6E78',
	textDark: '#000000',

	// Surfaces (elevation ladder)
	surfacePrimary: '#15151B',
	surfaceSecondary: '#1E1E26',
	surfaceTertiary: '#2A2A33',

	// Borders / hairlines
	borderPrimary: '#2C2C36',
	borderSecondary: '#3A3A46',
};

const Spacing = {
	xs: scale(4),
	sm: scale(8),
	md: scale(12),
	lg: scale(16),
	xl: scale(24),
	xxl: scale(32),
};

const Radius = {
	sm: scale(8),
	md: scale(12),
	lg: scale(16),
	xl: scale(22),
	pill: 999,
};

const Shadows = {
	card: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 10,
		elevation: 5,
	},
	subtle: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 3,
	},
};

// Typography presets — use these instead of ad-hoc fontSize/weight.
const Type = {
	title: { fontSize: fontScale(22), fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.2 },
	heading: { fontSize: fontScale(20), fontWeight: '700', color: Colors.textPrimary },
	subheading: { fontSize: fontScale(16), fontWeight: '600', color: Colors.textPrimary },
	body: { fontSize: fontScale(15), fontWeight: '500', color: Colors.textPrimary },
	label: { fontSize: fontScale(13), fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.4, textTransform: 'uppercase' },
	caption: { fontSize: fontScale(12), fontWeight: '500', color: Colors.textTertiary },
};

export { Colors, Metrics, Spacing, Radius, Shadows, Type };

export default StyleSheet.create({
	// ---- Layout ----------------------------------------------------------
	container: {
		flex: 1,
		backgroundColor: Colors.primary,
	},
	screen: {
		flex: 1,
		backgroundColor: Colors.primary,
		paddingHorizontal: Spacing.lg,
	},

	// ---- Typography ------------------------------------------------------
	title: Type.title,
	heading: Type.heading,
	subheading: Type.subheading,
	body: Type.body,
	label: Type.label,
	caption: Type.caption,

	// ---- Cards -----------------------------------------------------------
	card: {
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: Radius.lg,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
		padding: Spacing.lg,
		...Shadows.card,
	},

	// ---- Status chip -----------------------------------------------------
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		paddingVertical: scale(4),
		paddingHorizontal: scale(10),
		borderRadius: Radius.pill,
		backgroundColor: Colors.surfaceTertiary,
	},
	chipDot: {
		width: scale(8),
		height: scale(8),
		borderRadius: scale(4),
		marginRight: scale(6),
	},
	chipText: {
		fontSize: fontScale(13),
		fontWeight: '600',
		color: Colors.textPrimary,
	},

	// ---- Pill buttons ----------------------------------------------------
	pill: {
		minHeight: scale(52),
		borderRadius: Radius.pill,
		backgroundColor: Colors.surfaceSecondary,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingHorizontal: Spacing.lg,
		marginVertical: Spacing.xs,
		overflow: 'hidden',
		...Shadows.subtle,
	},
	pillPrimary: {
		backgroundColor: Colors.accent,
		borderColor: Colors.accent,
	},
	pillText: {
		fontSize: fontScale(16),
		fontWeight: '700',
		color: Colors.textPrimary,
		textAlign: 'center',
	},

	// ---- Legacy buttons (kept for existing screens; restyled) ------------
	button: {
		marginTop: Spacing.xs,
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: Radius.md,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
		...Shadows.subtle,
	},
	horizonralButton: {
		flex: 1,
		marginTop: Spacing.xs,
		marginHorizontal: scale(2),
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: Radius.md,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
		...Shadows.subtle,
	},
	horizontalButtonBar: {
		flexDirection: "row",
		paddingHorizontal: Spacing.xs,
	},
	buttonTextCenter: {
		margin: scale(2),
		fontSize: fontScale(16),
		textAlign: "center",
		padding: Spacing.md,
		fontWeight: "600",
		color: Colors.textPrimary,
	},
	connectButtonTextCenter: {
		margin: scale(2),
		fontSize: fontScale(14),
		textAlign: "center",
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.sm,
		fontWeight: "600",
		color: Colors.textPrimary,
	},
	smallButtonTextCenter: {
		margin: scale(2),
		fontSize: fontScale(12),
		textAlign: "center",
		padding: Spacing.sm,
		fontWeight: "500",
		color: Colors.textPrimary,
	},

	// ---- Nav rail --------------------------------------------------------
	icon: {
		margin: scale(6),
		borderRadius: Radius.md,
		padding: scale(6),
	},

	// ---- Map -------------------------------------------------------------
	map: {
		flex: 1,
		height: scale(300),
		borderRadius: Radius.md,
		overflow: 'hidden',
	},
	mapView: {
		flex: 1,
		margin: Spacing.xs,
		borderRadius: Radius.md,
		overflow: 'hidden',
	},

	// ---- Monitor mode ----------------------------------------------------
	monitorContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: Colors.primary,
	},
	monitorMap: {
		flex: 1,
		margin: Spacing.xs,
		borderRadius: Radius.md,
		overflow: 'hidden',
	},
	batteryList: {
		flex: .3,
		backgroundColor: Colors.surfacePrimary,
		margin: Spacing.xs,
		borderRadius: Radius.md,
		padding: Spacing.sm,
	},

	// ---- Rows / lists ----------------------------------------------------
	dropDownRowText: {
		marginLeft: Spacing.md,
		fontSize: fontScale(16),
		color: Colors.textPrimary,
		fontWeight: "500",
	},
	rowText: {
		margin: scale(6),
		fontSize: fontScale(14),
		padding: Spacing.sm,
		fontWeight: "500",
		color: Colors.textPrimary,
	},

	// ---- Footer ----------------------------------------------------------
	footer: {
		minHeight: scale(52),
		margin: Spacing.xs,
		justifyContent: "center",
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: Radius.pill,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
		...Shadows.subtle,
	},

	// ---- Switch ----------------------------------------------------------
	switch: {
		margin: scale(6),
		padding: Spacing.md,
		flex: 1,
		flexDirection: "row",
		backgroundColor: Colors.surfaceSecondary,
		borderRadius: Radius.md,
		borderWidth: 1,
		borderColor: Colors.borderPrimary,
	},
	switchText: {
		fontSize: fontScale(14),
		fontWeight: "500",
		textAlign: "center",
		color: Colors.textPrimary,
	},

	// ---- Slider ----------------------------------------------------------
	sliderTrack: {
		height: scale(8),
		borderRadius: scale(4),
		backgroundColor: Colors.surfaceTertiary,
	},
	sliderThumb: {
		width: scale(24),
		height: scale(24),
		borderRadius: scale(12),
		backgroundColor: Colors.accent,
		...Shadows.subtle,
	},

	// ---- Map annotations -------------------------------------------------
	annotationContainer: {
		width: scale(32),
		height: scale(32),
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.surfacePrimary,
		borderRadius: scale(16),
		borderWidth: 2,
		borderColor: Colors.accent,
		...Shadows.subtle,
	},
	annotationFill: {
		width: scale(24),
		height: scale(24),
		borderRadius: scale(12),
		transform: [{ scale: 0.7 }]
	}
});
