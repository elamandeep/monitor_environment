import { create } from 'zustand';
import * as ol from 'ol'
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
// Define the shape of the store's state

type OptionType = "layers" | "pen" | "clear" | "share" | null

interface StoreState {
    queryString: string,
    option: OptionType;
    setOption: (newOption: OptionType) => void;
    Map: ol.Map | null,
    setMap: (map: ol.Map) => void,
    feature: Array<Array<number>> | null,
    setFeature: (feature: Array<Array<number>>) => void
    isReload: boolean,
    setReload: () => void
    setQueryString: (value: string) => void
}

// Create the store
const useAppStore = create<StoreState>()(
    persist((set, get) => ({
        queryString: "?",
        option: null,
        Map: null,
        feature: null,
        setOption: (newOption) => set({ option: newOption }),
        setMap: (map) => set({ Map: map }),
        setFeature: (feature) => set({ feature }),
        isReload: false,
        setReload: () => set({ isReload: !get().isReload }),
        setQueryString: (value) => {
            let newString = get().queryString + value + "&"
            set(() => ({ queryString: newString }))
        }
    }), {
        name: 'app-store',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => Object.fromEntries(
            Object.entries(state).filter(([key]) => !['Map', 'queryString', 'option', 'feature'].includes(key)),
        ),

    }));

export default useAppStore;


export interface IMergedValue {
    geom: Array<string>, ndvi: Array<string>, co: Array<string>, precipitation: Array<string>
}


interface ShareStoreState {
    mergedValue: IMergedValue
    setMergedValue: (mergedValue: IMergedValue) => void
}

const useShareStore = create<ShareStoreState>()((set) => ({
    mergedValue: {
        geom: [],
        ndvi: [],
        co: [],
        precipitation: []
    },
    setMergedValue(mergedValue) {
        set({ mergedValue: mergedValue })
    },
}))


export { useShareStore }