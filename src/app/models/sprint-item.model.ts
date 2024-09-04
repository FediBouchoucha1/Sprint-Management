
export class SprintItem {
  constructor(
    public id: string,
    public kind: string,
    public sprintName: string,
    public productRequirementName: string
  ) {}
}

export class SprintItemResponse {
  SprintItem: Array<{
    Id: string;
    Kind: string;
    SprintName: string;
    ProductRequirementName: string;
  }>;

  constructor(SprintItem: Array<{
    Id: string,
    Kind: string,
    SprintName: string,
    ProductRequirementName: string
  }>) {
    this.SprintItem = SprintItem;
  }
}
