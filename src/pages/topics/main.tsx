import { Allotment } from "allotment";
import { useNavigate, useParams } from "react-router-dom";
import { Topic } from "./topic";
import { TopicList } from "./topic-list";

export const TopicsPage = () => {
  const navigate = useNavigate();
  const { clusterId, topicName } = useParams();
  if (!clusterId) {
    throw Error("Missing clusterId in path!");
  }
  const topicList = (
    <TopicList
      clusterId={clusterId}
      onTopicSelected={(activeTopic) => navigate(`/cluster/${clusterId}/topic/${activeTopic}`)}
    />
  );
  if (topicName) {
    return (
      <Allotment>
        <Allotment.Pane minSize={430} maxSize={topicName ? 600 : undefined}>
          {topicList}
        </Allotment.Pane>
        {topicName && (
          <Allotment.Pane minSize={520}>
            <Topic clusterId={clusterId} topicName={topicName} />
          </Allotment.Pane>
        )}
      </Allotment>
    );
  } else {
    return topicList;
  }
};
