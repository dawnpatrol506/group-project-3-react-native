import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Button, RefreshControl, Modal, StyleSheet, TextInput, PickerIOS } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import Axios from 'axios';
import Card from '../components/Card';
import Fab from '../components/Fab';
const api = 'https://project-runner-f1bdc.firebaseapp.com/api/v1';
import { WebBrowser } from 'expo';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';

export default class WorkOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parts: null,
            workOrders: null,
            selectedPartIndex: 0,
            quantity: 0,
            notes: '',
            err: null,
            modalErr: null,
            refreshing: false,
            showPicker: false,
            showModal: false
        }
    }

    handleRefresh = () => {
        Axios.get(`${api}/parts/all`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }

                this.setState({ parts: result.data, refreshing: false });
            })
            .catch(err => this.setState({ err }))

        Axios.get(`${api}/workorders/active`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }

                this.setState({ workOrders: result.data, refreshing: false })
            })
            .catch(err => this.setState({ err }))
    }


    handleCreate = () => {
        const { selectedPartIndex, quantity, notes } = this.state;

        if (selectedPartIndex < 0 || selectedPartIndex > this.state.parts.length - 1) {
            this.setState({ err: 'An unexpected "out of index" error occurred. God have mercy on your soul' });
            return;
        }

        if (isNaN(quantity) || quantity < 1) {
            this.setState({ modalErr: 'Quantity must be greater than 0' });
            return;
        }

        Axios.post(`${api}/workorders/create`, {
            job: {
                part: this.state.parts[selectedPartIndex],
                quantity,
                notes
            }
        })
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }

                this.handleRefresh();
                this.hideModal();
                this.hidePicker();
            })
    }

    handlePickerChange = (value, index) => {
        value = JSON.parse(value);
        this.setState({ selectedPartIndex: index }, () => console.log(this.state.parts[this.state.selectedPartIndex]));
    }

    viewAttachment = async filepath => {
        const url = await firebase.storage().ref(filepath).getDownloadURL();
        WebBrowser.openBrowserAsync(url);
    }

    generateButtons = workOrder => {
        return [
            {
                name: 'Attachment',
                func: () => this.viewAttachment(`${workOrder.part.id}/${workOrder.part.filename}`),
                color: '#2196f3'
            }
        ]
    }

    generateContent = wo => {
        return (
            <View>
                <Text>Date Created: {new firebase.firestore.Timestamp(wo.dateCreated.seconds, wo.dateCreated.nanoseconds).toDate().toLocaleString()}</Text>
                <Text>Current Station: {wo.currentStation.name}</Text>
                <Text>Order Quantity: {wo.quantity}</Text>
                <Text>Remaining Quantity: {wo.quantity - wo.partialQty}</Text>
                <Text>Notes: {wo.notes}</Text>
            </View>
        )
    }

    showModal = () => this.setState({ showModal: true });
    hideModal = () => this.setState({ showModal: false, modalErr: null, selectedPartIndex: 0, quantity: 0, notes: '' });
    showPicker = () => this.setState({ showPicker: true });
    hidePicker = () => this.setState({ showPicker: false });


    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <NavigationEvents onWillFocus={this.handleRefresh} />
                <ScrollView
                    contentContainerStyle={{}}
                    refreshControl={<RefreshControl onRefresh={this.handleRefresh} refreshing={this.state.refreshing} />}
                >
                    <View style={{ flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
                        <Text style={styles.header}>Work Orders</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15, color: '#f44336' }}>{this.state.err ? this.state.err.message : null}</Text>
                    </View>
                    <View>
                        {this.state.workOrders ? this.state.workOrders.map((wo, index) => {
                            return <Card key={index} title={wo.part.name} hasButtons={true} buttons={this.generateButtons(wo)} content={this.generateContent(wo)} />
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
                        <Text style={styles.header}>Create New Work Order</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ color: '#f33446', fontSize: 20 }}>{this.state.modalErr}</Text>
                    </View>
                    <View style={{ flex: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', position: 'relative', left: '5%' }}>
                        <Text style={styles.input}>Selected Part: {this.state.parts ? this.state.parts[this.state.selectedPartIndex].name : null}</Text>
                        <TextInput keyboardType="number-pad" style={styles.input} onChangeText={text => this.setState({ quantity: text, modalErr: null })} value={this.state.email} placeholder="Quantity" />
                        <TextInput style={styles.input} onChangeText={text => this.setState({ notes: text, modalErr: null })} value={this.state.password} placeholder="Notes" />
                        <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                            <Button style={{ marginRight: 60 }} title="Create" onPress={this.handleCreate} />
                            <Button title="Cancel" onPress={this.hideModal} />
                        </View>
                        <View style={{ height: 150 }} />
                    </View>
                </Modal>
                <Modal
                    animationType='slide'
                    transparent={false}
                    visible={this.state.showPicker}
                    onRequestClose={this.hidePicker}
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                >
                    <PickerIOS
                        style={{ height: '50%', width: '100%' }}
                        selectedValue={this.state.selectedPartIndex}
                        onValueChange={(value, index) => this.handlePickerChange(value, index)}
                    >
                        {this.state.parts ? this.state.parts.map((part, index) => {
                            return <PickerIOS.Item key={index} label={part.name} value={index} />
                        }) : <PickerIOS.Item label="Parts unable to load" />}
                    </PickerIOS>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Button title='next' onPress={() => { this.hidePicker(); this.showModal() }} />
                        <Button title='cancel' onPress={this.hidePicker} />
                    </View>
                </Modal>
                <Fab onPress={this.showPicker} />
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
    },

})