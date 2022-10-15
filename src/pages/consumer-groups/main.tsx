import { Allotment } from "allotment";
import { useParams } from "react-router-dom";
import { ConsumerGroupsList } from "./consumer-groups-list";

export const ConsumerGroupsPage = () => {
  const { clusterId, schemaName } = useParams();
  return (
    <Allotment>
      <Allotment.Pane minSize={455} maxSize={schemaName ? 600 : undefined}>
        <ConsumerGroupsList
          clusterId={clusterId!}
          onConsumerSelected={(selectedConsumer) => console.log(selectedConsumer)}
        />
      </Allotment.Pane>
      {/* {schemaName && (
          <Allotment.Pane minSize={300}>
            <Schema clusterId={clusterId!} schemaName={schemaName} />
          </Allotment.Pane>
        )} */}
    </Allotment>
  );
};
