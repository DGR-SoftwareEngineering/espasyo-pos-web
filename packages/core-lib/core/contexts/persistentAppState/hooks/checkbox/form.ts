import { useReducer } from "react";

export type CheckboxFormValues = {
  [key: string]: Record<string, boolean>;
};

type Payload = { key: string; form: Record<string, boolean> };
type Action = { type: "saveForm"; payload: Payload };

const INITIAL_STATE: CheckboxFormValues = {};

export const reducer = (state: CheckboxFormValues, action: Action) => {
  switch (action.type) {
    case "saveForm":
      return { ...state, [action.payload.key]: action.payload.form };
    default:
      return state;
  }
};

export const useCheckboxFormState = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const saveForm = (payload: Payload) => {
    dispatch({ type: "saveForm", payload });
  };

  return { state, saveForm };
};
