import { Allotment } from "allotment";
import { useParams, useNavigate } from "react-router-dom";
import { ConsumerGroup } from "./consumer-group";
import { ConsumerGroupsList } from "./consumer-groups-list";

export const ConsumerGroupsPage = () => {
  const { clusterId, consumerName } = useParams();
  if (!clusterId) {
    throw Error("Invalid path. Missing clusterId.");
  }
  const navigate = useNavigate();
  return (
    <Allotment>
      <Allotment.Pane minSize={430} maxSize={consumerName ? 600 : undefined}>
        <ConsumerGroupsList
          clusterId={clusterId}
          onConsumerSelected={(selectedConsumer) => navigate(`/cluster/${clusterId}/consumer/${selectedConsumer}`)}
        />
      </Allotment.Pane>
      {consumerName && (
        <Allotment.Pane minSize={300}>
          <ConsumerGroup name={consumerName} clusterId={clusterId} />
        </Allotment.Pane>
      )}
    </Allotment>
  );
};
