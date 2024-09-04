export class PersistColumn {
    Name: string;
    Value: any;
  
    constructor(Name: string, Value: any) {
      this.Name = Name;
      this.Value = Value;
    }
  }
  
  export class PersistObjectKey {
    ObjectType: string;
    Id?: string;
    constructor(ObjectType: string, Id?: string) {
      this.ObjectType = ObjectType;
      if (Id) this.Id = Id;
    }
  }
  
  export class PersistObject {
    ObjectKey: PersistObjectKey;
    Mode: Number;
    TargetColumns: PersistColumn[];
  
    constructor(ObjectKey: PersistObjectKey, Mode: Number, TargetColumns: PersistColumn[]) {
      this.ObjectKey = ObjectKey;
      this.Mode = Mode;
      this.TargetColumns = TargetColumns;
    }
  }
  
  export class PersistObjectsModel {
    OutputMode: number;
    Object: PersistObject; 
    constructor(OutputMode: number, Object: PersistObject) {
        this.OutputMode = OutputMode;
        this.Object = Object;  
    }

}

export class CustomPersistObjectsModel {
  OutputMode: number;
  Objects: PersistObject[][]; 

  constructor(OutputMode: number, Objects: PersistObject[][]) {
    this.OutputMode = OutputMode;
    this.Objects = Objects;
  }
}



  