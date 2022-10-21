import { useMemo, useState } from "react";
import { useNotifications } from "../../providers";
import { getConsumerGroups } from "../../tauri/admin";
import { format, TauriError } from "../../tauri/error";
import { ItemList } from "../common";

type SchemaListProps = {
  clusterId: string;
  onConsumerSelected: (consumerName: string) => void;
};

export const ConsumerGroupsList = (props: SchemaListProps) => {
  const { clusterId, onConsumerSelected } = props;
  const { alert, success } = useNotifications();
  const [state, setState] = useState<{ consumers: string[]; search?: string; loading: boolean }>({
    consumers: [],
    loading: true,
  });

  const updateSchemasList = (force = false) => {
    setState({ ...state, loading: true });
    getConsumerGroups(clusterId, force)
      .then((consumers) => setState({ consumers, loading: false }))
      .then((_) => success("List of consumer groups successfully retrieved"))
      .catch((err: TauriError) => {
        alert(`Unable to retrieve the list of consumers.`, format(err));
        setState({ consumers: [], loading: false });
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateSchemasList(), [clusterId]);

  return (
    <ItemList
      title="CGroups"
      listId={`consumer-groups-${clusterId}`}
      loading={state.loading}
      items={state.consumers}
      onItemSelected={onConsumerSelected}
      onRefreshList={() => updateSchemasList(true)}
    />
  );
};
