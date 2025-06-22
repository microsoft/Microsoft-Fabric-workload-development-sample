import { GenericItem } from "./ItemCRUDModel";


export interface SelectedItemAndPath extends GenericItem {
    selectedPath: string;
}