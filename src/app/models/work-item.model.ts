export class WorkItem {
    constructor(
      public id: string,
      public designation: string,
      public personInPower: string,
      public priority: string,
      public status: string,
      public SeqNr: string
    ) {}
  }
  
  export class WorkItemResponse {
    WorkItem: Array<{
      Id: string;
      Designation: string;
      PersonInPower: string;
      Priority: string;
      Status: string;
      SeqNr: string;
    }>;
  
    constructor(WorkItem: Array<{
      Id: string,
      Designation: string,
      PersonInPower: string,
      Priority: string,
      Status: string,
      SeqNr: string
    }>) {
      this.WorkItem = WorkItem;
    }
  }
  