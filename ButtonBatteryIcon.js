import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from './StyleSheet';
import PropTypes from 'prop-types';

export default class ButtonBatteryIcon extends React.Component {
    getBatteryColor() {
        const { percentage } = this.props;
        if (percentage === -1) return Colors.textSecondary;   // Gray for unknown
        if (percentage <= 20) return Colors.accentError;      // Red for critical
        if (percentage <= 40) return Colors.accentWarning;    // Orange for low
        return Colors.accentSecondary;                        // Green for good
    }

    render() {
        const { percentage } = this.props;
        const batteryColor = this.getBatteryColor();
        const fillWidth = percentage === -1 ? 0 : Math.max(2, (percentage / 100) * 34); // No fill for unknown, minimum 2px fill otherwise
        const displayPercentage = percentage === -1 ? 0 : percentage; // Use 0 for fill calculations when unknown

        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                paddingVertical: 8
            }}>
                {/* Button Battery Shape */}
                <View style={{
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Battery Body - Circular like a button battery */}
                    <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: Colors.borderPrimary,
                        backgroundColor: Colors.surfaceTertiary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}>
                        {/* Battery Fill - Circular fill that grows with percentage */}
                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${displayPercentage}%`,
                            backgroundColor: batteryColor,
                            borderRadius: displayPercentage < 50 ? 0 : 20,
                            maxHeight: 36 // Account for border
                        }} />
                        
                        {/* Battery Percentage Text */}
                        <Text style={{
                            color: displayPercentage > 50 ? Colors.textPrimary : Colors.textPrimary,
                            fontSize: percentage === -1 ? 9 : 10, // Smaller font for "battery level unknown"
                            fontWeight: 'bold',
                            zIndex: 1,
                            textShadowColor: 'rgba(0,0,0,0.8)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2
                        }}>
                            {percentage === -1 ? 'battery level unknown' : Math.round(percentage) + '%'}
                        </Text>
                    </View>
                    
                    {/* Battery Positive Terminal - Small circle on top */}
                    <View style={{
                        position: 'absolute',
                        top: -2,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Colors.borderPrimary,
                        borderWidth: 1,
                        borderColor: Colors.textSecondary
                    }} />
                </View>
            </View>
        );
    }
}

ButtonBatteryIcon.propTypes = {
    percentage: PropTypes.number.isRequired
};

ButtonBatteryIcon.defaultProps = {
    percentage: 0
};
