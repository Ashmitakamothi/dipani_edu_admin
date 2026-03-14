import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SignIn | Dipani Global Edu"
        description="This is the SignIn page for Dipani Global Edu"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
