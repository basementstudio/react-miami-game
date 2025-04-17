# PeerJS React

```bash
pnpm add peerjs peerjs-react
```

```tsx
import { createPeerParty } from "peerjs-react";


// define the messages types
type VehicleControlMessages = {
  "steeringAngle": number;
  "accelerationPressed": boolean;
  "brakePressed": boolean;
}

// create your typed hooks
const {
  instance,
  usePeer,
  useOnMessage,
  useSendMessage,
  usePeerEvent
} = createPeerParty<VehicleControlMessages>();
```

## instance

Get the peer instance.

```tsx
// connect to a peer
instance.connectToPeer("other-peer-id");

// send message to all peers
instance.sendMessage("steeringAngle", 0);

// send message to a specific peer
instance.sendMessageTo("peer-id", "steeringAngle", acceleration)

// listener for connection events
instance.on("connection", (connection) => {});
```

## useOnMessage

Listen for messages from other peers.

```tsx
useOnMessage("steeringAngle", (message) => {
  message.data // number
});
```

## useSendMessage

Send react state to other peers.

```tsx
const [accelerationPressed, setAccelerationPressed] = useState(false);

useSendMessage("accelerationPressed", accelerationPressed);
```

## usePeerEvent

Listen for events from the peer instance.

```tsx
usePeerEvent("connection", () => {
  // handle connection
});

usePeerEvent("disconnected", () => {
  // handle disconnection
});
```

## usePeer

Get the peer instance. You can also access the peer instance from the `instance` object.

```tsx
const peer = usePeer();

peer.connectToPeer("other-peer-id");

peer.on("connection", (connection) => {
  // handle connection
});

peer.sendMessage("steeringAngle", 0);
```
