import React from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Modal, FlatList } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import AnButton from '../components/AnButton';
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

const CardTable = props => {
    return (
        <View style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', width: '96%', position: 'relative', left: '2%', borderColor: 'gray', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <Text style={{ flex: 1, fontSize: 18 }}>Name, qty, remaining qty</Text>
            </View>
            {props.data.map((wo, index) => {
                if (wo.currentStation.id === props.stationId)
                    return <Row key={index} data={wo} openHistoryModal={props.openHistoryModal} />
            })}
        </View>
    )
}

const Row = props => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', borderRadius: 10, height: 60, alignItems: 'center', marginTop: 15, marginBottom: 15, width: '98%', position: 'relative', left: '1%' }}>
        <Text style={{ fontSize: 18 }}>{props.data.part.name}</Text>
        <Text style={{ fontSize: 18 }}>{props.data.quantity}</Text>
        <Text style={{ fontSize: 18 }}>{(props.data.quantity - props.data.partialQty)}</Text>
        <AnButton color="#2196f3" style={{ justifySelf: 'flex-end' }} title="history" onPress={() => props.openHistoryModal(props.data.history)} />
    </View>
)

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
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 34, fontWeight: 'bold', alignSelf: 'center', marginTop: 12 }}>Work Order Overview</Text>
                        </View>
                        <View style={{ flex: 6 }}>
                            {this.state.activeStations ? this.state.activeStations.map((station, index) => {
                                return (
                                    <Card key={index} content={<CardTable data={this.state.workOrders} stationId={station.id} openHistoryModal={this.openHistoryModal} />} title={station.name} hasButtons={false} />
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
                >
                    <View style={{ height: 20 }} />
                    <Text>Work Order History</Text>
                    {this.state.currentHistory ? <FlatList
                        data={this.state.currentHistory}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => <HistoryItem data={item} />}
                    /> : null}
                    <AnButton color="#2196f3" title='close' onPress={this.closeHistoryModal} />
                </Modal>
            </SafeAreaView>
        )
    }
}
