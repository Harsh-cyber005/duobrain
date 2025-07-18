"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AppContextType {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    totalContent: number;
    setTotalContent: React.Dispatch<React.SetStateAction<number>>;
    totalSearchContent: number;
    setTotalSearchContent: React.Dispatch<React.SetStateAction<number>>;
    modalComponent: ReactNode | null;
    setModalComponent: React.Dispatch<React.SetStateAction<ReactNode | null>>;
    heroKey: number;
    setHeroKey: React.Dispatch<React.SetStateAction<number>>;
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    share: boolean;
    setShare: React.Dispatch<React.SetStateAction<boolean>>;
    baseShareLink: string;
    totalContentShare: number;
    setTotalContentShare: React.Dispatch<React.SetStateAction<number>>;
    authName: string;
    setAuthName: React.Dispatch<React.SetStateAction<string>>;
    wantBack: boolean;
    setWantBack: React.Dispatch<React.SetStateAction<boolean>>;
    shareLink: string;
    setShareLink: React.Dispatch<React.SetStateAction<string>>;
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    tries: number;
    setTries: React.Dispatch<React.SetStateAction<number>>;
    token: string;
    setToken: React.Dispatch<React.SetStateAction<string>>;
    selectActive: boolean;
    setSelectActive: React.Dispatch<React.SetStateAction<boolean>>;
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
    shareMany: boolean;
    setShareMany: React.Dispatch<React.SetStateAction<boolean>>;
    shareManyLink: string;
    setShareManyLink: React.Dispatch<React.SetStateAction<string>>;
    baseShareManyLink: string;
    initial: string;
    setInitial: React.Dispatch<React.SetStateAction<string>>;   
    fromColor: string;
    setFromColor: React.Dispatch<React.SetStateAction<string>>;
    toColor: string;
    setToColor: React.Dispatch<React.SetStateAction<string>>;
    data: dataType[];
    setData: React.Dispatch<React.SetStateAction<dataType[]>>;
    heroDisplayData: dataType[];
    setHeroDisplayData: React.Dispatch<React.SetStateAction<dataType[]>>;
    searchedData: dataType[];
    setSearchedData: React.Dispatch<React.SetStateAction<dataType[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface dateType {
	day: string;
	month: string;
	year: string;
};

interface dataType {
	_id: string;
	title: string;
	link: string;
	type: "youtube" | "tweet" | "document" | "link" | "instagram" | "pinterest";
	content: string;
	tags: string[];
	date: dateType;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [totalContent, setTotalContent] = useState(0);
    const [totalSearchContent, setTotalSearchContent] = useState(0);
    const [totalContentShare, setTotalContentShare] = useState(0);
    const [modalComponent, setModalComponent] = useState<ReactNode | null>(null);
    const [heroKey, setHeroKey] = useState(0);
    const [filter, setFilter] = useState<string>("");
    const [share, setShare] = useState<boolean>(false);
    const [wantBack, setWantBack] = useState<boolean>(false);
    const [shareLink, setShareLink] = useState<string>("");
    const [authName, setAuthName] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tries, setTries] = useState(0);
    const [token, setToken] = useState<string>("");
    const [selectActive, setSelectActive] = useState<boolean>(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [shareMany, setShareMany] = useState<boolean>(false);
    const [shareManyLink, setShareManyLink] = useState<string>("");
    const [initial, setInitial] = useState<string>("");
    const [fromColor, setFromColor] = useState<string>("");
    const [toColor, setToColor] = useState<string>("");
    const [data, setData] = useState<dataType[]>([]);
    const [heroDisplayData, setHeroDisplayData] = useState<dataType[]>([]);
    const [searchedData, setSearchedData] = useState<dataType[]>([]);

    useEffect(() => {
        if(selected.length === 0) {
            setSelectActive(false);
        }
    }, [selected]);

    const baseShareLink = "http://3.110.244.124/duobrain/share/brain/";
    // const baseShareLink = "https://duobrain.vercel.app/share/brain/";
    const baseShareManyLink = "http://3.110.244.124/duobrain/share/brain/selected/";
    // const baseShareManyLink = "https://duobrain.vercel.app/share/brain/selected/";

    return (
        <AppContext.Provider value={{
            modalOpen,
            setModalOpen,
            totalContent,
            setTotalContent,
            modalComponent,
            setModalComponent,
            heroKey,
            setHeroKey,
            filter,
            setFilter,
            share,
            setShare,
            baseShareLink,
            totalContentShare,
            setTotalContentShare,
            authName,
            setAuthName,
            wantBack,
            setWantBack,
            shareLink,
            setShareLink,
            sidebarOpen,
            setSidebarOpen,
            tries,
            setTries,
            token,
            setToken,
            selectActive,
            setSelectActive,
            selected,
            setSelected,
            shareMany,
            setShareMany,
            shareManyLink,
            setShareManyLink,
            baseShareManyLink,
            initial,
            setInitial,
            fromColor,
            setFromColor,
            toColor,
            setToColor,
            data,
            setData,
            heroDisplayData,
            setHeroDisplayData,
            searchedData,
            setSearchedData,
            totalSearchContent,
            setTotalSearchContent
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within a AppProvider");
    }
    return context;
};
