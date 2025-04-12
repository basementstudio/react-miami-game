import Peer, { DataConnection, PeerOptions } from "peerjs";
import { EventEmitter } from "eventemitter3";

type PeerPartyEvents = {
  'open': (id: string) => void
  'disconnected': () => void
  'close': () => void
  'connection': (connection: DataConnection) => void
  'message': (payload: MessagePayload) => void
}

export type MessageType<T = string, D = unknown> = {
  type: T
  data: D
}

export type MessagePayload<T = string, D = unknown> = MessageType<T, D> & {
  fromId: string
}

export class PeerParty {
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
      connection.on('close', () => {
        delete this.connections[connection.peer]
      })
      this.EE.emit('connection', connection)
      this.connections[connection.peer] = connection
    })
  }

  connectToPeer(peerId: string) {
    this.instance.connect(peerId)
  }

  onMessage<D = unknown, T = string>(type: T, callback: (payload: MessagePayload<T, D>) => void) {
    this.EE.on('message', (payload) => {
      const message = payload as unknown as MessagePayload<T, D>
      if (message.type === type) {
        callback(message)
      }
    })
  }

  sendMessageTo<D = unknown, T = string>(peerId: string, type: T, data: D) {
    this.connections[peerId].send({ type, data })
  }

  sendMessage<D = unknown, T = string>(type: T, data: D) {
    Object.values(this.connections).forEach((connection) => {
      connection.send({ type, data })
    })
  }

  destroy() {
    this.instance.destroy()
    this.EE.removeAllListeners()
  }
}
