import { Route, Routes } from "react-router-dom";
import { Settings, TopicsPage, SchemasPage, ConsumerGroupsPage } from "./pages";
import "allotment/dist/style.css";
import { ClusterListPage } from "./pages/clusters";

export const Routing = () => (
  <Routes>
    {/* Clusters */}
    <Route index element={<ClusterListPage />} />
    <Route path="/clusters" element={<ClusterListPage />} />
    <Route path="/cluster/:clusterId/clusters" element={<ClusterListPage />} />
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
    <Route path="/settings" element={<Settings />} />
  </Routes>
);
