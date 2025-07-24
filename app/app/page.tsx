import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import WritingCanvas from "../components/WritingCanvas";

export default function Home() {
  return (
    <>
      <SignedIn>
        <WritingCanvas />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
