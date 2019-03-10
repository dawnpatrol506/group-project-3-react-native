import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const Login = props => (
    <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 30 }}>
    <View style={{ flex: 1 }} />
    <View style={{ flex: 3, display: 'flex', width: '90%', position: 'relative', left: '5%' }}>
        <Text style={{ fontSize: 28, alignSelf: 'flex-start' }}>Email</Text>
        <TextInput style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'gray', borderWidth: 1, height: 40, width: 280, marginBottom: 20 }} value={props.username} onChangeText={text => props.handleUsernameChange(text)} />
        <Text style={{ fontSize: 28, alignSelf: 'flex-start' }}>Password</Text>
        <TextInput secureTextEntry={true} style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'gray', borderWidth: 1, height: 40, width: 280, marginBottom: 20 }} value={props.password} onChangeText={text => props.handlePasswordChange(text)} />
        <TouchableOpacity onPress={props.login}>
            <Text style={{color: '#2196f3', fontSize: 20}}>Sign in</Text>
        </TouchableOpacity>
        <Text style={{ color: 'red' }}>{props.err ? props.err.message : null}</Text>
    </View>
    <View style={{ flex: 1 }} />
</View>
)

export default Login;