import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
       <div className="relative">
         {/* Background glow for aesthetic */}
         <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full" />
         <SignUp />
      </div>
    </div>
  );
}
