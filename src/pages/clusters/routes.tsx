import { Route, Routes } from "react-router-dom";
import { ClusterList } from "./cluster-list";
import { AddNewCluster, EditCluster } from "./edit-clusters";

export const Clusters = () => (
  <Routes>
    <Route index element={<ClusterList />} />
    <Route path="new" element={<AddNewCluster />} />
    <Route path="edit/:clusterId" element={<EditCluster />} />
  </Routes>
);
