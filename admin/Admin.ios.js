import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Button, RefreshControl, Modal, StyleSheet } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import Axios from 'axios';
import Card from '../components/Card';
const api = 'https://project-runner-f1bdc.firebaseapp.com/api/v1';
const breakException = {};


function displayTime(time) {
    let hours = 0, minutes = 0, seconds = 0;

    hours = Math.floor(time / 60 / 60);
    if (hours < 10)
        hours = `0${hours}`;

    minutes = time >= 3600 ? Math.floor((time % 3600) / 60) : Math.floor(time / 60);
    if (minutes < 10)
        minutes = `0${minutes}`;

    seconds = time % 60;
    if (seconds < 10)
        seconds = `0${seconds}`

    return `${hours}:${minutes}:${seconds}`;
}

let sum = 0;

const HistoryItem = props => (
    <View style={{ flexDirection: 'row' }}>
        <Text>{props.data.stationName}, </Text>
        <Text>{props.data.employeeName}</Text>
        <Text>, {props.data.partsCompleted}</Text>
        <Text>, {displayTime(props.data.time)}</Text>
        <Text>, {displayTime(sum += props.data.time)}</Text>
    </View>
)

export default class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stations: null,
            workOrders: null,
            activeStations: null,
            showHistoryModal: false,
            refreshing: false,
            currentHistory: null,
            err: null
        }
    }

    handleRefresh = async () => {
        await Axios.get(`${api}/stations/all`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err })
                    return;
                }
                this.setState({ stations: result.data })
            })
            .catch(err => this.setState({ err }))

        await Axios.get(`${api}/workorders/active`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err })
                    return;
                }

                this.setState({ workOrders: result.data });
            })
            .catch(err => this.setState({ err }))

        const activeStations = [];

        this.state.stations.forEach((station, index) => {
            try {
                this.state.workOrders.forEach(wo => {
                    if (wo.currentStation.id === station.id) {
                        activeStations.push(station);
                        throw breakException;
                    }
                })
            } catch (e) { }
        })
        this.setState({ refreshing: false, activeStations })
    }

    openHistoryModal = (history) => {
        this.setState({ showHistoryModal: true, currentHistory: history })
    }

    closeHistoryModal = () => this.setState({ showHistoryModal: false })

    render() {
        if (!this.state.workOrders)
            return (
                <View>
                    <NavigationEvents
                        onWillFocus={this.handleRefresh}
                    />
                </View>
            )

        return (
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{}}
                    refreshControl={<RefreshControl onRefresh={this.handleRefresh} refreshing={this.state.refreshing} />}

                >
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
                        <View style={{ height: 20 }} />
                        <View >
                            <Text style={{ fontSize: 34, fontWeight: 'bold', alignSelf: 'center' }}>Work Order Overview</Text>
                        </View>
                        <View style={{ flex: 6 }}>
                            {this.state.activeStations ? this.state.activeStations.map((station, index) => {
                                return (
                                    <View key={index} style={styles.table}>
                                        <Text style={styles.header}>{station.name}</Text>
                                        <View style={{ height: 20 }} />
                                        {this.state.workOrders.map((wo, index) => {
                                            return (
                                                <View key={index} style={styles.row}>
                                                    <Text>{wo.part.name}</Text>
                                                    <Text>{wo.quantity}</Text>
                                                    <Text>{wo.quantity - wo.partialQty}</Text>
                                                    <Button title="History" onPress={() => this.openHistoryModal(wo.history)} />
                                                </View>
                                            )
                                        })}
                                    </View>
                                )
                            }) : null}
                        </View>
                    </View>
                </ScrollView>
                <Modal
                    animationType='fade'
                    transparent={false}
                    visible={this.state.showHistoryModal}
                    onRequestClose={this.closeHistoryModal}
                    style={{ flex: 1, dislay: 'flex', flexDirection: 'columtn', justifyContent: 'center' }}
                >
                    <View style={{ height: 20 }} />
                    <View style={styles.historyTable}>
                        <Text style={styles.header} >Part History</Text>
                        <View style={styles.rowHeader}>
                            <Text style={{ fontWeight: '700' }}>Station</Text>
                            <Text style={{ fontWeight: '700' }}>Employee</Text>
                            <Text style={{ fontWeight: '700' }}>Qty Completed</Text>
                            <Text style={{ fontWeight: '700' }}>Time</Text>
                        </View>
                        {this.state.currentHistory ? this.state.currentHistory.map((item, index) => {
                            sum += item.time;
                            return (
                                <View key={index} style={styles.row}>
                                    <Text>{item.stationName}</Text>
                                    <Text>{item.employeeName}</Text>
                                    <Text>{item.partsCompleted}</Text>
                                    <Text>{displayTime(item.time)}</Text>
                                </View>
                            )
                        }) : null}
                        <View style={styles.total}>
                            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Total Time: {displayTime(sum)}</Text>
                        </View>
                        <Button title='close' onPress={this.closeHistoryModal} />
                    </View>
                </Modal>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    table: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 8,
        borderWidth: 1,
        borderColor: 'black',
        marginTop: 20
    },

    historyTable: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: 8,
    },

    header: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 12
    },

    rowHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 20,
        marginBottom: 8,
    },

    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 20,
        marginBottom: 8,
    },

    total: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        fontWeight: '800'
    }
})