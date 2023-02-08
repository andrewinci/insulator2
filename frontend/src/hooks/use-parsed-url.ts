import { matchPath, useLocation } from "react-router-dom";
import { useUserSettings } from "../providers";

export const isRunningInModal = (location: string): boolean => {
  const { base } = matchPath("/:base/*", location)?.params ?? {};
  return base === "modal";
};

/// get the cluster name from the cluster id in the url
export const useParsedUrl = () => {
  const location = useLocation();
  const { userSettings: appState } = useUserSettings();
  const isModal = isRunningInModal(location.pathname);
  const pathPattern = isModal ? "/modal/cluster/:clusterId/:activeItem/*" : "/cluster/:clusterId/:activeItem/*";
  const { clusterId, activeItem } = matchPath(pathPattern, location.pathname)?.params ?? {};
  const clusterName = appState.clusters.find((c) => c.id == clusterId)?.name;
  return {
    isModal,
    clusterName,
    clusterId,
    activeItem,
  };
};
