import React, { Component} from "react";
import { View, ScrollView, Text,} from "react-native";
import StateBuilder from "./StateBuilder";
import PropTypes from "prop-types";
import StyleSheet, { Colors } from "./StyleSheet";
export default class Diagnostic extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={StyleSheet.container}  >

				<ScrollView style={{ margin: 10 }}>
					<Text style={{ color: Colors.textPrimary, fontSize: 16, lineHeight: 24 }}>APK Version: {this.props.boardState.apkv} {"\n"}
						Last Updated: {new Date(this.props.boardState.apkd).toDateString()} {"\n"}
						SSID: {this.props.boardState.s} {"\n"}
						IP Address: {this.props.boardState.ip} {"\n"}
					</Text>
					{
						this.props.logLines.map((line) => {
							var textColor = Colors.textSecondary;
							var backgroundColor = Colors.surfaceSecondary;
							if (line.isError) {
								textColor = Colors.accentError;
								backgroundColor = Colors.surfaceTertiary;
							}

							return (
								<Text 
									key={Math.random()} 
									style={{ 
										color: textColor, 
										backgroundColor: backgroundColor,
										padding: 4,
										marginBottom: 2,
										borderRadius: 4,
										fontFamily: 'monospace',
										fontSize: 12
									}}
								>
									{line.logLine}
								</Text>
							);
						})
					}
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

