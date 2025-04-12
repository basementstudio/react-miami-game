import { createPeerParty } from "@/peer-party";

export const {
  instance: controlsInstance,
  // send messages
  useSendPeerMessage: useSendControlsMessage,
  // receive messages
  usePeerCallback: useControlsCallback,
} = createPeerParty()