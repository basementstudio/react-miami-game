import { PeerOptions } from "peerjs";
import { MessagePayload, PeerParty } from "./peer-party";
import { useEffect, useRef } from "react";

export function createPeerParty<PartyEvents extends Record<string, unknown>>(options?: PeerOptions) {
  const instance = new PeerParty<PartyEvents>(options)

  function usePeer() {
    return instance
  }

  function usePeerCallback<T extends keyof PartyEvents>(type: T, callback: (message: MessagePayload<T, PartyEvents[T]>) => void) {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    const peerInstance = usePeer()

    useEffect(() => {
      peerInstance.onMessage(type, (message) => {
        callbackRef.current(message)
      })

      return () => {
        peerInstance.removeMessageListener(callbackRef.current)
      }
    }, [type, peerInstance])
  }

  function useSendPeerMessage<T extends keyof PartyEvents>(type: T, data: PartyEvents[T]) {
    const peerInstance = usePeer()

    useEffect(() => {
      peerInstance.sendMessage(type, data)
    }, [type, data, peerInstance])
  }

  return { instance, usePeerCallback, useSendPeerMessage, usePeer }
}