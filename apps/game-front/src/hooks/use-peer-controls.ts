import { createPeerParty } from "peerjs-react";

type ControlsMessage = {
  "steeringAngle": number;
  "acceleration": boolean;
  "brake": boolean;
}

export const {
  instance: controlsInstance,
  // send messages
  useSendMessage: useSendControlsMessage,
  // receive messages
  useOnMessage: useOnControlsMessage,
  // peer events
  usePeerEvent: useControlsPeerEvent,
} = createPeerParty<ControlsMessage>()