import "allotment/dist/style.css";

import { ClusterList, ConsumerGroupsPage, SchemasPage, Settings, TopicsPage } from "@pages";
import { Route, Routes } from "react-router-dom";

export const Routing = () => (
  <Routes>
    {/* Clusters */}
    <Route index element={<ClusterList />} />
    <Route path="/clusters" element={<ClusterList />} />
    <Route path="/cluster/:clusterId/clusters" element={<ClusterList />} />
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
