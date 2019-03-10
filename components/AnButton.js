import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const AnButton = props => (
    <TouchableOpacity style={props.style ? props.style : {width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}} onPress={props.onPress}>
        <Text style={{ color: props.color, fontSize: 20 }}>{props.title}</Text>
    </TouchableOpacity>
)

export default AnButton;