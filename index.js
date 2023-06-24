import { AppRegistry, Text } from "react-native";
import App from "./App";
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
AppRegistry.registerComponent("BBMobile", () => App);