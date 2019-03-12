import React from 'react';
import { SafeAreaView, ScrollView, View, Text, RefreshControl, Modal, Button, TextInput } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { SecureStore } from 'expo';
import Card from '../components/Card';
import Axios from 'axios';
let username = null;
let uid = null;

SecureStore.getItemAsync('userInfo')
    .then(result => {
        result = JSON.parse(result);
        username = result.username;
        uid = result.uid
    })

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

const Content = props => (
    <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignContent: 'space-between', fontSize: 13 }}>
        <View style={{ display: 'flex', flexDirection: 'row', flex: 1, marginBottom: 13 }}>
            <Text style={{ fontWeight: 'bold' }}>Order Qty: </Text>
            <Text>{props.qty}</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', flex: 1, marginBottom: 13 }}>
            <Text style={{ fontWeight: 'bold' }}>Remaining Qty: </Text>
            <Text>{props.remaining}</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>Notes: </Text>
            <Text>{props.notes}</Text>
        </View>
    </View>
)

export default class Station extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workOrders: null,
            currentWorkOrder: null,
            refreshing: false,
            showStartModal: false,
            showFinishModal: false,
            partsCompleted: null,
            time: null,
            timer: null,
            jobSubmissionErr: null
        }
    }

    static navigationOptions = ({navigation}) =>  {
        return {
        title: navigation.state.params.stationsName
        }
    }

    handleRefresh = () => {
        this.setState({ refreshing: true })
        Axios.get(`https://project-runner-f1bdc.firebaseapp.com/api/v1/workorders/active/${this.props.navigation.state.params.stationID}`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err, refreshing: false });
                    return;
                }

                this.setState({ workOrders: result.data, refreshing: false })
            })
            .catch(err => this.setState({ err, refreshing: false }))
    }

    startJob = index => {
        this.setState(prevState => ({ showStartModal: true, currentWorkOrder: prevState.workOrders[index] }))
        this.startTimer();
    }

    startTimer = () => {
        const timer = setInterval(() => {
            this.setState(prevState => ({ time: ++prevState.time }))
        }, 1000);

        this.setState({ timer })
    }

    stopJob = () => {
        clearInterval(this.state.timer);
        this.setState({ showStartModal: false, showFinishModal: true })
    }

    finishJob = () => {
        clearInterval(this.state.timer);

        const currentWorkOrder = Object.assign(this.state.currentWorkOrder);
        currentWorkOrder.currentStation.time = this.state.time;

        Axios.put('https://project-runner-f1bdc.firebaseapp.com/api/v1/workorders/next', {
            currentWorkOrder,
            uid,
            username,
            partsCompleted: (currentWorkOrder.quantity - currentWorkOrder.partialQty)
        })
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err })
                }
            })
            .catch(err => this.setState({ err }))

        this.handleRefresh();
        this.setState({ showStartModal: false, showFinishModal: false, time: 0 });
    }

    submitJob = () => {
        if (parseInt(this.state.partsCompleted) < 0 || parseInt(this.state.partsCompleted) > (parseInt(this.state.currentWorkOrder.quantity) - parseInt(this.state.currentWorkOrder.partialQty))) {
            this.setState({ jobSubmissionErr: `Please choose a quantity between 0 and ${this.state.currentWorkOrder.quantity}` });
            return;
        }

        if (parseInt(this.state.partsCompleted) === (parseInt(this.state.currentWorkOrder.quantity) - parseInt(this.state.currentWorkOrder.partialQty))) {
            this.finishJob()
            return;
        }

        const currentWorkOrder = Object.assign(this.state.currentWorkOrder);
        currentWorkOrder.currentStation.time = this.state.time;

        Axios.put(`https://project-runner-f1bdc.firebaseapp.com/api/v1/workorders/update/${currentWorkOrder.id}`, {
            currentStation: currentWorkOrder.currentStation,
            uid,
            username,
            partsCompleted: this.state.partsCompleted,
            partialQty: (parseInt(this.state.currentWorkOrder.partialQty ? this.state.currentWorkOrder.partialQty : 0) + parseInt(this.state.partsCompleted))
        })
            .then(result => {
                this.setState({ err: result.data.err });
                return;
            })
            .catch(err => this.setState({ err }));

        this.handleRefresh();
        this.setState({ showFinishModal: false, showStartModal: false, quantity: '' })
    }

    handleNumberInput = text => {
        if (isNaN(text)) {
            this.setState(prevState => ({ partsCompleted: prevState.partsCompleted, jobSubmissionErr: null }));
            return;
        }
        this.setState({ partsCompleted: text, jobSubmissionErr: null })
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, display: 'flex' }}>
                <NavigationEvents
                    onWillFocus={this.handleRefresh}
                />
                <ScrollView style={{backgroundColor: 'white'}} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}>
                    {this.state.workOrders ? this.state.workOrders.map((wo, index) => {
                        return <Card
                            key={index}
                            hasButtons={true}
                            title={wo.part.name}
                            content={<Content qty={wo.quantity} remaining={wo.quantity - wo.partialQty} notes={wo.notes} />}
                            buttons={[{ name: 'start', func: () => this.startJob(index) }]}
                        />
                    }) : null}
                </ScrollView>
                <Modal
                    animationType='fade'
                    transparent={false}
                    visible={this.state.showStartModal}
                    onRequestClose={() => this.setState({ showStartModal: false, showFinishModal: true })}
                >
                    <View style={{ flex: 1, display: 'flex' }}>
                        <View style={{ height: 35 }} />
                        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Text style={{ fontSize: 34, fontWeight: 'bold' }}>{this.state.currentWorkOrder ? this.state.currentWorkOrder.part.name : null}</Text>
                            <Text style={{ fontSize: 28 }}>{displayTime(this.state.time)}</Text>
                        </View>
                        <View style={{ flex: 3, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 30, fontWeight: '500' }}>Quantity: {this.state.currentWorkOrder ? this.state.currentWorkOrder.quantity : 0}</Text>
                        </View>
                        <View style={{ flex: 1, display: 'flex', justifyContent: 'space-around', flexDirection: 'row' }}>
                            <Button title="stop" onPress={this.stopJob} />
                            <Button title="finish job" onPress={this.finishJob} />
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType='fade'
                    transparent={false}
                    visible={this.state.showFinishModal}
                    onRequestClose={() => this.setState({ showFinishModal: false, showStartModal: false })}
                >
                    <View style={{ flex: 1, display: 'flex', borderColorBottom: 'black' }}>
                        <View style={{ height: 35 }} />
                        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Text style={{ fontSize: 34, fontWeight: 'bold' }}>Work Review</Text>
                            <Text style={{ color: 'red' }}>{this.state.jobSubmissionErr}</Text>
                        </View>
                        <View style={{ flex: 4 }}>
                            <Text style={{ position: 'relative', left: '5%', fontSize: 28 }}>Parts Completed: </Text>
                            <TextInput style={{ borderColor: 'gray', borderWidth: 1, width: '90%', position: 'relative', left: '5%', height: 28 }} onChangeText={text => this.handleNumberInput(text)} value={this.state.partsCompleted} keyboardType='number-pad' />
                            <Button style={{ marginTop: 20 }} title='Submit' onPress={this.submitJob} />
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        )
    }
}