import { invoke } from "@tauri-apps/api";
import { Favorites, UserSettings } from "../models";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const getFavorites = (clusterId: string): Promise<Favorites> =>
  invoke<UserSettings>("get_configuration")
    .catch((err: TauriError) => {
      addNotification({ type: "error", title: "Unable to retrieve the user config", description: format(err) });
      throw err;
    })
    .then((v) => v.clusters.find((c) => c.id == clusterId))
    .then((f) => {
      if (f) return f.favorites;
      else throw "Cluster not found trying to retrieve favs";
    });

export const setFavorites = async (clusterId: string, favorites: Favorites): Promise<UserSettings> => {
  console.log(favorites);
  const userSettings = await invoke<UserSettings>("get_configuration");
  const clusterToEdit = userSettings.clusters.find((c) => c.id == clusterId);
  if (!clusterToEdit) {
    throw "Cluster not found trying to set the favs";
  }
  const newCluster = { ...clusterToEdit, favorites };
  const newSettings: UserSettings = {
    ...userSettings,
    clusters: [...userSettings.clusters.filter((c) => c.id != newCluster.id), newCluster],
  };
  return await setConfiguration(newSettings);
};

export const getConfiguration = (): Promise<UserSettings> =>
  invoke<UserSettings>("get_configuration").catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to retrieve the user config", description: format(err) });
    throw err;
  });

export const setConfiguration = (configuration: UserSettings): Promise<UserSettings> =>
  invoke<UserSettings>("write_configuration", { configuration }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to update the user config", description: format(err) });
    throw err;
  });
