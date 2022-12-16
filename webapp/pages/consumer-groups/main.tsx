import { useSessionStorage } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { TwoColumnPage } from "../common";
import { ConsumerGroup } from "./consumer-group";
import { ConsumerGroupsList } from "./consumer-groups-list";

export const ConsumerGroupsPage = () => {
  const { clusterId, consumerName: navConsumerName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `consumer-main-${clusterId}`,
    defaultValue: {
      consumerName: navConsumerName,
    },
  });

  if (!clusterId) {
    throw Error("Invalid path. Missing clusterId.");
  }

  return (
    <TwoColumnPage
      title="Consumer groups"
      left={
        <ConsumerGroupsList clusterId={clusterId} onConsumerSelected={(consumerName) => setState({ consumerName })} />
      }
      right={state.consumerName && <ConsumerGroup name={state.consumerName} clusterId={clusterId} />}
    />
  );
};
