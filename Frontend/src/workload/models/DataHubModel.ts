import { ItemReference } from "./ItemCRUDModel";


export interface SelectedItemAndPath extends ItemReference {
    selectedPath: string;
}