import { Injectable } from '@angular/core';
import { PersistColumn, PersistObject, PersistObjectsModel,CustomPersistObjectsModel} from '../models/persist.model';

@Injectable({
  providedIn: 'root'
})
export class PersistService {

  createPersistColumn(Name: string, Value: any): PersistColumn {
    return new PersistColumn(Name, Value);
  }

  createPersistObject(objectType: string, mode: number, columns: PersistColumn[], id?: string): PersistObject {
    const objectKey: { ObjectType: string; Id?: string } = { ObjectType: objectType };
    
    if (id) {
        objectKey.Id = id;
    }

    return new PersistObject(objectKey, mode, columns);
}


buildPersistObjectModel(OutputMode: number, object: PersistObject): PersistObjectsModel {
  return new PersistObjectsModel(OutputMode, object);  
}

buildCustomPersistObjectModel(OutputMode: number, objects: PersistObject[]): CustomPersistObjectsModel {
  return new CustomPersistObjectsModel(OutputMode, [objects]); 
}


}
