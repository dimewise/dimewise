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
	exchangeRates: number;
	settings: number;
};

const initialKeys: RefreshKeys = {
	expenses: 0,
	categories: 0,
	paymentMethods: 0,
	exchangeRates: 0,
	settings: 0,
};

type RefreshKeyContextType = {
	refreshKeys: RefreshKeys;
	triggerRefresh: (key: keyof RefreshKeys) => void;
	triggerMultipleRefresh: (keys: (keyof RefreshKeys)[]) => void;
	refreshAll: () => void;
};

const RefreshKeyContext = createContext<RefreshKeyContextType>({
	refreshKeys: initialKeys,
	triggerRefresh: () => { },
	triggerMultipleRefresh: () => { },
	refreshAll: () => { },
});

export const RefreshKeyProvider = ({ children }: PropsWithChildren) => {
	const [refreshKeys, setRefreshKeys] = useState(initialKeys);

	const triggerRefresh = useCallback((key: keyof RefreshKeys) => {
		setRefreshKeys((prev) => ({
			...prev,
			[key]: prev[key] + 1,
		}));
	}, []);

	const triggerMultipleRefresh = useCallback((keys: (keyof RefreshKeys)[]) => {
		setRefreshKeys((prev) => {
			const updated = { ...prev };
			keys.forEach(key => {
				updated[key] = prev[key] + 1;
			});
			return updated;
		});
	}, []);

	const refreshAll = useCallback(() => {
		setRefreshKeys((prev) => ({
			expenses: prev.expenses + 1,
			categories: prev.categories + 1,
			paymentMethods: prev.paymentMethods + 1,
			exchangeRates: prev.exchangeRates + 1,
			settings: prev.settings + 1,
		}));
	}, []);

	return (
		<RefreshKeyContext.Provider value={{
			refreshKeys,
			triggerRefresh,
			triggerMultipleRefresh,
			refreshAll
		}}>
			{children}
		</RefreshKeyContext.Provider>
	);
};

export const useRefreshKey = () => useContext(RefreshKeyContext);
