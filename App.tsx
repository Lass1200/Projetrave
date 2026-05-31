import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './src/store/store'
import { RootTabParamList } from './types'
import Home from './src/screens/Home'
import Record from './src/screens/Record'
import RAVE from './src/screens/RAVE'
import { ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const Tab = createBottomTabNavigator<RootTabParamList>()

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
                <NavigationContainer>
                    <Tab.Navigator
                        screenOptions={{
                            tabBarActiveTintColor: '#000',
                            tabBarInactiveTintColor: '#999',
                            tabBarStyle: { paddingBottom: 5, height: 60 }
                        }}
                    >
                        <Tab.Screen
                            name="Home"
                            component={Home}
                            options={{
                                tabBarIcon: ({ color, size }) => (
                                    <Ionicons name="wifi" size={size} color={color} />
                                )
                            }}
                        />
                        <Tab.Screen
                            name="Record"
                            component={Record}
                            options={{
                                tabBarIcon: ({ color, size }) => (
                                    <Ionicons name="mic" size={size} color={color} />
                                )
                            }}
                        />
                        <Tab.Screen
                            name="RAVE"
                            component={RAVE}
                            options={{
                                tabBarIcon: ({ color, size }) => (
                                    <Ionicons name="pulse" size={size} color={color} />
                                )
                            }}
                        />
                    </Tab.Navigator>
                </NavigationContainer>
            </PersistGate>
        </Provider>
    )
}