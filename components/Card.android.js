import React from 'react';
import { Text, View, Button, StyleSheet, Dimensions } from 'react-native';
import AnButton from './AnButton';
const dims = Dimensions.get('screen');

const Card = props => (
    <View style={{ flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'black', borderRadius: 10, display: 'flex', minHeight: 120, marginTop: 15, width: (dims.width * .90), position: 'relative', left: (dims.width * .05) }}>
        <View style={{ height: 40, backgroundColor: '#f2f2f2cc', borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomColor: 'black', borderBottomWidth: 0.5 }}>
            <Text style={{ alignSelf: 'center', fontWeight: '600', fontSize: 25 }}>{props.title}</Text>
        </View>
        <View style={props.hasButtons ? style.cardContent : style.cardContentBottom}>
            {props.content}
        </View>
        <View style={props.hasButtons ? style.cardBottom : style.hidden}>
            {props.hasButtons ? props.buttons.map((button, index) => {
                return <AnButton color={button.color} key={index} title={button.name} onPress={button.func} />
            }) : null}
        </View>
    </View>
)

const style = StyleSheet.create({
    cardBottom: {
        height: 40,
        backgroundColor: 'white',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopColor: 'black',
        borderTopWidth: 0.5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    cardContent: {
        flex: 1,
        minHeight: 120,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'flex-start',
        alignContent: 'space-around',
        padding: 12
    },
    cardContentBottom: {
        flex: 1,
        minHeight: 120,
        backgroundColor: '#f2f2f2',
        // borderBottomLeftRadius: 10,
        // borderBottomRightRadius: 10
    },
    hidden: { display: 'none' }
})

export default Card;