import { setLoadingState } from '@/lib/redux/loadingSlice';
import React from 'react'
import { useDispatch } from 'react-redux';

const useSetLoading = (val : boolean    ) => {
    const dispatch = useDispatch();

    dispatch(setLoadingState(val))
}

export default useSetLoading