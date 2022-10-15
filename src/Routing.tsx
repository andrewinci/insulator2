import { Route, Routes } from "react-router-dom";
import { Settings, TopicsPage, SchemasPage, ConsumerGroupsPage } from "./pages";
import "allotment/dist/style.css";
import { ClusterList, AddNewCluster, EditCluster } from "./pages/clusters";

export const Routing = () => (
  <Routes>
    {/* Clusters */}
    <Route index element={<ClusterList />} />
    <Route path="/clusters" element={<ClusterList />} />
    <Route path="/cluster/:clusterId/clusters" element={<ClusterList />} />
    <Route path="cluster/new" element={<AddNewCluster />} />
    <Route path="cluster/edit/:clusterId" element={<EditCluster />} />
    {/* Topics */}
    <Route path="/cluster/:clusterId/topics" element={<TopicsPage />} />
    <Route path="/cluster/:clusterId/topic/:topicName" element={<TopicsPage />} />
    {/* Schemas */}
    <Route path="/cluster/:clusterId/schemas" element={<SchemasPage />} />
    <Route path="/cluster/:clusterId/schema/:schemaName" element={<SchemasPage />} />
    {/* Consumer groups */}
    <Route path="/cluster/:clusterId/consumers" element={<ConsumerGroupsPage />} />
    <Route path="/cluster/:clusterId/consumer/:consumerName" element={<ConsumerGroupsPage />} />
    {/* Settings */}
    <Route path="/cluster/:clusterId/settings" element={<Settings />} />
  </Routes>
);
