import { ComponentType } from "react";
import { useParams } from "react-router-dom";

/// helper to inject url params as props
export function withPropsFromUrlParams<T extends JSX.IntrinsicAttributes>(
  Component: (props: T) => JSX.Element,
): ComponentType {
  const PageComponent = () => {
    const params = useParams() as unknown as T;
    return <Component {...params} />;
  };
  return PageComponent;
}
