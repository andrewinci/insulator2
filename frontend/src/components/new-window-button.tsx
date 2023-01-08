import { ActionIcon, Tooltip } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons";
import { WebviewWindow } from "@tauri-apps/api/window";
import { useParsedUrl } from "../hooks";

type NewWindowButtonProps = {
  url: string;
  windowTitle: string;
  iconSize?: number;
};
export const NewWindowButton = (props: NewWindowButtonProps) => {
  const { url, windowTitle, iconSize } = props;
  const { isModal, openNewWindow } = useWindowHandler();
  return (
    <Tooltip hidden={isModal} label="Open in a new window">
      <ActionIcon
        hidden={isModal}
        onClick={() =>
          openNewWindow({
            url,
            windowTitle,
          })
        }>
        <IconExternalLink size={iconSize ?? 22} />
      </ActionIcon>
    </Tooltip>
  );
};

export const useWindowHandler = () => {
  const { isModal, clusterName } = useParsedUrl();
  return {
    isModal,
    openNewWindow: (params: { url: string; windowTitle: string }) => {
      const { url, windowTitle } = params;
      // check if the window is already open
      const currentWebView = WebviewWindow.getByLabel(url);
      if (currentWebView) {
        // just focus the already open window
        currentWebView.setFocus();
        return;
      }
      const webview = new WebviewWindow(url, {
        url,
        title: `${clusterName} - ${windowTitle}`,
        width: 650,
        height: 790,
        minWidth: 660,
        minHeight: 790,
      });

      // since the webview window is created asynchronously,
      // Tauri emits the `tauri://created` and `tauri://error` to notify you of the creation response
      webview.once("tauri://created", () => {
        //console.log("Created");
      });
      webview.once("tauri://error", (e) => {
        console.error(`Unable to open the new window`);
        console.error(e);
      });
    },
  };
};
