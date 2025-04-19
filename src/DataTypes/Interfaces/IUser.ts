import { AccountStatusType, CategoryType } from "../types/IUserType";
import { UserCategory } from "../enums/IUserEnums";


export interface IsystemAdmin {
    id?: any;
    email: string;
    password: string;
    name: string
    phoneNumber?: string;
    category?: UserCategory,
    permissions?: string[]
}
export interface IloginUser {
    email: string;
    password: string;
    accountStatus?: AccountStatusType
}
export interface IUser extends IloginUser {
    id: any;
    name: string;
    phoneNumber: string;
    address: string;
    category: CategoryType
    permissions?: string[];
}