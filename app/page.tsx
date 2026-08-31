import HomePage from "@/components/HomePage";
import { getDict } from "@/lib/i18n";

export default function Page() {
  return <HomePage dict={getDict("en")} locale="en" />;
}
