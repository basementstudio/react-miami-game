export function packMessage(object: unknown, _type: 'string' | 'binary' = 'binary'): string {
  return JSON.stringify(object)
}

export function unpackMessage<T>(message: string): T {
  return JSON.parse(message)
}