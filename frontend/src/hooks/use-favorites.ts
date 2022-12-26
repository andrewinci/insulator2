import { Favorites } from "../models";
import { useUserSettings } from "../providers";

export const useFavorites = (clusterId: string, key: keyof Favorites) => {
  const { userSettings, setUserSettings } = useUserSettings();
  const setFavorites = (newFavs: Favorites) => {
    setUserSettings((s) => ({
      ...s,
      clusters: s.clusters.map((c) => (c.id != clusterId ? c : { ...c, favorites: newFavs })),
    }));
  };
  const userFavorites = userSettings.clusters.find((c) => c.id == clusterId)?.favorites;
  const toggleFav = async (newItem: string) => {
    if (!userFavorites) return;
    const favorites = userFavorites[key];
    // toggle item from the favorites list
    if (favorites?.includes(newItem)) {
      await setFavorites({ ...userFavorites, [key]: favorites.filter((f) => f != newItem) });
    } else {
      await setFavorites({ ...userFavorites, [key]: [...favorites, newItem] });
    }
  };

  return { favorites: userFavorites ? userFavorites[key] : [], toggleFavorite: toggleFav };
};
