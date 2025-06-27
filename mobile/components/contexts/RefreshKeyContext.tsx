import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";

type RefreshKeys = {
	expenses: number;
	categories: number;
	paymentMethods: number;
};

const initialKeys: RefreshKeys = {
	expenses: 0,
	categories: 0,
	paymentMethods: 0,
};

type RefreshKeyContextType = {
	refreshKeys: RefreshKeys;
	triggerRefresh: (key: keyof RefreshKeys) => void;
};

const RefreshKeyContext = createContext<RefreshKeyContextType>({
	refreshKeys: initialKeys,
	triggerRefresh: () => {},
});

export const RefreshKeyProvider = ({ children }: PropsWithChildren) => {
	const [refreshKeys, setRefreshKeys] = useState(initialKeys);

	const triggerRefresh = useCallback((key: keyof RefreshKeys) => {
		setRefreshKeys((prev) => ({
			...prev,
			[key]: prev[key] + 1,
		}));
	}, []);

	return (
		<RefreshKeyContext.Provider value={{ refreshKeys, triggerRefresh }}>
			{children}
		</RefreshKeyContext.Provider>
	);
};

export const useRefreshKey = () => useContext(RefreshKeyContext);
