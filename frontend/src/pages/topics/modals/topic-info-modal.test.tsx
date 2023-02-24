import { it, describe } from "vitest";
import { render } from "@testing-library/react";
import { TopicInfoModal } from "./topic-info-modal";
import { TopicInfo } from "../../../models";

describe("topicInfoModal", () => {
  it("should render", () => {
    const testTopicInfo: TopicInfo = {
      configurations: { ["sample.ms"]: "123", ["sample.bytes"]: "1233", sampe: "321" },
      name: "Topic name",
      partitions: [],
    };
    render(<TopicInfoModal topicInfo={testTopicInfo} />);
  });
});
