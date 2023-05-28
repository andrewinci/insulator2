import { it, describe } from "vitest";
import { render } from "@testing-library/react";
import { TopicInfoModal } from "./topic-info-modal";

describe("topicInfoModal", () => {
  it("should render", () => {
    render(<TopicInfoModal clusterId="cluster-id" topicName="topic-name" />);
  });
});
