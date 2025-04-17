import { PeerOptions } from "peerjs";
import { MessagePayload, PeerParty, PeerPartyEvents } from "./peer-party";
import { useEffect, useRef } from "react";
import EventEmitter from "eventemitter3";

export function createPeerParty<PartyEvents extends Record<string, unknown>>(options?: PeerOptions) {
  const instance = new PeerParty<PartyEvents>(options)

  function usePeer() {
    return instance
  }

  function useOnMessage<T extends keyof PartyEvents>(type: T, callback: (message: MessagePayload<T, PartyEvents[T]>) => void) {
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

  function useSendMessage<T extends keyof PartyEvents>(type: T, data: PartyEvents[T]) {
    const peerInstance = usePeer()

    useEffect(() => {
      peerInstance.sendMessage(type, data)
    }, [type, data, peerInstance])
  }

  function usePeerEvent<T extends keyof PeerPartyEvents>(type: T, callback: (...args: EventEmitter.ArgumentMap<PeerPartyEvents>[Extract<T, keyof PeerPartyEvents>]) => void) {
    const peerInstance = usePeer()

    const callbackRef = useRef(callback)
    callbackRef.current = callback

    useEffect(() => {
      const cn: typeof callback = (...args) => {
        callbackRef.current(...args)
      }

      peerInstance.on(type, cn)

      return () => {
        peerInstance.off(type, cn)
      }
    }, [type, callback, peerInstance])
  }

  return { instance, useOnMessage, useSendMessage, usePeer, usePeerEvent }
}