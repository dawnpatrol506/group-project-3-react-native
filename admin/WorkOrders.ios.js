import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Button, RefreshControl, Modal, StyleSheet, TextInput } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import Axios from 'axios';
import Card from '../components/Card';
const api = 'https://project-runner-f1bdc.firebaseapp.com/api/v1';
import { WebBrowser } from 'expo';
import firebase from 'firebase/app';
import 'firebase/storage';

const config = {
    apiKey: "AIzaSyAZB-qbjpKVRvaQt17kPsPTMav3O12by6k",
    authDomain: "project-runner-f1bdc.firebaseapp.com",
    databaseURL: "https://project-runner-f1bdc.firebaseio.com",
    projectId: "project-runner-f1bdc",
    storageBucket: "project-runner-f1bdc.appspot.com",
    messagingSenderId: "757776283780"
};
firebase.initializeApp(config);

export default class WorkOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parts: null,
            name: '',
            stations: null,
            filename: '',
            err: null,
            modalErr: null,
            refreshing: false,
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
    }


    handleDelete = id => {
        Axios.put(`${api}/parts/archive/${id}`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }
                this.handleRefresh();
            })
    }

    handleCreate = () => {
        let { name, stations, filename } = this.state;

        if (!stations || stations.length < 1) {
            this.setState({ modalErr: 'You must select at least one station for your part.' });
            return;
        }

        if (!name || name.length < 4) {
            this.setState({ modalErr: 'Part names must be at least 4 characters long.' });
            return;
        }

        if (!filename)
            filename = 'No File';


        Axios.post(`${api}/parts/create`, {
            part: {
                name,
                stations,
                filename,
            }
        })
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }

                this.handleRefresh();
            })
    }

    viewAttachment = async filepath => {
        const url = await firebase.storage().ref(filepath).getDownloadURL();
        WebBrowser.openBrowserAsync(url);
    }

    generateButtons = part => {
        return [
            {
                name: 'Attachment',
                func: () => this.viewAttachment(`${part.id}/${part.filename}`),
                color: '#2196f3'
            },
            {
                name: 'Delete',
                func: () => this.handleDelete(part.id),
                color: '#2196f3'
            }
        ]
    }

    generateContent = part => {
        return (
            part.stations.map((station, index) => {
                return <Text key={index}>{station.name}</Text>
            })
        )
    }

    showModal = () => this.setState({ showModal: true });
    hideModal = () => this.setState({ showModal: false, modalErr: null, name: '', email: '', password: '' });

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <NavigationEvents onWillFocus={this.handleRefresh} />
                <ScrollView
                    contentContainerStyle={{}}
                    refreshControl={<RefreshControl onRefresh={this.handleRefresh} refreshing={this.state.refreshing} />}
                >
                    <View style={{ flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
                        <Text style={styles.header}>Parts</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15, color: '#f44336' }}>{this.state.err ? this.state.err.message : null}</Text>
                    </View>
                    <View>
                        {this.state.parts ? this.state.parts.map((part, index) => {
                            return <Card key={index} title={part.name} hasButtons={true} buttons={this.generateButtons(part)} content={this.generateContent(part)} />
                        }) : null}
                    </View>
                </ScrollView>
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