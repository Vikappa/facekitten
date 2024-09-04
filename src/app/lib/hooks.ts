import { useCallback } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { Action, ThunkDispatch } from '@reduxjs/toolkit';
import type { AppDispatch, AppStore, RootState } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()

// export const useLocalStorageRedux = () => {
//     const dispatch = useAppDispatch();
//     const state = useAppSelector((state: RootState) => state);

//     const dispatchWithLocalStorage = useCallback(
//         (action: Action | ThunkDispatch<RootState, unknown, Action>) => {
//             // Invio dell'azione al Redux store
//             dispatch(action);

//             // Aggiornamento del localStorage con il nuovo stato
//             const updatedState = JSON.stringify(state);
//             localStorage.setItem('facekittenData', updatedState);
//         },
//         [dispatch, state]
//     );

//     return dispatchWithLocalStorage;
// };