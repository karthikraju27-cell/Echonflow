import { redirect } from "next/navigation";

// Public sample: linked from Seeker without requiring a child account.
export default function WonderWellPage() {
  redirect("/wonderwell/feelings-forest/index.html");
}
