import React from 'react';
import { Text, View, Button, StyleSheet, Dimensions } from 'react-native';
const dims = Dimensions.get('screen');

const Card = props => (
    <View style={{ flex: 1, backgroundColor: 'transparent', borderRadius: 10, display: 'flex', minHeight: 120, marginTop: 15, width: (dims.width * .95) }}>
        <View style={{ height: 40, backgroundColor: '#f2f2f2cc', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <Text style={{ alignSelf: 'center', fontWeight: '600', fontSize: 25 }}>{props.title}</Text>
        </View>
        <View style={props.hasButtons ? style.cardContent : style.cardContentBottom}>
            {props.content}
        </View>
        <View style={props.hasButtons ? style.cardBottom : style.hidden}>
            {props.hasButtons ? props.buttons.map((button, index) => {
                return <Button key={index} title={button.name} onPress={button.func} />
            }) : null}
        </View>
    </View>
)

const style = StyleSheet.create({
    cardBottom: {
        height: 40,
        backgroundColor: '#f2f2f2aa',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    cardContent: {
        flex: 1,
        minHeight: 120,
        backgroundColor: '#e8e8e8aa',
        display: 'flex',
        alignItems: 'flex-start',
        alignContent: 'space-around'
    },
    cardContentBottom: {
        flex: 1,
        minHeight: 120,
        backgroundColor: '#e8e8e8aa',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    hidden: { display: 'none' }
})

export default Card;