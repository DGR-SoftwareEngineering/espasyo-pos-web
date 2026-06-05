import { CustomerRegistrationFormType as CustomerRegistrationType, customerRegistrationSchema } from '../validation'
import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { FeatureConfigBuilder } from 'core-lib/core/types/constants/feature-config.builder';

const config = new FeatureConfigBuilder<{}>("customer-registration");
const SUBMISSION_KEYS = config.build().SUBMISSION_KEYS;

interface UseCustomerRegistrationFormProps {
    resetForm?: boolean;
    onSubmit: (values: CustomerRegistrationType) => void;
}

export const useCustomerRegistrationForm = ({
onSubmit,
resetForm
}: UseCustomerRegistrationFormProps) => {
    const submissionKey = SUBMISSION_KEYS.create;

    const form = useBaseForm<CustomerRegistrationType>({
        schema: customerRegistrationSchema,
        defaultValues: {
            username: "",
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            confirmPassword: ""
        },
        isInDialog: false,
        isEdit: false,
        resetForm,
        onSubmit,
        submissionKey,
    });

    const { watch } = form;

    const watchedValues = {
        username: watch("username"),
        email: watch("email"),
        password: watch("password"),
        firstName: watch("firstName"),
        lastName: watch("lastName"),
        confirmPassword: watch("confirmPassword"),
    }

    return {
        ...form,
        watchedValues,
        submissionKey,
    }
}