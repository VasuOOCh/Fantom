'use client'
import { persistor, store } from '@/lib/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux'
import React from 'react';
import { persistStore } from "redux-persist";

const ReduxProvider = ({children} : {children : React.ReactNode}) => {
    
  return (
        <Provider store={store} >
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider >
    )
}

export default ReduxProvider