import React from "react";
import { UserCreateProvider } from "./UserCreateContext";
import { UserCreateForm } from "./UserCreateForm";

export const UserCreateBlock: React.FC = () => (
  <UserCreateProvider>
    <UserCreateForm />
  </UserCreateProvider>
);
