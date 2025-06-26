import { createContext, useContext, useState } from 'react';

type RefreshEntityType = 'courses' | 'groups' | 'semesters';

interface RefreshDataContextType {
  refreshTriggerMap: Record<RefreshEntityType, number>;
  triggerRefresh: (type: RefreshEntityType) => void;
}

const RefreshDataContext = createContext<RefreshDataContextType>({
  refreshTriggerMap: {
    courses: 0,
    groups: 0,
    semesters: 0
  },
  triggerRefresh: () => {},
});

export const useRefreshDataContext = () => useContext(RefreshDataContext);

export const RefreshDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshTriggerMap, setRefreshTriggerMap] = useState<Record<RefreshEntityType, number>>({
    courses: 0,
    groups: 0,
    semesters: 0
  });

  const triggerRefresh = (type: RefreshEntityType) => {
    setRefreshTriggerMap(prev => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  return (
    <RefreshDataContext.Provider value={{ refreshTriggerMap, triggerRefresh }}>
      {children}
    </RefreshDataContext.Provider>
  );
};
