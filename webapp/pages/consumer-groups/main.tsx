import { useLocalStorage } from "@mantine/hooks";
import { Allotment } from "allotment";
import { useParams } from "react-router-dom";
import { ConsumerGroup } from "./consumer-group";
import { ConsumerGroupsList } from "./consumer-groups-list";

export const ConsumerGroupsPage = () => {
  const { clusterId, consumerName: navConsumerName } = useParams();
  const [state, setState] = useLocalStorage({
    key: `consumer-main-${clusterId}`,
    defaultValue: {
      consumerName: navConsumerName,
    },
  });

  if (!clusterId) {
    throw Error("Invalid path. Missing clusterId.");
  }

  return (
    <Allotment>
      <Allotment.Pane minSize={430} maxSize={state.consumerName ? 600 : undefined}>
        <ConsumerGroupsList clusterId={clusterId} onConsumerSelected={(consumerName) => setState({ consumerName })} />
      </Allotment.Pane>

      <Allotment.Pane minSize={300}>
        {state.consumerName && <ConsumerGroup name={state.consumerName} clusterId={clusterId} />}
      </Allotment.Pane>
    </Allotment>
  );
};
