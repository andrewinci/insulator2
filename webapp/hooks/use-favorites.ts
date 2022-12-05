import { Favorites } from "@models";
import { useQuery } from "@tanstack/react-query";
import { getFavorites, setFavorites } from "@tauri/configuration";

export const useFavorites = (clusterId: string, key: keyof Favorites) => {
  const { data: userFavorites, refetch } = useQuery(["getFavorites", clusterId], () => getFavorites(clusterId));
  const toggleFav = async (newItem: string) => {
    if (!userFavorites) return;
    const favorites = userFavorites[key];
    // toggle item from the favorites list
    if (favorites?.includes(newItem)) {
      await setFavorites(clusterId, { ...userFavorites, [key]: favorites.filter((f) => f != newItem) }); //todo: fix
    } else {
      await setFavorites(clusterId, { ...userFavorites, [key]: [...favorites, newItem] });
    }
    refetch();
  };

  return { favorites: userFavorites ? userFavorites[key] : [], toggleFavorite: toggleFav };
};
