import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import Axios from 'axios';

export default class Employee extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stations: null,
            err: null,
            refreshing: false
        }
    }

    static navigationOptions = () => {
        return { title: global.uInfo ? JSON.parse(global.uInfo).username : 'Employee Page' }
    }

    handleRefresh = () => {
        this.setState({ refreshing: true })
        Axios.get('https://project-runner-f1bdc.firebaseapp.com/api/v1/stations/all')
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err, refreshing: false });
                    return;
                }

                this.setState({ stations: result.data, refreshing: false });
            })
            .catch(err => this.setState({ err, refreshing: false }))
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
                <NavigationEvents
                    onWillFocus={this.handleRefresh}
                />
                <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} />}>
                    <View style={{ flex: 1, alignContent: 'center', flexDirection: 'column' }}>
                        <Text style={{ fontSize: 28, flex: 1, marginTop: 12, alignSelf: 'center', marginBottom: 20 }}>Available Stations</Text>
                        <View style={{ flex: 6, display: 'flex' }}>
                            {this.state.stations ? this.state.stations.map((station, index) => {
                                return (
                                    <TouchableOpacity key={index} onPress={() => this.props.navigation.navigate('Station', { stationID: station.id, stationsName: station.name })}>
                                        <Text style={{ color: '#2196f3', fontSize: 20, marginBottom: 20, alignSelf: 'center' }}>{station.name}</Text>
                                    </TouchableOpacity>
                                )
                            }) : null}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}