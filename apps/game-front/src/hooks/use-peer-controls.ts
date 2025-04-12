import { createPeerParty } from "@/peer-party";

type ControlsMessage = {
  "steeringAngle": number;
}

export const {
  instance: controlsInstance,
  // send messages
  useSendMessage: useSendControlsMessage,
  // receive messages
  useOnMessage: useControlsCallback,
  // peer events
  usePeerEvent: useControlsPeerEvent,
} = createPeerParty<ControlsMessage>()