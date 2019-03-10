import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Button, RefreshControl, Modal, StyleSheet, TextInput } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import Axios from 'axios';
import Card from '../components/Card';
import Fab from '../components/Fab';
import AnButton from '../components/AnButton';
const api = 'https://project-runner-f1bdc.firebaseapp.com/api/v1';

export default class Employees extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employees: null,
            email: '',
            password: '',
            username: '',
            err: null,
            modalErr: null,
            refreshing: false,
            showModal: false
        }
    }

    handleRefresh = () => {
        Axios.get(`${api}/employees/all`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }

                this.setState({ employees: result.data, refreshing: false })
            })
    }

    toggleAdmin = (id, isAdmin) => {
        if (isAdmin) {
            let count = 0;
            this.state.employees.forEach(emp => {
                if (emp.isAdmin)
                    count++;
            })

            if (count < 2) {
                this.setState({ err: { message: 'There must always be at least one Administrator.' } })
                return;
            }
        }

        Axios.put(`${api}/employees/togglepermission`, {
            id,
            isAdmin
        })
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err })
                    return;
                }
                this.handleRefresh();
                this.setState({ err: null })
            })
    }

    handleDelete = id => {
        Axios.put(`${api}/employees/archive/${id}`)
            .then(result => {
                if (result.data.err) {
                    this.setState({ err: result.data.err });
                    return;
                }
                this.handleRefresh();
            })
    }

    handleCreate = () => {
        const name = this.state.name;
        const email = this.state.email;
        const password = this.state.password;

        if (!name || !email || !password) {
            this.setState({ modalErr: 'Please fill all fields before submitting.' })
            return;
        }

        if (name.length < 4) {
            this.setState({ modalErr: 'Employee name must be at least 4 letters long. You can include first and last names in this field' });
            return;
        }

        Axios.post(`${api}/auth/create`, {
            employee: {
                name,
                email,
                password
            }
        })
            .then(result => {
                if (result.data.err) {
                    console.log(result.data);
                    this.setState({ modalErr: result.data.err.message });
                    return;
                }
                this.handleRefresh();
                this.hideModal();
            })
    }

    generateButtons = emp => {
        return [
            {
                name: emp.isAdmin ? 'Revoke Admin' : 'Grant Admin',
                func: () => this.toggleAdmin(emp.id, emp.isAdmin),
                color: emp.isAdmin ? '#f44336' : '#4caf50'
            },
            {
                name: 'Delete',
                func: () => this.handleDelete(emp.id),
                color: '#f44336'
            }
        ]
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
                        <Text style={styles.header}>Employees</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15, color: '#f44336' }}>{this.state.err ? this.state.err.message : null}</Text>
                    </View>
                    <View>
                        {this.state.employees ? this.state.employees.map((emp, index) => {
                            return <Card key={index} title={emp.name} hasButtons={true} buttons={this.generateButtons(emp)} content={<Text>{emp.email}</Text>} />
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
                        <Text style={styles.header}>Create New Employee</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ color: '#f33446', fontSize: 20 }}>{this.state.modalErr}</Text>
                    </View>
                    <View style={{ flex: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', position: 'relative', left: '5%' }}>
                        <TextInput style={styles.input} onChangeText={text => this.setState({ name: text, modalErr: null })} value={this.state.name} placeholder="Employee Name" />
                        <TextInput style={styles.input} onChangeText={text => this.setState({ email: text, modalErr: null })} value={this.state.email} placeholder="Email" />
                        <TextInput style={styles.input} onChangeText={text => this.setState({ password: text, modalErr: null })} value={this.state.password} placeholder="Password" />
                        <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                            <AnButton color="#2196f3" title="Create" onPress={this.handleCreate} />
                            <AnButton color="#2196f3" title="Cancel" onPress={this.hideModal} />
                        </View>
                        <View style={{ height: 150 }} />
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