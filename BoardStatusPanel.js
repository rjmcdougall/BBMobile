import React, { Component } from "react";
import { View, ScrollView, Text, RefreshControl, StyleSheet as RNStyleSheet, TouchableOpacity, Modal, Alert } from "react-native";
import PropTypes from "prop-types";
import StyleSheet, { Colors } from "./StyleSheet";
import BatteryController from "./BatteryController";
import BatteryListItem from "./BatteryListItem";
import Constants from "./Constants";
import StateBuilder from "./StateBuilder";

export default class BoardStatusPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            selectedBoard: null,
            showDetailModal: false,
        };
        
        this.onRefresh = this.onRefresh.bind(this);
        this.formatLastHeard = this.formatLastHeard.bind(this);
        this.getBatteryLevel = this.getBatteryLevel.bind(this);
        this.getVoltageLevel = this.getVoltageLevel.bind(this);
        this.renderBoardItem = this.renderBoardItem.bind(this);
        this.onBatteryPress = this.onBatteryPress.bind(this);
        this.closeDetailModal = this.closeDetailModal.bind(this);
        this.renderDetailModal = this.renderDetailModal.bind(this);
    }

    async onRefresh() {
        this.setState({ refreshing: true });
        
        // Trigger a refresh of board data if available
        if (this.props.onRefreshBoards) {
            await this.props.onRefreshBoards();
        }
        
        // Add a small delay for better UX
        setTimeout(() => {
            this.setState({ refreshing: false });
        }, 1000);
    }

    formatLastHeard(lastHeardTimestamp) {
        // Handle different timestamp formats and edge cases
        if (!lastHeardTimestamp || lastHeardTimestamp === 0 || lastHeardTimestamp === -1) {
            return "Never";
        }

        try {
            const now = new Date();
            let timestamp = lastHeardTimestamp;
            
            // Handle different timestamp formats
            if (typeof timestamp === 'string') {
                // Try to parse string timestamps
                timestamp = new Date(timestamp).getTime();
            } else if (typeof timestamp === 'number') {
                // Handle both seconds and milliseconds timestamps
                if (timestamp < 10000000000) {
                    // Looks like seconds (less than year 2286), convert to milliseconds
                    timestamp = timestamp * 1000;
                }
            }
            
            const lastHeard = new Date(timestamp);
            
            // Validate the date is reasonable
            if (isNaN(lastHeard.getTime()) || lastHeard.getTime() < 946684800000) { // Before year 2000
                return "Never";
            }
            
            const diffMs = now - lastHeard;
            
            // Handle future timestamps (clock skew)
            if (diffMs < 0) {
                return "Just now";
            }
            
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffSeconds < 60) {
                return `${diffSeconds}s ago`;
            } else if (diffMinutes < 60) {
                return `${diffMinutes}m ago`;
            } else if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else {
                return `${diffDays}d ago`;
            }
        } catch (error) {
            console.log('BoardStatusPanel: Error formatting timestamp:', lastHeardTimestamp, error);
            return "Never";
        }
    }

    getBatteryLevel(board) {
        // Check various possible battery level properties
        if (board.batteryLevel !== undefined && board.batteryLevel !== -1) {
            return board.batteryLevel;
        }
        if (board.b !== undefined && board.b !== -1) {
            return board.b;
        }
        if (board.battery !== undefined && board.battery !== -1) {
            return board.battery;
        }
        // Return -1 for unknown battery level
        return -1;
    }

    getVoltageLevel(board) {
        // Check various possible voltage properties
        if (board.last_known_voltage !== undefined && board.last_known_voltage !== null) {
            return parseFloat(board.last_known_voltage).toFixed(2);
        }
        if (board.lastKnownVoltage !== undefined && board.lastKnownVoltage !== null) {
            return parseFloat(board.lastKnownVoltage).toFixed(2);
        }
        return null;
    }

    onBatteryPress(board) {
        this.setState({
            selectedBoard: board,
            showDetailModal: true,
        });
    }

    closeDetailModal() {
        this.setState({
            selectedBoard: null,
            showDetailModal: false,
        });
    }

    renderBoardItem(board, index) {
        const boardName = board.name || board.bootName || `Board ${index + 1}`;
        const batteryLevel = this.getBatteryLevel(board);
        const voltage = this.getVoltageLevel(board);
        const lastHeard = this.formatLastHeard(board.lastHeard || board.ah);

        return (
            <View 
                key={`board-${index}-${boardName}`}
                style={styles.boardItem}
            >
                {/* Left side - Board name */}
                <View style={styles.boardNameContainer}>
                    <Text style={styles.boardName}>
                        {boardName}
                    </Text>
                </View>

                {/* Center - Battery status */}
                <TouchableOpacity 
                    style={styles.batteryContainer}
                    onPress={() => this.onBatteryPress(board)}
                    activeOpacity={0.7}
                >
                    <BatteryListItem b={batteryLevel} key={`battery-${index}`} />
                    {voltage && (
                        <Text style={styles.voltageText}>
                            {voltage}V
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Right side - Last heard timestamp */}
                <View style={styles.timestampContainer}>
                    <Text style={styles.timestampText}>
                        Last heard:
                    </Text>
                    <Text style={styles.timestampValue}>
                        {lastHeard}
                    </Text>
                </View>
            </View>
        );
    }

    render() {
        const { 
            boardData = [], 
            status = [],
            locations = [], 
            connectedPeripheral,
            isCloudConnected,
            cloudConnectionStatus 
        } = this.props;
        
        let validBoards = [];
        
        // Use status for cloud connections, locations for BLE connections
        if (isCloudConnected && status && status.length > 0) {
            console.log('BoardStatusPanel: Using cloud status data');
            
            // Filter and process status entries
            validBoards = status
                .filter(statusEntry => statusEntry && statusEntry.board && statusEntry.board !== "none")
                .map(statusEntry => {
                    // Find matching board data for additional info like color
                    const matchingBoard = boardData.find(board => 
                        (board.name === statusEntry.board || board.bootName === statusEntry.board)
                    );
                    
                    // Use last_seen_battery as the primary timestamp source
                    let bestTimestamp = statusEntry.lastHeard || statusEntry.last_seen_battery || statusEntry.last_seen;
                    
                    console.log(`Processing status entry: ${statusEntry.board}`);
                    console.log(`  Battery: ${statusEntry.last_known_battery}`);
                    console.log(`  Voltage: ${statusEntry.last_known_voltage}`);
                    console.log(`  Timestamp: ${bestTimestamp}`);
                    
                    // Create a board object from status entry
                    return {
                        name: statusEntry.board,
                        bootName: statusEntry.longname || statusEntry.board,
                        b: statusEntry.b || statusEntry.last_known_battery || -1,
                        batteryLevel: statusEntry.b || statusEntry.last_known_battery || -1,
                        battery: statusEntry.b || statusEntry.last_known_battery || -1,
                        lastHeard: bestTimestamp,
                        ah: bestTimestamp,
                        // Include battery and voltage fields for filtering
                        last_known_battery: statusEntry.last_known_battery || 0,
                        last_known_voltage: statusEntry.last_known_voltage || 0,
                        last_seen_battery: statusEntry.last_seen_battery,
                        last_seen: statusEntry.last_seen,
                        last_seen_location: statusEntry.last_seen_location,
                        // Include all status fields
                        ...statusEntry,
                        // Include matching board data if available
                        ...(matchingBoard && {
                            color: matchingBoard.color,
                            type: matchingBoard.type,
                        })
                    };
                })
                .filter(board => {
                    // Filter by battery criteria: last_known_battery > 0 OR last_known_voltage > 20
                    const batteryLevel = board.last_known_battery || 0;
                    const voltage = board.last_known_voltage || 0;
                    const shouldShow = batteryLevel > 0 || voltage > 20;
                    
                    console.log(`BoardStatusPanel filter (cloud): ${board.name}`);
                    console.log(`  Battery: ${batteryLevel}, Voltage: ${voltage}, Show: ${shouldShow}`);
                    
                    return shouldShow;
                });
        } else if (locations && locations.length > 0) {
            console.log('BoardStatusPanel: Using BLE locations data');
            
            // Filter out any invalid location entries and map them to board format
            validBoards = locations
                .filter(location => location && location.board && location.board !== "none")
                .map(location => {
                    // Find matching board data for additional info like bootName
                    const matchingBoard = boardData.find(board => 
                        (board.name === location.board || board.bootName === location.board)
                    );
                    
                    // Use last_seen_battery as the primary timestamp source
                    let bestTimestamp = null;
                    
                    // Priority order: last_seen_battery first, then fallback to other sources
                    const timestampSources = [
                        location.last_seen_battery,
                        matchingBoard?.last_seen_battery,
                        location.lastHeard,
                        location.ah, 
                        location.d, // date field sometimes used in locations
                        matchingBoard?.lastHeard,
                        matchingBoard?.ah,
                        location.locations?.[location.locations.length - 1]?.d // latest location entry
                    ];
                    
                    for (const ts of timestampSources) {
                        if (ts && ts !== 0 && ts !== -1) {
                            bestTimestamp = ts;
                            break;
                        }
                    }
                    
                    // Create a board object combining location data with board data
                    return {
                        name: location.board,
                        bootName: matchingBoard?.bootName || location.board,
                        b: location.b || matchingBoard?.b || -1,
                        batteryLevel: location.b || matchingBoard?.batteryLevel || -1,
                        battery: location.b || matchingBoard?.battery || -1,
                        lastHeard: bestTimestamp,
                        ah: bestTimestamp,
                        // Include battery and voltage fields for filtering
                        last_known_battery: location.last_known_battery || matchingBoard?.last_known_battery || 0,
                        last_known_voltage: location.last_known_voltage || matchingBoard?.last_known_voltage || 0,
                        last_seen_battery: location.last_seen_battery || matchingBoard?.last_seen_battery,
                        // Include any other relevant fields from the location or matching board
                        ...location,
                        // Ensure board name fields are properly set
                        ...(matchingBoard && {
                            bootName: matchingBoard.bootName,
                            // Include any other fields from board data that might be useful
                        })
                    };
                })
                .filter(board => {
                    // Filter by battery criteria: last_known_battery > 0 OR last_known_voltage > 20
                    const batteryLevel = board.last_known_battery || 0;
                    const voltage = board.last_known_voltage || 0;
                    const shouldShow = batteryLevel > 0 || voltage > 20;
                    
                    console.log(`BoardStatusPanel filter (BLE): ${board.name}`);
                    console.log(`  Battery: ${batteryLevel}, Voltage: ${voltage}, Show: ${shouldShow}`);
                    
                    return shouldShow;
                });
        }

        return (
            <View style={styles.container}>
                {this.renderDetailModal()}
                {this.renderMainContent(validBoards)}
            </View>
        );
    }

    renderDetailModal() {
        const { selectedBoard, showDetailModal } = this.state;
        
        if (!selectedBoard) {
            return null;
        }

        const batteryLevel = this.getBatteryLevel(selectedBoard);
        const voltage = this.getVoltageLevel(selectedBoard);
        const lastHeard = this.formatLastHeard(selectedBoard.lastHeard || selectedBoard.ah);
        const lastSeenBattery = this.formatLastHeard(selectedBoard.last_seen_battery);
        
        return (
            <Modal
                visible={showDetailModal}
                transparent={true}
                animationType="fade"
                onRequestClose={this.closeDetailModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedBoard.name} Details</Text>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Battery Level:</Text>
                            <Text style={styles.detailValue}>
                                {batteryLevel >= 0 ? `${batteryLevel}%` : 'Unknown'}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Voltage:</Text>
                            <Text style={styles.detailValue}>
                                {voltage ? `${voltage}V` : 'Unknown'}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Last Seen:</Text>
                            <Text style={styles.detailValue}>{lastHeard}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Last Seen Battery:</Text>
                            <Text style={styles.detailValue}>{lastSeenBattery}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Board Type:</Text>
                            <Text style={styles.detailValue}>
                                {selectedBoard.isCloud ? 'Cloud' : 'Bluetooth'}
                            </Text>
                        </View>
                        
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={this.closeDetailModal}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    renderMainContent(validBoards) {
        return (
            <>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Board Status</Text>
                    <Text style={styles.headerSubtitle}>
                        {validBoards.length} board{validBoards.length !== 1 ? 's' : ''} found
                        {this.props.locations && this.props.locations.length > 0 ? ' (from locations)' : ''}
                    </Text>
                </View>

                {/* Board list */}
                <ScrollView 
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh}
                            tintColor={Colors.accent}
                            colors={[Colors.accent]}
                        />
                    }
                >
                    {validBoards.length > 0 ? (
                        validBoards.map((board, index) => this.renderBoardItem(board, index))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                No boards found
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                Pull down to refresh or scan for boards
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </>
        );
    }
}

const styles = RNStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        backgroundColor: Colors.surfacePrimary,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderPrimary,
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    boardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderPrimary,
        backgroundColor: Colors.surfacePrimary,
        minHeight: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    boardNameContainer: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.borderSecondary,
    },
    boardName: {
        fontSize: 14,
        fontWeight: 'bold',
        flexShrink: 1,
        color: Colors.textPrimary,
    },
    batteryContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        paddingVertical: 4,
    },
    voltageText: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    timestampContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    timestampText: {
        fontSize: 12,
        marginBottom: 2,
        color: Colors.textSecondary,
    },
    timestampValue: {
        fontSize: 12,
        fontWeight: 'normal',
        color: Colors.textPrimary,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        color: Colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: Colors.surfacePrimary,
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderSecondary,
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: Colors.accent,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

BoardStatusPanel.propTypes = {
    boardData: PropTypes.array,
    status: PropTypes.array,
    onRefreshBoards: PropTypes.func,
    locations: PropTypes.array,
    connectedPeripheral: PropTypes.object,
    isCloudConnected: PropTypes.bool,
    cloudConnectionStatus: PropTypes.string,
};

BoardStatusPanel.defaultProps = {
    boardData: [],
};
