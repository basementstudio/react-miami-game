import { create } from 'zustand'
import Peer, { DataConnection, type PeerOptions } from 'peerjs'

interface PeerState {
  peer: Peer | null
  connections: Record<string, DataConnection>
  isConnected: boolean
  peerId: string | null
  // Actions
  initializePeer: (options?: PeerOptions) => void
  connectToPeer: (remotePeerId: string) => Promise<void>
  disconnectFromPeer: (remotePeerId: string) => void
  destroyPeer: () => void
}

export const usePeerStore = create<PeerState>((set, get) => ({
  peer: null,
  connections: {},
  isConnected: false,
  peerId: null,

  initializePeer: (options?: PeerOptions) => {
    const peerInstance = new Peer(options || {})

    peerInstance.on('open', (id) => {
      set({
        peer: peerInstance,
        isConnected: true,
        peerId: id
      })
    })

    peerInstance.on('disconnected', () => {
      set({ isConnected: false })
    })

    peerInstance.on('close', () => {
      set({
        isConnected: false,
        peerId: null
      })
    })

    peerInstance.on('connection', (connection) => {
      set({
        connections: { ...get().connections, [connection.peer]: connection }
      })
    })
  },

  connectToPeer: async (remotePeerId: string) => {
    const { peer, connections } = get()
    if (!peer) throw new Error('Peer not initialized')

    const connection = peer.connect(remotePeerId)

    await new Promise((resolve, reject) => {
      connection.on('open', () => {
        const newConnections = { ...connections }
        newConnections[remotePeerId] = connection
        set({ connections: newConnections })
        resolve(undefined)
      })

      connection.on('error', (error) => {
        reject(error)
      })
    })
  },

  disconnectFromPeer: (remotePeerId: string) => {
    const { connections } = get()
    const connection = connections[remotePeerId]
    if (connection) {
      connection.close()
      const newConnections = { ...connections }
      delete newConnections[remotePeerId]
      set({ connections: newConnections })
    }
  },

  destroyPeer: () => {
    const { peer, connections } = get()
    if (peer) {
      // Close all connections
      Object.values(connections).forEach((connection) => connection.close())
      peer.destroy()
      set({
        peer: null,
        connections: {},
        isConnected: false,
        peerId: null
      })
    }
  }
})) 