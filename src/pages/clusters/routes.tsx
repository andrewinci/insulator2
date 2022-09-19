import { Route, Routes } from "react-router-dom";
import { ClusterList } from "./cluster-list";
import { EditCluster } from "./edit-clusters";

export const Clusters = () => (
  <Routes>
    <Route index element={<ClusterList />} />
    <Route path="new" element={<EditCluster />} />
    <Route path="edit/:clusterId" element={<EditCluster />} />
  </Routes>
);
