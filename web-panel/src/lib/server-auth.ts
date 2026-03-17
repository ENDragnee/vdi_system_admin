import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";


export async function getSession() {
  const session = await getServerSession(authOptions);

  if(!session || !session.user?.id) {
    return redirect("/auth");
  }

  return session;
}

export async function getApiSession() {
  const session = await getServerSession(authOptions);

  return session;
}
