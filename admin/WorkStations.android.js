import React from 'react';
import Axios from 'axios';
import { NavigationEvents } from 'react-navigation';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Modal, TextInput, StyleSheet } from 'react-native';
import Fab from '../components/Fab';
import AnButton from '../components/AnButton';
const api = 'https://project-runner-f1bdc.firebaseapp.com/api/v1'

export default class WorkStations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stations: null,
            refreshing: false,
            showModal: false,
            name: '',
            err: null
        }
    }

    handleRefresh = () => {
        Axios.get(`${api}/stations/all`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }

                this.setState({ stations: result.data, refreshing: false })
            })
    }

    handleDelete = id => {
        Axios.put(`${api}/stations/remove`, {
            id
        })
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }
                this.handleRefresh();
            })
    }

    handleCreate = () => {
        if (!this.state.name || this.state.name.length < 4) {
            this.setState({ modalErr: 'Station name must be at least 4 letters long.' })
            return;
        }
        console.log('here');
        Axios.post(`${api}/stations/create`, {
            stationName: this.state.name
        })
            .then(result => {
                console.log(result.data);
                if (result.data.err) {
                    this.setState({ err: result.data.err })
                    return;
                }

                this.handleRefresh();
                this.hideModal();
            })
    }

    showModal = () => this.setState({ showModal: true });
    hideModal = () => this.setState({ showModal: false, name: '', modalErr: null });

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <NavigationEvents onWillFocus={this.handleRefresh} />
                <ScrollView
                    contentContainerStyle={{}}
                    refreshControl={<RefreshControl onRefresh={this.handleRefresh} refreshing={this.state.refreshing} />}
                >
                    <View style={{ height: 25 }} />
                    <View style={{ flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
                        <Text style={styles.header}>Work Stations</Text>
                    </View>
                    <Text style={{ color: '#f33446' }}>{this.state.err ? this.state.err.message : null}</Text>
                    <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {this.state.stations ? this.state.stations.map((station, index) => {
                            return (
                                <View key={index} style={styles.row}>
                                    <Text>{station.name}</Text>
                                    <AnButton style={{ alignSelf: 'flex-end' }} color="#f44336" title='Delete' onPress={() => this.handleDelete(station.id)} />
                                </View>
                            )
                        }) : null}
                    </View>
                </ScrollView>
                <Modal
                    animationType='fade'
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={this.hideModal}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <View style={{ height: 20 }} />
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={styles.header}>Create New Station</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ color: '#f33446', fontSize: 20 }}>{this.state.modalErr}</Text>
                    </View>
                    <View style={{ flex: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', position: 'relative', left: '5%' }}>
                        <TextInput style={styles.input} onChangeText={text => this.setState({ name: text, modalErr: null })} value={this.state.name} placeholder="Station Name" />
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                            <AnButton color="#2196f3" title="Create" onPress={this.handleCreate} />
                            <AnButton color="#2196f3" title="Cancel" onPress={this.hideModal} />
                        </View>

                    </View>
                </Modal>
                <Fab onPress={this.showModal} />
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    row: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
        alignItems: 'center',
        borderBottomColor: 'grey',
        borderBottomWidth: 0.5,
        width: '90%',
        position: 'relative',
        left: '5%',
    },

    header: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 25,
    },

    input: {
        fontSize: 20,
        alignSelf: 'flex-start',
        backgroundColor: '#f2f2f2',
        width: '100%',
        borderRadius: 10,
        marginBottom: 16,
        padding: 12,
    }
})