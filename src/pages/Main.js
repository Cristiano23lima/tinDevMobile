import React, {useEffect, useState} from 'react';
import { SafeAreaView, Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import io from 'socket.io-client';

import api from '../services/api';

import logo from '../assets/logo.png';
import dislike from '../assets/dislike.png';
import like from '../assets/like.png';

export default function Main({ navigation }) {
    const id = navigation.getParam('user');//PEGA O PARAMETRO ENVIADO NA NAVEGAÇÃO ENTRE AS PAGINAS
    const [users, setUsers] = useState([]);
    const [matchDev, setMatchDev] = useState();

    useEffect(() => {
        async function loadUsers(){
            const response = await api.get("/devs", {
                headers: {
                    user: id, 
                }
            });

            setUsers(response.data);
        }

        loadUsers();
    }, [id]) //primeiro parametro a função que eu quero executar, e o segundo parametro é quando eu quero executa-la
    
    useEffect(() => {
        const socket = io('http://localhost:3333', {
            query: { user: id }
        });

        socket.on('match', dev => {
            setMatchDev(dev);
        })
    }, [id])

    async function handleLike(){
        const [user, ... rest] = users;//desestruturação de array primeiro valor armazena o primeiro valor do vetor, e o segundo armazena os valores restantes do array

        await api.post(`/devs/${user._id}/likes`, null, {
            headers: {
                user: id
            }
        });

        setUsers(rest);
    }
    
    async function handleDislike(){
        const [user, ... rest] = users;

        await api.post(`/devs/${user._id}/dislikes`, null, {
            headers: {
                user: id
            }
        });

        setUsers(rest);
    }

    async function handleLogout() {
        await AsyncStorage.clear();

        navigation.navigate('Login');
    }


    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleLogout}>
                <Image source={logo} style={styles.logo} />
            </TouchableOpacity>

            <View style={styles.cardsContainer}>
                { users.length === 0  
                    ? <Text style={styles.empty}>Acabou :(</Text> 
                    :   (
                            users.map( (user, index) => (
                                <View key={user._id} style={[styles.card, { zIndex: users.length - index }]}>
                                    <Image styles={styles.avatar} source={{uri: user.avatar}} />
                                    <View style={styles.footer}>
                                        <Text style={styles.name} >{user.name}</Text>
                                        <Text style={styles.bio} numberOfLines={3} >{user.bio}</Text>
                                    </View>
                                </View>
                            ))
                        ) 
                }
            </View>

            { users.length > 0 && (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleDislike}>
                        <Image source={dislike} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleLike}>
                        <Image source={like} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    logo: {
        marginTop: 30,
    },

    empty: {
        alignSelf: 'center',
        color: '#999',
        fontSize: 24,
        fontWeight: 'bold'
    },

    cardsContainer: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        maxHeight: 500,
    },

    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        margin: 30,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    avatar: {
        flex: 1,
        height: 300,
    },

    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },

    bio: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        lineHeight: 18
    },

    buttonsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },

    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: {
            width: 0,
            height: 2,
        }
    },

    
})