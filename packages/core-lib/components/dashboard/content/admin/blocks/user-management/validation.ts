import * as yup from "yup";


export const selectRoleSchema = yup.object({
    roleId: yup.string().required("").default(""),
    roleName: yup.string().required("Select a role from dropdown").default("")
});

export const createUserSchema = yup.object({
    roleId: yup.string().required("Select a Role from dropdown").default(""),
    userName: yup.string().required("Enter Username field").default(""),
    password: yup.string().required("Enter Password field").default(""),
    firstName: yup.string().required("Enter First Name field").default(""),
    lastName: yup.string().required("Enter Last Name field").default(""),
    middleName: yup.string().notRequired().default(""),  
    email: yup.string().required("Enter Email field").default(""),
    contactNumber: yup.string().required("Enter Contact Number field").default(""),
}); 

export type CreateUserType = yup.InferType<typeof createUserSchema>;
export type SelectRoleType = yup.InferType<typeof selectRoleSchema>;