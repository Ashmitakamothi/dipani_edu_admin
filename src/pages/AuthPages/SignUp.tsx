import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="SignUp | Dipani Global Edu"
        description="This is the SignUp page for Dipani Global Edu"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
