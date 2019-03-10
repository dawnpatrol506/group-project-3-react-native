import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Fab = props => (
    <TouchableOpacity onPress={props.onPress} style={styles.wrap}>
        <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    wrap: {
        borderRadius: 30,
        backgroundColor: '#2196f3',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: '2%',
        right: '2%',
        height: 45,
        width: 45,
        shadowColor: 'grey',
        shadowOpacity: 0.5,
        shadowOffset: {width: 0.1, height: 0.1},
        zIndex: 1000,
    },
    icon: {
        fontSize: 45,
        lineHeight: 45,
        fontWeight: '300',
        color: 'white'
    }
})


export default Fab;