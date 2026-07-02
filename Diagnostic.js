import React, { Component } from "react";
import { View, ScrollView, Text } from "react-native";
import StateBuilder from "./StateBuilder";
import PropTypes from "prop-types";
import StyleSheet, { Colors, Spacing, Radius, Metrics } from "./StyleSheet";

export default class Diagnostic extends Component {
	constructor(props) {
		super(props);
	}

	infoRow(label, value, last) {
		return (
			<View style={{
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				paddingVertical: Spacing.sm,
				borderBottomWidth: last ? 0 : 1,
				borderBottomColor: Colors.borderPrimary,
			}}>
				<Text style={[StyleSheet.body, { color: Colors.textSecondary }]}>{label}</Text>
				<Text style={[StyleSheet.body, { flexShrink: 1, textAlign: "right", marginLeft: Spacing.md }]} numberOfLines={1}>{value}</Text>
			</View>
		);
	}

	render() {
		const bs = this.props.boardState;
		return (
			<View style={StyleSheet.container}>
				<ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
					<Text style={[StyleSheet.title, { marginBottom: Spacing.lg }]}>Diagnostics</Text>

					<View style={[StyleSheet.card, { marginBottom: Spacing.lg }]}>
						{this.infoRow("APK Version", String(bs.apkv))}
						{this.infoRow("Last Updated", new Date(bs.apkd).toDateString())}
						{this.infoRow("SSID", bs.s)}
						{this.infoRow("IP Address", bs.ip, true)}
					</View>

					<Text style={[StyleSheet.label, { marginBottom: Spacing.sm }]}>Log</Text>
					{this.props.logLines.map((line) => (
						<Text
							key={Math.random()}
							style={{
								color: line.isError ? Colors.accentError : Colors.textSecondary,
								backgroundColor: line.isError ? (Colors.accentError + "22") : Colors.surfaceSecondary,
								paddingVertical: Spacing.xs,
								paddingHorizontal: Spacing.sm,
								marginBottom: 3,
								borderRadius: Radius.sm,
								fontFamily: "monospace",
								fontSize: Metrics.fontScale(12),
							}}
						>
							{line.logLine}
						</Text>
					))}
				</ScrollView>
			</View>
		);
	}
}

Diagnostic.propTypes = {
	boardState: PropTypes.object,
	logLines: PropTypes.array,
};

Diagnostic.defaultProps = {
	boardState: StateBuilder.blankBoardState(),
	logLines: StateBuilder.blankLogLines(),
};
