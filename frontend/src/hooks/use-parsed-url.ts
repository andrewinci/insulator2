import { matchPath, useLocation } from "react-router-dom";
import { useUserSettings } from "../providers";

/// get the cluster name from the cluster id in the url
export const useParsedUrl = () => {
  const location = useLocation();
  const { userSettings: appState } = useUserSettings();
  const { base } = matchPath("/:base/*", location.pathname)?.params ?? {};
  const pathPattern =
    base === "modal" ? "/modal/cluster/:clusterId/:activeItem/*" : "/cluster/:clusterId/:activeItem/*";
  const { clusterId, activeItem } = matchPath(pathPattern, location.pathname)?.params ?? {};
  const clusterName = appState.clusters.find((c) => c.id == clusterId)?.name;
  return {
    isModal: base === "modal",
    clusterName,
    clusterId,
    activeItem,
  };
};
