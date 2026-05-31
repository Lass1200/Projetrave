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

const Tab = createBottomTabNavigator<RootTabParamList>()

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
                <NavigationContainer>
                    <Tab.Navigator>
                        <Tab.Screen name="Home" component={Home} />
                        <Tab.Screen name="Record" component={Record} />
                        <Tab.Screen name="RAVE" component={RAVE} />
                    </Tab.Navigator>
                </NavigationContainer>
            </PersistGate>
        </Provider>
    )
}