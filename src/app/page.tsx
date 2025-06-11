"use client"
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import SignIn from "@/component/signin";


export default function Home() {

  return (
 <>
  <SignIn/>
</>
  )
}
