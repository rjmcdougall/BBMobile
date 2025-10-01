import React, { Component } from "react";
import { View, ScrollView, Text, RefreshControl, StyleSheet as RNStyleSheet } from "react-native";
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
        };
        
        this.onRefresh = this.onRefresh.bind(this);
        this.formatLastHeard = this.formatLastHeard.bind(this);
        this.getBatteryLevel = this.getBatteryLevel.bind(this);
        this.renderBoardItem = this.renderBoardItem.bind(this);
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
        if (!lastHeardTimestamp || lastHeardTimestamp === 0) {
            return "Never";
        }

        const now = new Date();
        const lastHeard = new Date(lastHeardTimestamp);
        const diffMs = now - lastHeard;
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

    renderBoardItem(board, index) {
        const boardName = board.name || board.bootName || `Board ${index + 1}`;
        const batteryLevel = this.getBatteryLevel(board);
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
                <View style={styles.batteryContainer}>
                    <BatteryListItem b={batteryLevel} key={`battery-${index}`} />
                </View>

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
        const { boardData = [] } = this.props;
        
        // Filter out any invalid board entries
        const validBoards = boardData.filter(board => 
            board && (board.name || board.bootName) && board.name !== "none"
        );

        return (
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Board Status</Text>
                    <Text style={styles.headerSubtitle}>
                        {validBoards.length} board{validBoards.length !== 1 ? 's' : ''} found
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
            </View>
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
});

BoardStatusPanel.propTypes = {
    boardData: PropTypes.array,
    onRefreshBoards: PropTypes.func,
};

BoardStatusPanel.defaultProps = {
    boardData: [],
};
