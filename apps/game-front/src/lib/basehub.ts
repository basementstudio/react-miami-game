import { basehub, Client, fragmentOn } from "basehub"

export class BaseHubService {
  private static instance: BaseHubService | null = null
  client: Client

  private constructor() {
    this.client = basehub()
  }

  static getInstance() {
    if (!BaseHubService.instance) {
      BaseHubService.instance = new BaseHubService()
    }
    return BaseHubService.instance
  }
}

export const client = () => {
  return BaseHubService.getInstance().client
}

// query

export const assetsQuery = fragmentOn("Query", {
  models: {
    track: {
      url: true,
    },
  },
});
export type QueryType = fragmentOn.infer<typeof assetsQuery>;