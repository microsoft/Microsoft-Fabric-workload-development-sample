import { GenericItem } from "./ItemCRUDModel";


export interface GenericItemAndPath extends GenericItem {
    selectedPath: string;
}