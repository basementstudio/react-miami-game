/* eslint-disable @typescript-eslint/no-explicit-any */
import Peer, { DataConnection, PeerOptions } from "peerjs";
import { EventEmitter } from "eventemitter3";

export type PeerPartyEvents = {
  'open': (id: string) => void
  'disconnected': () => void
  'close': () => void
  'connection': (connection: DataConnection) => void
  'message': (payload: MessagePayload) => void
  'error': (error: Error) => void
}

export type MessageType<T = string, D = unknown> = {
  type: T
  data: D
}

export type MessagePayload<T = string, D = unknown> = MessageType<T, D> & {
  fromId: string
}

export class PeerParty<PartyEvents extends Record<string, unknown>> {
  instance: Peer
  id?: string
  isConnected?: boolean
  EE: EventEmitter<PeerPartyEvents>
  connections: Record<string, DataConnection> = {}

  constructor(options?: PeerOptions) {
    this.EE = new EventEmitter()

    this.instance = new Peer(options || {})
    this.instance.on('open', (id) => {
      this.id = id
      this.isConnected = true
      this.EE.emit('open', id)
    })
    this.instance.on('disconnected', () => {
      this.isConnected = false
      this.EE.emit('disconnected')
    })
    this.instance.on('close', () => {
      this.isConnected = false
      this.EE.emit('close')
    })
    this.instance.on('connection', (connection) => {
      this.EE.emit('connection', connection)
      this.connections[connection.peer] = connection

      const onMessageCallback = (payload: unknown) => {
        this.EE.emit('message', payload as any)
      }
      connection.on('data', onMessageCallback)
      // handle connection close
      connection.on('close', () => {
        delete this.connections[connection.peer]
      })
    })

    this.instance.on('error', (error) => {
      this.EE.emit('error', error)
    })
  }

  connectToPeer(peerId: string) {
    const conn = this.instance.connect(peerId)
    conn.on('open', () => {
      this.connections[peerId] = conn
    })
    conn.on('error', (error) => {
      this.EE.emit('error', error)
    })
    conn.on('close', () => {
      delete this.connections[peerId]
    })
  }

  onMessage<T extends keyof PartyEvents>(type: T, callback: (payload: MessagePayload<T, PartyEvents[T]>) => void) {
    this.EE.on('message', (payload) => {
      const valid = payload && typeof payload === 'object' && 'type' in payload && 'data' in payload
      if (!valid) return

      const message = payload as unknown as MessagePayload<T, PartyEvents[T]>
      if (message.type === type) {
        callback(message)
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  removeMessageListener(callback: Function) {
    this.EE.off('message', callback as any)
  }

  sendMessageTo<T extends keyof PartyEvents, D = PartyEvents[T]>(peerId: string, type: T, data: D) {
    this.connections[peerId].send({ type, data })
  }

  sendMessage<T extends keyof PartyEvents, D = PartyEvents[T]>(type: T, data: D) {
    if (!this.isConnected) {
      return
    }

    Object.values(this.connections).forEach((connection) => {
      connection.send({ type, data })
    })
  }

  addListener: EventEmitter<PeerPartyEvents>['addListener'] = (type, callback, context) => {
    return this.EE.addListener(type, callback, context)
  }

  removeListener: EventEmitter<PeerPartyEvents>['removeListener'] = (type, callback, context) => {
    return this.EE.removeListener(type, callback, context)
  }

  on: EventEmitter<PeerPartyEvents>['on'] = (type, callback, context) => {
    return this.EE.on(type, callback, context)
  }

  off: EventEmitter<PeerPartyEvents>['off'] = (type, callback, context) => {
    return this.EE.off(type, callback, context)
  }



  destroy() {
    this.instance.destroy()
    this.EE.removeAllListeners()
  }
}
