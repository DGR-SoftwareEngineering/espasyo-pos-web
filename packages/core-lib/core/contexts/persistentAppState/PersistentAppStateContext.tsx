import { createContext, useContext } from 'react';
import { useCheckboxState } from './hooks/checkbox';

interface Props {}

export interface PersistentAppState {
    checkbox: ReturnType<typeof useCheckboxState>
}

const context = createContext<PersistentAppState>(undefined as any);

export const PersistentAppStateProvider: React.FC<React.PropsWithChildren<Props>> = ({
    children
}) => {
    const checkbox = useCheckboxState();
    return <context.Provider value={{ checkbox }}>{children}</context.Provider>
}

export const usePersistentAppState = () => {
    if (!context) {
        throw new Error('PersistentAppStateProvider should be used')
    }
    return useContext(context);
}