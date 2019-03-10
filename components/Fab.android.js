import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

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
        shadowOffset: { width: 0.1, height: 0.1 },
        zIndex: 1000
    },

    icon: {
        fontSize: 45,
        position: 'relative',
        bottom: 3,
        fontWeight: '100',
        color: 'white',
    }
})


export default Fab;