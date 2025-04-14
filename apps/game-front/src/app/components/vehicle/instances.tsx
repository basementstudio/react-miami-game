"use client";

import type { ComponentProps, JSX, PropsWithChildren } from "react";
import type { StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";
import { Instances, type Instance } from "@react-three/drei";

export type InstanceProps = ComponentProps<typeof Instance>;

export const createInstance = () => {
  const useStore = create<{
    instance: typeof Instance;
  }>(() => ({
    instance: null as unknown as typeof Instance,
  }));

  function Provider(props: ComponentProps<typeof Instances>) {
    return <InstancesProvider store={useStore} {...props} />;
  }

  function Client(props: PropsWithChildren<InstanceProps>): JSX.Element {
    const InstanceResult = useStore((s) => s.instance);
    return <InstanceResult {...props} />;
  }

  return [Provider, Client] as const;
};

type InstanceStore = UseBoundStore<
  StoreApi<{
    instance: typeof Instance;
  }>
>;

interface InstancesProviderProps extends ComponentProps<typeof Instances> {
  store: InstanceStore;
}

function InstancesProvider({
  store,
  children,
  ...props
}: PropsWithChildren<InstancesProviderProps>): JSX.Element {
  return (
    <Instances {...props}>
      {
        ((InstanceResult: unknown) => {
          store.setState({ instance: InstanceResult as typeof Instance });
          return children as JSX.Element;
        }) as unknown as JSX.Element
      }
    </Instances>
  );
}
