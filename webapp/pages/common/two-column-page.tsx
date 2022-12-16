import { useSessionStorage } from "@mantine/hooks";
import { Allotment, LayoutPriority } from "allotment";
import { useParams } from "react-router-dom";
import { MinimizeButton } from "../../components";
import { Title } from "@mantine/core";

type TwoColumnPageProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export const TwoColumnPage = ({ title, left, right }: TwoColumnPageProps) => {
  const { clusterId } = useParams();
  const [state, setState] = useSessionStorage({
    key: `two-column-page-${clusterId}-${title}`,
    defaultValue: {
      minimized: false,
    },
  });

  if (!clusterId) {
    throw Error("Missing clusterId in path!");
  }
  const minimizedSize = 40;

  return (
    <Allotment>
      <Allotment.Pane
        minSize={state.minimized ? minimizedSize : 430}
        preferredSize={right ? 600 : "100%"}
        maxSize={state.minimized ? minimizedSize : undefined}>
        {state.minimized && (
          <Title
            style={{
              marginTop: "-6px",
              transformOrigin: "8px 24px",
              transform: "rotate(90deg)",
              width: "200px",
              height: "20px",
            }}
            size={19}>
            {title}
          </Title>
        )}
        {!state.minimized && left}
        {right && (
          <MinimizeButton
            minimizeTarget="itemList"
            minimized={state.minimized}
            onClick={() => setState((s) => ({ ...s, minimized: !state.minimized }))}
          />
        )}
      </Allotment.Pane>
      <Allotment.Pane priority={LayoutPriority.High} preferredSize={right ? "100%" : 0} minSize={right ? 520 : 0}>
        {right}
      </Allotment.Pane>
    </Allotment>
  );
};
